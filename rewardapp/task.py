import frappe
import re
from datetime import datetime, timedelta
from frappe.utils import now, now_datetime

@frappe.whitelist(allow_guest=True)
def execute():
    try:
        # Fetch matching Orders
        orders = frappe.get_all("Orders", 
            filters={
                "status": "UNMATCHED",
                "order_type": "BUY",
                "auto_cancel": 1,
                "cancel_time": ("<=", now())
            }, 
            pluck="name"
        )

        for order_name in orders:
            doc = frappe.get_doc("Orders", order_name)
            doc.status = "CANCELED"
            doc.save()  # This triggers hooks like on_update, etc.

        frappe.db.commit()  # Commit changes
    except Exception as e:
        frappe.log_error("Error in auto cancelling", f"{str(e)}")
        frappe.throw(f"Error in auto cancelling: {str(e)}")

def get_last_resolved_market():
    """
    Get the last resolved market record for crypto category
    """
    try:
        filters = {
            'status': 'RESOLVED',
            'category': 'Crypto'
        }
        
        last_market = frappe.get_list(
            'Market',
            filters=filters,
            fields=['*'],
            order_by='modified desc',
            limit=1
        )
        
        if last_market:
            return frappe.get_doc('Market', last_market[0].name)
        
        return None
        
    except Exception as e:
        frappe.log_error(f"Error getting last resolved market: {str(e)}")
        return None

def extract_price_from_question(question):
    """
    Extract price from question text
    Returns the price as float or None if not found
    """
    try:
        # Pattern to match price in format like "105390.05 USDT"
        price_pattern = r'(\d+(?:\.\d+)?)\s*USDT'
        match = re.search(price_pattern, question)
        
        if match:
            return float(match.group(1))
        return None
        
    except Exception as e:
        frappe.log_error(f"Error extracting price from question: {str(e)}")
        return None

def calculate_new_price(question_price, closing_value):
    """
    Calculate new price based on closing value vs question price
    If closing value < question price: new price = closing value + 100
    If closing value >= question price: new price = closing value - 100
    """
    try:
        # If closing value is less than question price, add 100 to closing value
        # Otherwise subtract 100 from closing value
        if closing_value < question_price:
            new_price = closing_value + 100
        else:
            new_price = closing_value - 100
            
        # Ensure price doesn't go negative
        if new_price < 0:
            new_price = closing_value + 100
            
        return round(new_price, 2)
        
    except Exception as e:
        frappe.log_error(f"Error calculating new price: {str(e)}")
        return None

def format_time_for_question(datetime_obj):
    """
    Format datetime object to readable time for question
    """
    try:
        return datetime_obj.strftime("%I:%M %p")  # e.g., "11:10 AM"
    except Exception as e:
        frappe.log_error(f"Error formatting time: {str(e)}")
        return "12:00 PM"

def generate_new_question(template_question, new_price, new_time):
    """
    Generate new question with updated price and time
    """
    try:
        # Replace price in the question
        price_pattern = r'(\d+(?:\.\d+)?)\s*USDT'
        new_question = re.sub(price_pattern, f'{new_price:.2f} USDT', template_question)
        
        # Replace time in the question
        # Pattern to match time like "11:10 AM" or "2:30 PM"
        time_pattern = r'\d{1,2}:\d{2}\s*(?:AM|PM)'
        new_question = re.sub(time_pattern, new_time, new_question, flags=re.IGNORECASE)
        
        return new_question
        
    except Exception as e:
        frappe.log_error(f"Error generating new question: {str(e)}")
        return template_question

@frappe.whitelist(allow_guest=True)
def create_new_market_record():
    """
    Create a new market record by duplicating the last resolved one
    """
    try:
        # Get the template market
        template_market = get_last_resolved_market()
        frappe.log_error("Resolved Market",template_market)
        if not template_market:
            frappe.log_error("No resolved market found")
            return {"status": "error", "message": "No resolved market found"}
        
        # Get closing value from the resolved market
        if not hasattr(template_market, 'closing_value') or template_market.closing_value is None:
            frappe.log_error("No closing_value found in resolved market")
            return {"status": "error", "message": "No closing_value found in resolved market"}
        
        closing_value = float(template_market.closing_value)
        
        # Extract question price
        question_price = extract_price_from_question(template_market.question)
        if question_price is None:
            frappe.log_error("Could not extract price from question")
            return {"status": "error", "message": "Could not extract price from question"}
        
        # Calculate new price
        new_price = calculate_new_price(question_price, closing_value)
        if new_price is None:
            frappe.log_error("Could not calculate new price")
            return {"status": "error", "message": "Could not calculate new price"}
        
        # Create new market document
        new_market = frappe.new_doc('Market')
        
        # Set closing time first to generate the time for question
        current_time = now_datetime()
        frequency = getattr(template_market, 'frequency', 10)  # Default to 10 if not set
        new_closing_time = current_time + timedelta(minutes=int(frequency))
        new_market.closing_time = new_closing_time
        
        # Generate new question with updated price and time
        new_time_str = format_time_for_question(new_closing_time)
        new_question = generate_new_question(template_market.question, new_price, new_time_str)
        
        # Copy ALL fields from template except the ones we want to reset
        exclude_fields = [
            'name', 'creation', 'modified', 'modified_by', 'owner', 'docstatus',
            'question', 'status', 'total_investment', 'total_traders', 'end_result', 'closing_time'
        ]
        
        for field in template_market.as_dict():
            if field not in exclude_fields:
                setattr(new_market, field, getattr(template_market, field))
        
        # Set the new question and reset values
        new_market.question = new_question
        new_market.status = 'OPEN'
        new_market.total_investment = 0
        new_market.total_traders = 0
        new_market.end_result = ''
        new_market.version = 0
        
        # Insert the new market
        new_market.insert()
        frappe.db.commit()

        success_message = f"Created new crypto market: {new_market.name}"
        frappe.logger().info(success_message)
        
        return {
            "status": "success", 
            "message": success_message,
            "market_name": new_market.name,
            "question_price": question_price,
            "closing_value": closing_value,
            "new_price": new_price,
            "new_question": new_question
        }
        
    except Exception as e:
        error_msg = f"Error creating new market record: {str(e)}"
        frappe.log_error(error_msg)
        return {"status": "error", "message": error_msg}
