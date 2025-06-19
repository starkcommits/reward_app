import requests
import frappe
import json
from frappe import _

@frappe.whitelist(allow_guest=True)  # Allow external requests
def update_order():
    """Accepts order updates from FastAPI and updates the Order Doctype in Frappe."""
    
    try:
        # Parse incoming JSON data
        data = frappe._dict(frappe.request.get_json())
        
        frappe.log_error("Order matching", data)
        
        # Get order data for realtime updates, but don't modify it
        order = frappe.get_doc("Orders", data.order_id)

        order_status = data.status
        if order.order_type == "SELL" and data.status == "MATCHED":
            order_status = "SETTLED"

        # Update fields directly using db_set to avoid modification conflicts
        # This bypasses the document modified check
        frappe.db.set_value('Orders', data.order_id, {
            'status': data.status,
            'quantity': data.quantity,
            'filled_quantity': data.filled_quantity
        }, update_modified=True)  # Update modified timestamp
        
        # Commit the transaction to ensure changes are saved
        frappe.db.commit()
        
        # Send realtime updates
        frappe.publish_realtime('order_event', {
            "order_id": data.order_id,
            "status": data.status,
            "filled_quantity": data.filled_quantity
        }, user=order.user_id,after_commit=True)  # Use order.user_id instead of frappe.session.user
        
        return {"status": "success", "message": "Order updated successfully", "order_id": order.name}
    
    except Exception as e:
        frappe.log_error(f"Order update failed:", f"{str(e)}")
        return {"status": "error", "message": str(e)}


@frappe.whitelist(allow_guest=True)
def trades():
    """Handles trades updates."""
    try:
        data = frappe._dict(frappe.request.get_json())
        frappe.log_error("Trade Data", data)

        if "trades" not in data:
            return {"status": "error", "message": "Missing 'trades' key in request data"}

        for trade in data.trades:
            first_user_name = frappe.db.get_value('User',trade["first_user_id"],'full_name')
            second_user_name = frappe.db.get_value('User',trade["second_user_id"],'full_name')
            trade_doc = frappe.get_doc({
                "doctype": "Trades",
                "first_user_order_id": trade["first_user_order_id"],
                "second_user_order_id": trade["second_user_order_id"],
                "market_id": trade["market_id"],
                "first_user_id": trade["first_user_id"],
                "second_user_id": trade["second_user_id"],
                "first_user_price": trade["first_user_price"],
                "second_user_price": trade["second_user_price"],
                "quantity": trade["quantity"],
                "first_user_name": first_user_name,
                "second_user_name": second_user_name
            })
            trade_doc.insert(ignore_permissions=True)
            
            first_order = frappe.get_doc("Orders",trade["first_user_order_id"])
            second_order = frappe.get_doc("Orders",trade["second_user_order_id"])

            market_id = trade["market_id"]
            quantity = trade["quantity"]
            f_price = trade["first_user_price"]
            s_price = trade["second_user_price"]

            if trade["first_user_option"] != trade["second_user_option"]:
                holding_doc1 = frappe.get_doc({
                    "doctype": "Holding",
                    "market_id": trade["market_id"],
                    "quantity": trade["quantity"],
                    "user_id": trade["first_user_id"],
                    "opinion_type": trade["first_user_option"],
                    "price": trade["first_user_price"],
                    "buy_order": trade["first_user_order_id"],
                    "profit_price": first_order.profit_price,
                    "loss_price": first_order.loss_price,
                    "status": "ACTIVE"
                })
                holding_doc1.insert(ignore_permissions=True)

                holding_doc2 = frappe.get_doc({
                    "doctype": "Holding",
                    "market_id": trade["market_id"],
                    "quantity": trade["quantity"],
                    "user_id": trade["second_user_id"],
                    "opinion_type": trade["second_user_option"],
                    "price": trade["second_user_price"],
                    "buy_order": trade["second_user_order_id"],
                    "profit_price": second_order.profit_price,
                    "loss_price": second_order.loss_price,
                    "status": "ACTIVE"
                })
                holding_doc2.insert(ignore_permissions=True)

                # Update total investment
                total_trade_investment = (f_price + s_price) * quantity
                frappe.db.sql("""
                    UPDATE `tabMarket`
                    SET total_investment = COALESCE(total_investment, 0) + %s
                    WHERE name = %s
                """, (total_trade_investment, market_id))

                frappe.db.commit()

            else:
                result = frappe.db.sql("""
                    SELECT name
                    FROM `tabHolding`
                    WHERE market_id = %s
                    AND status = 'EXITING'
                    AND order_id = %s
                    AND user_id = %s
                    AND opinion_type = %s
                    ORDER BY price
                """, (
                    trade["market_id"],
                    trade["first_user_order_id"],
                    trade["first_user_id"],
                    trade["first_user_option"]
                ), as_dict=True)

                trade_quantity = quantity

                for row in result:
                    holding_doc = frappe.get_doc("Holding", row["name"])
                    remaining_quantity = holding_doc.quantity - holding_doc.filled_quantity
                    quantity = 0

                    if remaining_quantity <= trade_quantity:
                        trade_quantity -= remaining_quantity
                        holding_doc.filled_quantity = holding_doc.quantity
                        holding_doc.status = "EXITED"
                        quantity = remaining_quantity
                    else:
                        quantity = trade_quantity
                        holding_doc.filled_quantity += trade_quantity
                        trade_quantity = 0

                    # Reward logic
                    reward = quantity * (holding_doc.exit_price - holding_doc.price)
                    holding_doc.returns += reward

                    holding_doc.save(ignore_permissions=True)

                    # Lock and fetch wallet
                    wallet_data = frappe.db.sql("""
                        SELECT name, balance FROM `tabUser Wallet`
                        WHERE user = %s AND is_active = 1
                        FOR UPDATE
                    """, (trade["first_user_id"],), as_dict=True)

                    if not wallet_data:
                        frappe.db.rollback()
                        return {"status": "error", "message": "No active wallet found."}

                    wallet_name = wallet_data[0]["name"]
                    available_balance = wallet_data[0]["balance"]

                    new_balance = available_balance + reward

                    # Update wallet
                    frappe.db.sql("""
                        UPDATE `tabUser Wallet`
                        SET balance = %s
                        WHERE name = %s
                    """, (new_balance, wallet_name))
                    
                    exited_investment = quantity_to_fill * holding_doc.price
                    frappe.db.sql("""
                        UPDATE `tabMarket`
                        SET total_investment = total_investment - %s
                        WHERE name = %s
                    """, (exited_investment, market_id))

                    if trade_quantity == 0:
                        break

                frappe.db.commit()

                holding_doc2 = frappe.get_doc({
                    "doctype": "Holding",
                    "market_id": trade["market_id"],
                    "quantity": trade["quantity"],
                    "user_id": trade["second_user_id"],
                    "opinion_type": trade["second_user_option"],
                    "price": trade["second_user_price"],
                    "buy_order": trade["second_user_order_id"],
                    "profit_price": second_order.profit_price,
                    "loss_price": second_order.loss_price,
                    "status": "ACTIVE"
                })
                holding_doc2.insert(ignore_permissions=True)

                # Only second user's investment is added
                frappe.db.sql("""
                    UPDATE `tabMarket`
                    SET total_investment = COALESCE(total_investment, 0) + %s
                    WHERE name = %s
                """, (s_price * quantity, market_id))

                frappe.db.commit()
                
            # 🔁 After each trade, update max_allowed_quantity dynamically
            current_total = frappe.db.get_value("Market", market_id, "total_investment") or 0

            if current_total < 500:
                max_qty = 5
            elif current_total < 2000:
                max_qty = 10
            elif current_total < 5000:
                max_qty = 20
            elif current_total < 10000:
                max_qty = 30
            else:
                max_qty = 50

            frappe.db.set_value("Market", market_id, "max_allowed_quantity", max_qty)

        return {"status": "success", "message": f"{len(data.trades)} trades inserted successfully"}
    except Exception as e:
        frappe.log_error(f"Trade update failed: {str(e)}", "Trade_order")
        return {"status": "error", "message": str(e)}

def market(doc, method):
    try:
        if doc.status == "OPEN" and int(doc.version) == 0:
            frappe.db.set_value("Market",doc.name, 'version', 1)
            # Convert closing_time to ISO format if needed
            if isinstance(doc.closing_time, str):
                # If it's already a string, ensure it's in ISO format
                closing_time = doc.closing_time
            else:
                # If it's a datetime object, convert to ISO
                closing_time = doc.closing_time.isoformat()
        
            payload = {
                "market_id": doc.name,
                "question": doc.question,
                "closing_time": closing_time,
                "status": doc.status
            }
        
            # For debugging
            frappe.logger().info(f"Sending payload to market engine: {payload}")
            
            url = "http://13.202.185.148:8086/markets/"
            response = requests.post(url, json=payload)
            
            if response.status_code != 201:
                frappe.logger().error(f"Error response: {response.text}")
                frappe.throw(f"API error: {response.status_code} - {response.text}")
            else:
                    
                """Send real-time update via WebSockets"""
                update_data = {
                    "name": doc.name,
                    "status": doc.status,
                    "category": doc.category,
                    "question": doc.question,
                    "yes_price": doc.yes_price,
                    "no_price": doc.no_price,
                    "closing_time": doc.closing_time,
                    "total_traders": doc.total_traders
                }
                frappe.publish_realtime("market_event",update_data,after_commit=True)
                frappe.msgprint("Market Created Successfully.")

        elif doc.status == "CLOSED":
            frappe.log_error("Market Closed",f"{doc.name}")
            orders = frappe.get_all("Orders", filters={
                "market_id": doc.name,
                "status": ["not in", ["MATCHED", "SETTLED", "CANCELED"]]
            })

            for order in orders:
                order_doc = frappe.get_doc("Orders", order.name)
                order_doc.status = "CANCELED"
                order_doc.remark = "Market Closed"
                order_doc.save()  # Triggers hooks

            frappe.db.commit()
            url=f"http://13.202.185.148:8086/markets/{doc.name}/close"
            response = requests.post(url)
                
            if response.status_code != 200:
                frappe.logger().error(f"Error response: {response.text}")
                frappe.throw(f"API error: {response.status_code} - {response.text}")
        else:
            result = frappe.db.sql("""
                SELECT
                    user_id,
                    opinion_type,
                    SUM(quantity - filled_quantity) AS total_quantity
                FROM `tabHolding`
                WHERE market_id = %s
                AND status IN ('ACTIVE', 'EXITING')
                GROUP BY user_id, opinion_type
            """, (doc.name,), as_dict=True)

            for row in result:
                
                if row["opinion_type"] == doc.end_result:
                    user_id = row["user_id"]
                    qty = row["total_quantity"] or 0
                    wallet_data = frappe.db.sql("""
                        SELECT name, balance FROM `tabUser Wallet`
                        WHERE user = %s AND is_active = 1
                        FOR UPDATE
                    """, (user_id,), as_dict=True)

                    if not wallet_data:
                        frappe.msgprint("No active wallet found")
                        frappe.throw(f"No active wallet found for {user_id}")

                    wallet_name = wallet_data[0]["name"]
                    available_balance = wallet_data[0]["balance"]

                    # Calculate new balance
                    new_balance = available_balance + qty * 10
                    
                    # Update wallet balance
                    frappe.db.sql("""
                        UPDATE `tabUser Wallet`
                        SET balance = %s
                        WHERE name = %s
                    """, (new_balance, wallet_name))
            
            frappe.db.sql("""
                UPDATE `tabHolding`
                SET returns = returns + ((quantity - filled_quantity) * 10)
                WHERE market_id = %s
                AND opinion_type = %s
            """, (doc.name, doc.end_result))

            frappe.db.sql("""
                UPDATE `tabHolding`
                SET status = 'EXITED', remark = 'Market Resolved', market_status = 'RESOLVED'
                WHERE market_id = %s
                AND status IN ('ACTIVE', 'EXITING', 'EXITED')
            """, (doc.name,))    
    except Exception as e:
        frappe.log_error(f"Exception market: {str(e)}")


@frappe.whitelist(allow_guest=True)
def resolve_market():
    try:
        data = frappe._dict(frappe.request.get_json())

        frappe.log_error("Market Resolve",data)
        
        market = frappe.get_doc("Market",data.market_id)

        """Send real-time update via WebSockets"""
        update_data = {
            "name": market.name,
            "status": market.status,
            "category": market.category
        }
        
        frappe.publish_realtime("market_event",update_data,after_commit=True)
        
        market.status="RESOLVED"
        market.end_result=data.winning_side
        market.save(ignore_permissions=True)
        frappe.db.commit()

        frappe.msgprint("Market resolved Successfully.")
    
        return {
            "status":"success","message":"Market resolved"
        }
        
    except Exception as e:
        frappe.log_error("Error Closing market", f"{str(e)}")
        return {"status": "error", "message": "Error in resolving market"}

def check_price_trigger(market_id,yes_price,no_price):
    yes_holdings = frappe.db.sql("""
        SELECT 
            user_id,
            buy_order,
            SUM(quantity) AS total_quantity,
            loss_price,
            profit_price
        FROM `tabHolding`
        WHERE
            status = 'ACTIVE'
            AND opinion_type = 'YES'
            AND market_id = %s
            AND (loss_price >= %s OR profit_price <= %s)
        GROUP BY user_id, buy_order, loss_price, profit_price
    """, (market_id, yes_price, yes_price), as_dict=True)

    frappe.log_error("Yes Holdings",yes_holdings)

    for holding in yes_holdings:
        sell_price = holding["loss_price"] if holding["loss_price"] >= yes_price else holding["profit_price"]

        sell_order = frappe.new_doc("Orders")
        sell_order.user_id = holding["user_id"]
        sell_order.quantity = holding["total_quantity"]
        sell_order.order_type = "SELL"
        sell_order.amount = sell_price
        sell_order.market_id = market_id
        sell_order.opinion_type = "YES"
        sell_order.insert(ignore_permissions=True)

        frappe.db.sql("""
            UPDATE `tabHolding`
            SET status = 'EXITING', order_id = %s
            WHERE
                user_id = %s
                AND market_id = %s
                AND buy_order = %s
        """, (sell_order.name, holding["user_id"], market_id, holding["buy_order"]))

    frappe.db.commit()

    no_holdings = frappe.db.sql("""
        SELECT 
            user_id,
            buy_order,
            SUM(quantity) AS total_quantity,
            loss_price,
            profit_price
        FROM `tabHolding`
        WHERE
            status = 'ACTIVE'
            AND opinion_type = 'NO'
            AND market_id = %s
            AND (loss_price >= %s OR profit_price <= %s)
        GROUP BY user_id, buy_order, loss_price, profit_price
    """, (market_id, no_price, no_price), as_dict=True)

    frappe.log_error("No Holdings",no_holdings)
    
    for holding in no_holdings:
        sell_price = holding["loss_price"] if holding["loss_price"] >= no_price else holding["profit_price"]

        sell_order = frappe.new_doc("Orders")
        sell_order.user_id = holding["user_id"]
        sell_order.quantity = holding["total_quantity"]
        sell_order.order_type = "SELL"
        sell_order.amount = sell_price
        sell_order.market_id = market_id
        sell_order.opinion_type = "NO"
        sell_order.insert(ignore_permissions=True)

        frappe.db.sql("""
            UPDATE `tabHolding`
            SET status = 'EXITING', order_id = %s
            WHERE
                user_id = %s
                AND market_id = %s
                AND buy_order = %s
        """, (sell_order.name, holding["user_id"], market_id, holding["buy_order"]))

    frappe.db.commit()

@frappe.whitelist(allow_guest=True)
def update_market_price():
    try:
        data = frappe._dict(frappe.request.get_json())

        frappe.db.set_value("Market", data.market_id, {
            'yes_price': data.yes_price,
            'no_price': data.no_price
        }, update_modified=False)
        frappe.db.commit()

        market = frappe.get_doc("Market", data.market_id)

        update_data = {
            "name": market.name,
            "status": market.status,
            "category": market.category,
            "question": market.question,
            "yes_price": data.yes_price,
            "no_price": data.no_price,
            "closing_time": market.closing_time,
            "total_traders": market.total_traders
        }

        frappe.publish_realtime("market_event",update_data,after_commit=True)
        
        check_price_trigger(data.market_id, data.yes_price, data.no_price)

        return True
    except Exception as e:
        frappe.log_error("Error in market price update", f"{str(e)}")
        return False


@frappe.whitelist(allow_guest=True)
def get_marketwise_transaction_summary():
    """
    Fetch total debited and credited amounts per user in each market,
    restricted to the logged-in user's trades.
    """
    current_user = frappe.session.user  # Get the logged-in user

    query = """
        SELECT 
            market_id,
            user,
            question,
            winning_side,
            transaction_type,
            SUM(CAST(transaction_amount AS DECIMAL(18,2))) AS total_amount
        FROM `tabTransaction Logs`
        WHERE transaction_type IN ('Debit', 'Credit')
        AND user = %s
        AND market_id IN (
            SELECT name FROM `tabMarket` WHERE status = 'CLOSED'
        )
        GROUP BY market_id, user, question, transaction_type
    """

    results = frappe.db.sql(query, (current_user,), as_dict=True)

    # return results
    # # Process results into a structured dictionary
    summary = {}

    for row in results:
        market = row["market_id"]
        user = row["user"]
        winning_side = row["winning_side"]
        question = row["question"]
        txn_type = row["transaction_type"]
        amount = row["total_amount"]

        # Initialize market & user data
        if market not in summary:
            summary[market] = {}
            summary[market]["question"] = question
            summary[market]["winning_side"] = winning_side

        if txn_type not in summary[market]:
            if txn_type == "Debit":
                summary[market]["debited_amount"]=amount
            else:
                summary[market]["credited_amount"]=amount

    return summary

@frappe.whitelist()
def get_marketwise_holding():
    user_id = frappe.session.user  # replace this with actual user ID

    # result = frappe.db.sql("""
    #     SELECT
    #         h.market_id,
    #         m.question,
    #         m.yes_price,
    #         m.no_price,
    #         SUM(h.quantity - h.filled_quantity) AS total_quantity,
    #         CASE 
    #             WHEN SUM(h.quantity - h.filled_quantity) > 0 THEN
    #                 SUM((h.quantity - h.filled_quantity) * h.price)
    #             ELSE 0
    #         END AS invested_amount,
    #         SUM(CASE WHEN h.opinion_type = 'yes' THEN h.quantity - h.filled_quantity ELSE 0 END) AS yes_quantity,
    #         SUM(CASE WHEN h.opinion_type = 'no' THEN h.quantity - h.filled_quantity ELSE 0 END) AS no_quantity
    #     FROM `tabHolding` h
    #     JOIN `tabMarket` m ON h.market_id = m.name
    #     WHERE h.user_id = %s
    #     AND h.status = 'ACTIVE'
    #     GROUP BY h.market_id, m.question, m.yes_price, m.no_price
    # """, (user_id,), as_dict=True)
    results = frappe.db.sql("""
        SELECT
            h.market_id,
            h.opinion_type,
            h.status,
            SUM(h.quantity) AS total_quantity,
            SUM(h.filled_quantity) AS total_filled_quantity,
            SUM((h.quantity - h.filled_quantity) * h.price) AS total_invested,
            m.question,
            m.yes_price,
            m.no_price
        FROM
            `tabHolding` h
        JOIN
            `tabMarket` m ON h.market_id = m.name
        WHERE
            m.status = 'OPEN'
            AND h.user_id = %(user_id)s
        GROUP BY
            h.market_id,
            h.opinion_type,
            h.status,
            m.question,
            m.yes_price,
            m.no_price
    """, {"user_id": user_id}, as_dict=True)

    output = {}
    for row in results:
        market = row['market_id']
        status = row['status']
        opinion = row['opinion_type']

        # Set basic market-level info
        if market not in output:
            output[market] = {
                "market_id": market,
                "question": row["question"],
                "yes_price": row["yes_price"],
                "no_price": row["no_price"],
                "total_invested": 0  # Init here
            }

        # Accumulate invested amount
        output[market]["total_invested"] += row["total_invested"]

        # Set opinion-type breakdown
        output[market].setdefault(status, {})[opinion] = {
            "total_quantity": row["total_quantity"],
            "total_filled_quantity": row["total_filled_quantity"]
        }

    return output

@frappe.whitelist(allow_guest=True)
def get_available_quantity(market_id):
    query = """
        SELECT 
            amount,
            opinion_type,
            order_type,
            SUM(
                CASE 
                    WHEN status = 'UNMATCHED' THEN quantity
                    WHEN status = 'PARTIAL' THEN quantity - filled_quantity
                    ELSE 0 
                END
            ) AS total_available_quantity
        FROM `tabOrders`
        WHERE market_id = %s
        GROUP BY amount, opinion_type, order_type
    """

    result = frappe.db.sql(query, (market_id,), as_dict=True)
    res = {}
    BASE_PRICE = 10.0
    frappe.log_error("Quantity",result)
    
    for temp in result:
        order_type = temp.order_type.upper()
        amount_key = f"{BASE_PRICE - temp.amount}" if order_type == "BUY" else f"{temp.amount}"

        if amount_key not in res:
            res[amount_key] = {"price": float(amount_key), "yesQty": 0, "noQty": 0}

        if order_type == "BUY":
            if temp.opinion_type == "YES":
                res[amount_key]["noQty"] += temp.total_available_quantity
            else:
                res[amount_key]["yesQty"] += temp.total_available_quantity
        else:
            if temp.opinion_type == "YES":
                res[amount_key]["yesQty"] += temp.total_available_quantity
            else:
                res[amount_key]["noQty"] += temp.total_available_quantity

    return res if res else {}

def holding(doc,method):
    if doc.status == "EXITING" and not doc.order_id:
        order = frappe.get_doc({
            "doctype":"Orders",
            "order_type" : "SELL",
            "opinion_type" : doc.opinion_type,
            "user_id": doc.user_id,
            "amount" : doc.exit_price,
            "quantity" : doc.quantity - doc.filled_quantity,
            "market_id" : doc.market_id,
            "holding_id" : doc.name
        })

        order.insert(ignore_permissions = True)
        doc.order_id = order.name
        doc.save(ignore_permissions=True)
        frappe.db.commit()

    elif doc.status == "ACTIVE" and doc.order_id:
        order = frappe.get_doc("Orders", doc.order_id)

        # Calculate the new quantity
        new_quantity = order.quantity - (doc.quantity - doc.filled_quantity)

        # Update status if order is now fully matched
        new_status = "MATCHED" if new_quantity == order.filled_quantity else order.status

        # Update the order (does NOT trigger hooks)
        frappe.db.set_value("Orders", doc.order_id, {
            "quantity": new_quantity,
            "status": new_status
        }, update_modified=False)

        order_book_data = {
            "market_id": doc.market_id,
            "quantity": - (doc.quantity - doc.filled_quantity),
            "opinion_type": doc.opinion_type,
            "price": doc.exit_price
        }

        # Optionally clear the holding's order link
        doc.order_id = ''
        doc.exit_price = 0
        doc.save(ignore_permissions=True)

        # Prepare correct payload
        payload = {
            "order_id": order.name,
            "new_quantity": new_quantity   # ✅ Use updated quantity here
        }

        # API call to sync order update
        try:
            url = "http://13.202.185.148:8086/orders/update_quantity"
            response = requests.put(url, json=payload)
            if response.status_code != 201:
                frappe.log_error(f"Error response: {response.text}")
                frappe.throw(f"API error: {response.status_code} - {response.text}")
            else:
                frappe.publish_realtime("order_book_event", order_book_data,after_commit=True)
                frappe.msgprint("Sell order updated with new quantity")
                return True
        except Exception as e:
            frappe.log_error("Error in market price update", f"{str(e)}")
            return False

@frappe.whitelist(allow_guest=True)
def cancel_order(market_id, user_id):
    # frappe.db.sql("""
    #     UPDATE `tabOrders`
    #     SET status = 'CANCELED'
    #     WHERE market_id = %s
    #     AND user_id = %s
    #     AND order_type = 'SELL'
    # """, (market_id, user_id))
    try:
        orders = frappe.get_all("Orders", 
            filters={
                "market_id": market_id,
                "user_id": user_id,
                "order_type": "SELL",
                "status": ["not in", ["MATCHED", "CANCELED"]]
            },
            pluck="name"
        )

        for order_name in orders:
            order = frappe.get_doc("Orders", order_name)
            order.status = "CANCELED"
            order.save()  # Triggers on_update

        frappe.db.commit()
        return success_response("All Order canceled successfully")
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

@frappe.whitelist(allow_guest=True)
def total_exit(market_id,user_id):
    result = frappe.db.sql(
        """
        SELECT 
            h.opinion_type,
            SUM(h.quantity - h.filled_quantity) AS total_quantity,
            m.yes_price,
            m.no_price
        FROM 
            `tabHolding` h
        JOIN 
            `tabMarket` m ON h.market_id = m.name
        WHERE 
            h.market_id = %s
            AND h.user_id = %s
            AND h.status = 'ACTIVE'
        GROUP BY 
            h.opinion_type, m.yes_price, m.no_price
        """,
        (market_id, user_id),
        as_dict=True
    )
    output = {"YES": 0, "NO": 0}
    for row in result:
        output[row["opinion_type"]] = row["total_quantity"]
        # Store prices just once (they'll be same across rows)
        output["yes_price"] = row["yes_price"]
        output["no_price"] = row["no_price"]
        
    return output

@frappe.whitelist(allow_guest=True)
def total_returns(user_id):
    result = frappe.db.sql("""
        SELECT
            h.market_id,
            m.question,
            SUM(h.quantity * h.price) AS total_invested,
            SUM(h.returns) AS total_returns
        FROM
            `tabHolding` h
        JOIN
            `tabMarket` m ON h.market_id = m.name
        WHERE
            h.user_id = %s
            AND m.status = 'RESOLVED'
        GROUP BY
            h.market_id
    """, (user_id,), as_dict=True)

    return result

def error_response(message):
    """Return an error response in JSON format"""
    frappe.response["http_status_code"] = 400
    return {
        "status": "error",
        "message": message
    }

def success_response(message):
    """Return a success response in JSON format"""
    frappe.response["http_status_code"] = 200
    return {
        "status": "success",
        "message": message
    }


@frappe.whitelist(allow_guest=True)
def update_order_price(user_id, order_id, price):
    try:
        doc = frappe.get_doc('Orders',order_id)
        if doc.status == 'CANCELED':
            frappe.throw(f"Order is canceled. Price can't be updated.")
            return
        elif doc.status == 'MATCHED':
            frappe.throw(f"Order is already matched. Price can't be updated.")
            return
        elif doc.order_type == 'BUY':
            settle_amount = (doc.amount - price) * (doc.quantity - doc.filled_quantity)

            wallet_data = frappe.db.sql("""
                SELECT name, balance FROM `tabUser Wallet`
                WHERE user = %s AND is_active = 1
            """, (user_id,), as_dict=True)

            if not wallet_data:
                frappe.msgprint("No active wallet found")
                frappe.throw(f"No active wallet found for {user_id}")

            wallet_name = wallet_data[0]["name"]
            available_balance = wallet_data[0]["balance"]

            new_balance = available_balance + settle_amount

            frappe.db.sql("""
                UPDATE `tabUser Wallet`
                SET balance = %s
                WHERE name = %s
            """, (new_balance, wallet_name))
        
        frappe.db.set_value('Orders',order_id,'amount', price)
        payload={
            "order_id":order_id,
            "new_price": price
        }
        try:
            url = "http://13.202.185.148:8086/orders/update_price"
            response = requests.put(url, json=payload)
            
            if response.status_code != 201:
                frappe.throw("Error in price updation API")

        except Exception as e:
            frappe.throw("Error",f"{str(e)}")

    except Exception as e:
        frappe.log_error("Error in order price updation", f"{str(e)}")
        frappe.throw(f"Error in order price updation {str(e)}")
