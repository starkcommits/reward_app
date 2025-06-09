import frappe
import json
import requests
from frappe import _

def create_transaction_log(doc):
    try:
        user_id = doc.user_id
        total_amount = doc.amount * doc.quantity

        promo_balance = frappe.db.get_value("Promotional Wallet",user_id, 'balance')
        main_balance = frappe.db.get_value("User Wallet",user_id, 'balance')

        if promo_balance + main_balance < total_amount:
            raise Exception("Insufficient Balance")
            
        if promo_balance > 0:
            wallet_balance = promo_balance
            wallet_name = user_id
            transaction_amount = min(wallet_balance, total_amount)

            frappe.get_doc({
                'doctype': "Transaction Logs",
                'market_id': doc.market_id,
                'user': doc.user_id,
                'wallet_type': 'Promo',
                'order_id': doc.name,
                'transaction_amount': transaction_amount,
                'transaction_type': 'Debit',
                'transaction_status': 'Success',
                'transaction_method': 'WALLET'
            }).insert(ignore_permissions=True)

            total_amount -= transaction_amount
            new_wallet_balance = wallet_balance - transaction_amount

            frappe.db.set_value("Promotional Wallet", user_id, "balance", new_wallet_balance)

        if total_amount > 0:

            wallet_name = user_id
            available_balance = main_balance

            frappe.get_doc({
                'doctype': "Transaction Logs",
                'market_id': doc.market_id,
                'user': doc.user_id,
                'wallet_type': 'Main',
                'order_id': doc.name,
                'transaction_amount': total_amount,
                'transaction_type': 'Debit',
                'transaction_status': 'Success',
                'transaction_method': 'WALLET'
            }).insert(ignore_permissions=True)

            new_balance = available_balance - total_amount

            frappe.db.set_value("User Wallet", user_id, "balance", new_balance)

    except Exception as e:
        frappe.log_error("Error in creating transaction log", str(e))
        raise


def wallet_operation(doc, method):
    try:
        user_id = doc.user_id or frappe.session.user

        if doc.status == "UNMATCHED":

            order_book_data = {
                "market_id": doc.market_id,
                "quantity": doc.quantity
            }

            if doc.order_type == "BUY":
                create_transaction_log(doc)
                order_book_data["price"] = 10 - doc.amount
                order_book_data["opinion_type"] = "NO" if doc.opinion_type == "YES" else "YES"
            else:
                if not doc.holding_id:
                    frappe.db.sql("""
                        UPDATE `tabHolding`
                        SET status = 'EXITING', order_id = %s, exit_price = %s
                        WHERE market_id = %s AND user_id = %s AND status = 'ACTIVE' AND opinion_type = %s
                    """, (doc.name, doc.amount, doc.market_id, doc.user_id, doc.opinion_type))
                order_book_data["price"] = doc.amount
                order_book_data["opinion_type"] = doc.opinion_type

            payload = {
                "user_id": user_id,
                "order_id": doc.name,
                "filled_quantity": doc.filled_quantity,
                "status": doc.status,
                "market_id": doc.market_id,
                "option_type": doc.opinion_type,
                "price": doc.amount,
                "quantity": doc.quantity,
                "order_type": doc.order_type
            }

            if not doc.user_id:
                frappe.db.set_value('Orders', doc.name, 'user_id', user_id, update_modified=False)

            frappe.db.commit()

            try:
                url = "http://94.136.187.188:8086/orders/"
                response = requests.post(url, json=payload)

                if response.status_code != 201:
                    frappe.db.set_value('Orders', doc.name, {
                        'status': "CANCELED",
                        'remark': "System canceled the order."
                    }, update_modified=False)
                    frappe.db.commit()
                    frappe.throw(f"Error from API: {response.text}")
                else:
                    frappe.publish_realtime("order_book_event", order_book_data, after_commit=True)

                    result = frappe.db.sql("""
                        SELECT COUNT(DISTINCT user_id) AS traders
                        FROM `tabOrders`
                        WHERE status NOT IN ("CANCELED", "SETTLED") AND market_id = %s
                    """, (doc.market_id,), as_dict=True)

                    market = frappe.get_doc("Market", doc.market_id)
                    if market.total_traders != result[0]["traders"]:
                        frappe.db.set_value('Market', doc.market_id, 'total_traders', result[0]["traders"], update_modified=False)

                    frappe.db.commit()
                    frappe.msgprint("Order Created Successfully.")
            except requests.exceptions.RequestException as e:
                frappe.throw(f"Error sending order: {str(e)}")

        elif doc.status == "PARTIAL":
            order_book_data = {
                "market_id": doc.market_id,
                "quantity": -doc.filled_quantity
            }

            if doc.order_type == "BUY":
                order_book_data["price"] = 10 - doc.amount
                order_book_data["opinion_type"] = "NO" if doc.opinion_type == "YES" else "YES"
            else:
                order_book_data["price"] = doc.amount
                order_book_data["opinion_type"] = doc.opinion_type

            frappe.publish_realtime("order_book_event", order_book_data, after_commit=True)

        elif doc.status == "CANCELED":
            order_book_data = {
                "market_id": doc.market_id,
                "quantity": -(doc.quantity - doc.filled_quantity)
            }

            if doc.order_type == "BUY":
                total_amount = (doc.quantity - doc.filled_quantity) * doc.amount

                order_book_data["price"] = 10 - doc.amount
                order_book_data["opinion_type"] = "NO" if doc.opinion_type == "YES" else "YES"

                refund_result = frappe.db.sql("""
                    SELECT 
                        SUM(CASE 
                                WHEN transaction_type = 'Debit' THEN transaction_amount 
                                WHEN transaction_type = 'Credit' THEN -transaction_amount 
                                ELSE 0 
                            END) AS refund_amount
                    FROM `tabTransaction Logs`
                    WHERE user = %s
                    AND market_id = %s
                    AND wallet_type = 'Promo'
                    AND transaction_status = 'Success'
                    AND order_id = %s
                    GROUP BY order_id
                """, (doc.user_id, doc.market_id, doc.name), as_dict=True)

                refund_amount = refund_result[0]["refund_amount"] if refund_result else 0

                if refund_amount > 0:
                    refund_amount = min(refund_amount, total_amount)

                    available_balance = frappe.db.get_value("Promotional Wallet", doc.user_id, "balance")
                    new_balance = available_balance + refund_amount

                    frappe.db.set_value("Promotional Wallet", doc.user_id, "balance", new_balance)

                    frappe.get_doc({
                        'doctype': "Transaction Logs",
                        'market_id': doc.market_id,
                        'user': doc.user_id,
                        'wallet_type': 'Promo',
                        'order_id': doc.name,
                        'transaction_amount': refund_amount,
                        'transaction_type': 'Credit',
                        'transaction_status': 'Success',
                        'transaction_method': 'WALLET'
                    }).insert(ignore_permissions=True)

                    total_amount -= refund_amount

                if total_amount > 0:
                    available_balance = frappe.db.get_value("User Wallet",doc.user_id, 'balance')
                    new_balance = available_balance + total_amount

                    frappe.db.set_value("User Wallet", doc.user_id, "balance", new_balance)

                    frappe.get_doc({
                        'doctype': "Transaction Logs",
                        'market_id': doc.market_id,
                        'user': doc.user_id,
                        'wallet_type': 'Main',
                        'order_id': doc.name,
                        'transaction_amount': total_amount,
                        'transaction_type': 'Credit',
                        'transaction_status': 'Success',
                        'transaction_method': 'WALLET'
                    }).insert(ignore_permissions=True)
            else:
                if not doc.holding_id:
                    frappe.db.sql("""
                        UPDATE `tabHolding`
                        SET status = 'ACTIVE', order_id = '', exit_price = 0
                        WHERE market_id = %s AND status = 'EXITING' AND order_id = %s AND user_id = %s
                    """, (doc.market_id, doc.name, doc.user_id))
                else:
                    frappe.db.set_value("Holding", doc.holding_id, {
                        'status': 'ACTIVE',
                        'order_id': ''
                    }, update_modified=False)

                order_book_data["price"] = doc.amount
                order_book_data["opinion_type"] = doc.opinion_type

            frappe.db.commit()

            if doc.market_status != "CLOSE":
                try:
                    url = f"http://94.136.187.188:8086/orders/{doc.name}"
                    response = requests.delete(url)

                    if response.status_code != 200:
                        frappe.throw(f"Cancel Order API error: {response.status_code} - {response.text}")
                    else:
                        frappe.publish_realtime("order_book_event", order_book_data, after_commit=True)
                        frappe.msgprint("Order cancelled successfully.")
                except Exception as e:
                    frappe.throw(f"Error in order cancelling: {str(e)}")

    except Exception as e:
        frappe.log_error("Error in wallet operation", str(e))
        frappe.throw(f"Error in wallet operation: {str(e)}")


@frappe.whitelist(allow_guest=True)
def get_balance(user_id: str):
    """Fetch wallet balance for a given user."""
    wallet_data = frappe.db.sql("""
        SELECT name, balance FROM `tabUser Wallet`
        WHERE user = %s AND is_active = 1
    """, (user_id,), as_dict=True)
    
    # Log for debugging
    frappe.log_error("Get balance for user", user_id)
    
    if not wallet_data:
        return {"status": "error", "message": "No active wallet found."}

    return {"status": "success", "wallet": wallet_data[0]}


@frappe.whitelist(allow_guest=True)
def get_deposit_and_withdrawal():
    try:
        current_user = frappe.session.user
        query = """
            SELECT 
                user,
                transaction_type,
                SUM(CAST(transaction_amount AS DECIMAL(18,2))) AS total_amount
            FROM `tabTransaction Logs`
            WHERE transaction_type IN ('Recharge', 'Withdrawal')
            AND user = %s
            GROUP BY transaction_type
        """
        results = frappe.db.sql(query, (current_user,), as_dict=True)
        return results
    except Exception as e:
        return {
            "error":"Error in total deposit and withdrawal calculation",
            "message":f"{str(e)}"
        }

@frappe.whitelist(allow_guest=True)
def recharge_wallet(user, amount):
    try:
        # gst_config = frappe.db.sql(
        #     """
        #     SELECT
        #         sgst_rate,
        #         cgst_rate,
        #         igst_rate
        #     FROM `tabGST Config`
        #     WHERE is_active = 1
        #     LIMIT 1
        #     """, as_dict=True
        # )
        # sgst_amount = 0
        # cgst_amount = 0
        # igst_amount = 0
        # if gst_config:
        #     sgst_amount = amount * (gst_config[0]['sgst_rate']/100)
        #     cgst_amount = amount * (gst_config[0]['cgst_rate']/100)

        gst_rate = 28
        total_gst = round(amount - (amount * (100/ (100 + gst_rate))),2)
        
        # Get referrer's promotional wallet
        wallet_balance = frappe.db.get_value("Promotional Wallet",user,'balance')
        new_balance = wallet_balance + total_gst

        frappe.db.set_value("Promotional Wallet", user, "balance", new_balance)

        available_balance = frappe.db.get_value("User Wallet",user,'balance')

        # Add referrer reward to wallet
        new_wallet_balance = available_balance + amount - total_gst

        frappe.db.set_value("User Wallet", user, "balance", new_wallet_balance)

        return {
            "message":"Wallet recharge successfully",
            "gst":total_gst,
            "amount": round(amount - total_gst,2)
        }
    except Exception as e:
        frappe.log_error("Error in wallet recharge",str(e))
        frappe.throw(f"Error in wallet recharge {str(e)}")
    
