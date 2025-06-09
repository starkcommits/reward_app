import frappe
import json
from frappe import _
from frappe.utils.password import check_password
from frappe.utils.password_strength import test_password_strength
from frappe.utils import validate_email_address, getdate, today, get_formatted_email, cint, get_datetime, now, now_datetime
import re
from frappe.auth import LoginManager
import random
import datetime
import requests
import logging
from frappe.core.doctype.user.user import User
from frappe.sessions import get_expiry_in_seconds

@frappe.whitelist(allow_guest=True)
def update_profile(user, token):
    try:
        user_doc = frappe.get_doc("User",user)
        user_doc.fcm_token = token
        user_doc.save(ignore_permissions=True)
        frappe.db.commit()
        return success_response("Token updated successfully")
    except Exception as e:
        frappe.throw(f"Error in profile updation {str(e)}")


def send_sms(mobile_number, otp):
    try:
        # url = "https://graph.facebook.com/v18.0/692630890593436/messages"
        
        # payload = {
        #     "messaging_product": "whatsapp",
        #     "to": f"91{mobile_number}",
        #     "type": "template",
        #     "template": {
        #         "name": "otp_default",
        #         "language": {
        #             "code": "en_US"
        #         },
        #         "components": [
        #             {
        #                 "type": "body",
        #                 "parameters": [
        #                     {
        #                     "type": "text",
        #                     "text": f"{otp}"
        #                     }
        #                 ]
        #             },
        #             {
        #                 "type": "button",
        #                 "sub_type": "url",
        #                 "index": "0",
        #                 "parameters": [
        #                     {
        #                     "type": "text",
        #                     "text": f"{otp}"
        #                     }
        #                 ]
        #             }
        #         ]
        #     }
        # }
        
        # headers = {
        #     "Authorization": "Bearer EAAOx688nrSwBO127r48JRoRHfmc8yLEGjnH3Wpmk2S6iWNDzm7QTxEfMJFctGRNGyTaEg9GcrqgHXg58NbyVybkYFNQZBmiBsiSdwDM4aXAZCjDxmBXLz3yVT7h0Hw1zVhWvc7sIrnC68aQW7nGMmSqCfVZAxKlirPJTiPkE6kzpsiszOuhnemf37Q5nv4H",
        #     "Content-Type": "application/json"
        # }
        
        # # Add timeout to prevent hanging connections
        # response = requests.post(url, json=payload, headers=headers, timeout=15)
        url = f"https://api.authkey.io/request?authkey=3c848188d9d7d131&mobile={mobile_number}&country_code=+91&sid=24388&name=Twinkle&otp={otp}&company=ONO"
        
        response = requests.post(url)
        if response.status_code == 200:
            frappe.logger().info(f"SMS sent successfully to {mobile_number}")
            return True
        else:
            frappe.log_error(f"SMS API returned non-200 response: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.ConnectionError as e:
        frappe.log_error("SMS Connection Error", f"Failed to connect to SMS service: {str(e)}")
        # You might want to continue with the login process even if SMS fails in production
        return False
    except requests.exceptions.Timeout as e:
        frappe.log_error("SMS Timeout Error", f"SMS service timed out: {str(e)}")
        return False
    except Exception as e:
        frappe.log_error("SMS General Error", f"Unexpected error sending SMS: {str(e)}")
        return False

@frappe.whitelist(allow_guest=True)
def generate_mobile_otp(mobile_number):
    # Validate mobile number format
    if not re.match(r'^\d{10}$', mobile_number):
        # frappe.throw("Please enter a valid 10-digit mobile number")
        return error_response("Please enter a valid 10-digit mobile number")

    # Generate 6-digit OTP
    otp = ''.join(random.choice('0123456789') for _ in range(6))
    # otp = 679845
    # Set expiry (e.g., 10 minutes from now)
    expiry = frappe.utils.now_datetime() + datetime.timedelta(minutes=10)

     # Here you would integrate with an SMS gateway to send the OTP
    if not send_sms(mobile_number, otp):
        return error_response("Error in sending otp")

    # Store OTP
    existing = frappe.db.get_value("Mobile OTP", {"mobile_number": mobile_number})
    if existing:
        otp_doc = frappe.get_doc("Mobile OTP", existing)
        otp_doc.otp = otp
        otp_doc.expires_at = expiry
        otp_doc.verified = 0
        otp_doc.save(ignore_permissions=True)
    else:
        otp_doc = frappe.get_doc({
            "doctype": "Mobile OTP",
            "mobile_number": mobile_number,
            "otp": otp,
            "expires_at": expiry,
            "verified": 0
        }).insert(ignore_permissions=True)
    
    return {"success": True, "message": "OTP sent successfully"}


@frappe.whitelist(allow_guest=True)
def verify_otp(mobile, otp):
    try:
        otp_record = frappe.get_list("Mobile OTP", 
            filters={"mobile_number": mobile},
            fields=["name", "otp", "expires_at", "verified"])
        
        if not otp_record:
            return error_response("No OTP found for this mobile number")
        
        otp_doc = frappe.get_doc("Mobile OTP", otp_record[0].name)
        
        # Check if OTP is expired
        if frappe.utils.now_datetime() > otp_doc.expires_at:
            return error_response("OTP has expired. Please request a new one")
        
        if otp_doc.verified == 1:
            return error_response("OTP is already verified. Please request a new one")

        # Verify OTP
        if otp_doc.otp != otp:
            return error_response("Invalid OTP")

        # Mark as verified
        otp_doc.verified = 1
        otp_doc.save(ignore_permissions=True)

        user = frappe.db.get_value("User", {"phone": mobile})
        user_exist = True
        if not user:
            user_exist = False
            # username = f"user_{frappe.utils.now_datetime().strftime('%Y%m%d%H%M%S')}"
            user_doc = frappe.get_doc({
                "doctype": "User",
                "username": mobile,
                "email": f"{mobile}@ono.com",
                "first_name": "ONO User",
                "phone": mobile,
                "enabled": 1,
                "role_profile_name": "Trader",  # set role profile
                "roles": [{"role": "Trader"}],  # assign specific role as well
            })
            user_doc.insert(ignore_permissions=True)
            user = user_doc.name  # get the name (string)

            wallet = frappe.new_doc("User Wallet")
            wallet.user = user
            wallet.balance = 2000
            wallet.is_active = 1
            wallet.insert(ignore_permissions=True)

            # Fetch active referral configs
            referrals = frappe.db.sql(
                """
                SELECT
                    referral_name
                FROM `tabReferral Config`
                WHERE is_active = 1
                """,
                as_dict=True
            )

            referral_name = "Default Referral"
            if not referrals:
                referral_name = frappe.get_doc({
                    'doctype': 'Referral Config',
                    'referral_name': 'Default Referral',
                    'referrer_reward_point':15.00,
                    'referee_reward_point':15.00,
                    'total_allowed_referrals':5,
                    'description':'This is default referral config for each user',
                    'is_active':1
                }).insert(ignore_permissions=True)
            else:
                referral_name = referrals[0]['referral_name']

            user_referral = frappe.get_doc({
                'doctype': 'Referral Code',
                'user': user,
                'referral_name': referral_name
            })
            user_referral.insert(ignore_permissions=True)

            promo_wallet = frappe.new_doc("Promotional Wallet")
            promo_wallet.user = user
            promo_wallet.balance = 0
            promo_wallet.referral_code = user_referral.name
            promo_wallet.is_active = 1
            promo_wallet.insert(ignore_permissions=True)

        # Log the user in
        frappe.local.login_manager = LoginManager()
        frappe.local.login_manager.login_as(user)

        # # Mark OTP as used
        # frappe.db.set_value("Mobile OTP", otp_doc.name, "is_used", 1)

        # Initialize cookies
        frappe.local.cookie_manager.init_cookies()
        
        # Get user information for setting additional cookies
        user_info = frappe.db.get_value("User", user, ["first_name", "last_name", "user_image"], as_dict=1)
        
        # Set additional cookies
        full_name = " ".join(filter(None, [user_info.first_name, user_info.last_name]))
        frappe.local.cookie_manager.set_cookie("user_id", user)
        frappe.local.cookie_manager.set_cookie("full_name", full_name)
        #frappe.local.cookie_manager.set_cookie("user_exist", user_exist)
        frappe.local.cookie_manager.set_cookie("user_image", user_info.user_image or "")
        
        # Set system_user cookie
        if frappe.db.get_value("User", user, "user_type") == "Website User":
            frappe.local.cookie_manager.set_cookie("system_user", "no")
        else:
            frappe.local.cookie_manager.set_cookie("system_user", "yes")

        frappe.db.commit()

        return {
            "message": "Logged in",
            "user_id": user,
            "sid": frappe.session.sid,
            "user_exist":user_exist
        }
    except Exception as e:
        frappe.log_error("Error in otp validation",f"{str(e)}")
        frappe.throw(f"Error in otp validation {str(e)}")


@frappe.whitelist(allow_guest=True)
def logout(user = None):
    try:
        if not user:
            user = frappe.session.user
            
        login_manager = LoginManager()
        login_manager.logout(user)
        frappe.db.commit()
        return {"message": "Successfully logged out"}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Error in logout")
        frappe.throw(f"Error in logout: {str(e)}")


@frappe.whitelist(allow_guest=True)
def execute():
    try:
        now = now_datetime()

        frappe.logger().info(f"[Market Close API] Now: {now}, Adjusted:")
        
        markets = frappe.get_all(
            "Market",
            filters={"status": "OPEN", "closing_time": ["<=", now]},
            fields=["name", "closing_time"]
        )

        if not markets:
            frappe.logger().info("[Market Close API] No markets to close")
            return {"status": "no_markets"}

        for market in markets:
            try:
                frappe.logger().info(f"[Market Close API] Closing market: {market.name}")
                doc = frappe.get_doc("Market", market.name)
                doc.status = "CLOSED"
                doc.flags.ignore_version = True   # <- CRUCIAL
                doc.save(ignore_permissions=True)  # <- CRUCIAL
                frappe.logger().info(f"[Market Close API] Market {market.name} closed.")
            except Exception as e:
                frappe.log_error(f"Error closing market {market.name}: {str(e)}")

        frappe.db.commit()
        return {"status": "success", "closed": [m.name for m in markets]}
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Market closing script error: {str(e)}")
        return {"status": "error", "message": str(e)}


@frappe.whitelist(allow_guest=True)
def check_password_strength():
    # Get request data
    data = frappe.request.get_json()
    if not data:
        return {
            "message":"No request data found"
        }
    return test_password_strength(data.get('new_password'))

def success_response(message):
    """Return a success response in JSON format"""
    frappe.response["http_status_code"] = 200
    return {
        "status": "success",
        "message": message
    }

def error_response(message):
    """Return an error response in JSON format"""
    frappe.response["http_status_code"] = 400
    return {
        "status": "error",
        "message": message
    }

@frappe.whitelist(allow_guest=True)
def check_referral(user_id,referral_code):
    
    try:
        referral_doc = frappe.get_doc("Referral Code", referral_code)

        if int(referral_doc.total_referrals) >= int(referral_doc.total_allowed_referrals):
            frappe.throw("This referral code has reached its limit")

        promotional_wallet_amount = 0
        # Increment referral count
        referral_doc.total_referrals += 1
        referral_doc.save(ignore_permissions=True)  # Don't forget to save

        referral_config = frappe.get_doc("Referral Config", referral_doc.referral_name)

        # Add referee reward to their promotional wallet amount
        promotional_wallet_amount += referral_config.referee_reward_amount

        # Get referrer's promotional wallet
        promotional_wallet_data = frappe.db.sql("""
            SELECT name, balance FROM `tabPromotional Wallet`
            WHERE user = %s AND is_active = 1
        """, (referral_doc.user,), as_dict=True)

        if not promotional_wallet_data:
            frappe.throw(f"No active promotional wallet found for {referral_doc.user}")

        wallet_name = promotional_wallet_data[0]["name"]
        available_balance = promotional_wallet_data[0]["balance"]

        # Add referrer reward to wallet
        new_balance = available_balance + referral_config.referrer_reward_amount

        frappe.db.set_value("Promotional Wallet", wallet_name, "balance", new_balance)
        frappe.db.set_value("Promotional Wallet", user_id, "balance", referral_config.referee_reward_amount)

        # Create Referral Tracking entry
        referral_tracking = frappe.get_doc({
            'doctype': 'Referral Tracking',
            'referrer_user': referral_doc.user,
            'referee_user': user_id,
            'referral_code': referral_code,
            'referrer_reward': referral_config.referrer_reward_amount,
            'referee_reward': referral_config.referee_reward_amount,
            'status': 'Rewarded'
        })
        referral_tracking.insert(ignore_permissions=True)
        return {
            "message": "Referral points awarded",
            "referral_amount":referral_config.referee_reward_amount
        }
    except Exception as e:
        frappe.throw(f"Registration failed: {str(e)}")

@frappe.whitelist(allow_guest=True)
def get_markets():
    try:
        """
        Ultra-optimized version using nested set model queries.
        Returns flat array with children data pre-populated.
        """
        query = """
        SELECT 
            parent.name,
            parent.question,
            parent.category,
            parent.status,
            parent.closing_time,
            parent.end_result,
            parent.total_investment,
            parent.total_traders,
            parent.yes_price,
            parent.no_price,
            parent.max_allowed_quantity,
            parent.closing_value,
            parent.yes_color,
            parent.yes_side_label,
            parent.no_color,
            parent.no_side_label,
            parent.parent_market,
            parent.is_group,
            parent.creation,
            parent.modified,
            GROUP_CONCAT(
                CASE WHEN child.parent_market = parent.name 
                THEN CONCAT(
                    '{"name":"', child.name, '",',
                    '"question":"', REPLACE(child.question, '"', '\\"'), '",',
                    '"status":"', child.status, '",',
                    '"yes_price":', IFNULL(child.yes_price, 0), ',',
                    '"no_price":', IFNULL(child.no_price, 0), '}'
                ) END
                SEPARATOR ','
            ) as children_json
        FROM 
            `tabMarket` parent
        LEFT JOIN 
            `tabMarket` child ON child.parent_market = parent.name AND child.docstatus = 0
        WHERE 
            parent.docstatus = 0
        GROUP BY 
            parent.name, parent.question, parent.category, parent.status,
            parent.closing_time, parent.lft, parent.rgt
        ORDER BY 
            parent.lft ASC
        """
        
        markets = frappe.db.sql(query, as_dict=True)
        
        # Parse children JSON
        for market in markets:
            if market.get("children_json"):
                try:
                    children_data = f"[{market['children_json']}]"
                    market["children"] = frappe.parse_json(children_data)
                except:
                    market["children"] = []
            else:
                market["children"] = []
            
            market["children_count"] = len(market["children"])
            market["has_children"] = market["children_count"] > 0
            # Remove the JSON string as it's no longer needed
            market.pop("children_json", None)
        
        return markets
    except Exception as e:
        frappe.log_error(str(e), "Error in get_market")
        frappe.throw(f"Error in getting market: {str(e)}")