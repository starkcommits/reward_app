# Copyright (c) 2025, xFer India100x pvt ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Trades(Document):
    def before_insert(self):
        if self.first_user_id:
            self.first_user_name = frappe.db.get_value('User', self.first_user_id, 'full_name') or ""
        if self.second_user_id:
            self.second_user_name = frappe.db.get_value('User', self.second_user_id, 'full_name') or ""
