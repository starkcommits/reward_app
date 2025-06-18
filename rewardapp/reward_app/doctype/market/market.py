# Copyright (c) 2025, xFer India100x pvt ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Market(Document):
    def validate(self):
        if self.category:
            values = frappe.db.get_value(
                'Market Category',
                self.category,
                ['yes_color', 'no_color'],
                as_dict=True
            )
            if values:
                self.yes_color = values.yes_color
                self.no_color = values.no_color

                
    pass
