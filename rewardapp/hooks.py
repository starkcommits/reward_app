app_name = "rewardapp"
app_title = "Reward App"
app_publisher = "xFer India100x pvt ltd."
app_description = "Reward App"
app_email = "xfer@india100x.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "rewardapp",
# 		"logo": "/assets/rewardapp/logo.png",
# 		"title": "Reward App",
# 		"route": "/rewardapp",
# 		"has_permission": "rewardapp.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/rewardapp/css/rewardapp.css"
# app_include_js = "/assets/rewardapp/js/rewardapp.js"

# include js, css files in header of web template
# web_include_css = "/assets/rewardapp/css/rewardapp.css"
# web_include_js = "/assets/rewardapp/js/rewardapp.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "rewardapp/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "rewardapp/public/icons.svg"
# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "rewardapp.utils.jinja_methods",
# 	"filters": "rewardapp.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "rewardapp.install.before_install"
# after_install = "rewardapp.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "rewardapp.uninstall.before_uninstall"
# after_uninstall = "rewardapp.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "rewardapp.utils.before_app_install"
# after_app_install = "rewardapp.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "rewardapp.utils.before_app_uninstall"
# after_app_uninstall = "rewardapp.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "rewardapp.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

doc_events = {
	"Orders": {
		"on_update": "rewardapp.wallet.wallet_operation"
	},
    "Market": {
        "on_update": "rewardapp.engine.market"
    },
    "Holding": {
        "on_update": "rewardapp.engine.holding"
    }
}

api = {
    "methods" : [
        "rewardapp.api.signup",
        "rewardapp.api.generate_mobile_otp",
        "rewardapp.api.verify_otp",
        "rewardapp.api.execute",
        "rewardapp.api.update_profile",
        "rewardapp.api.check_password_strength",
        "rewardapp.api.check_referral",
        "rewardapp.api.get_markets",
        "rewardapp.wallet.get_balance",
        "rewardapp.wallet.recharge_wallet",
        "rewardapp.engine.update_order",
        "rewardapp.engine.trades",
        "rewardapp.engine.total_exit",
        "rewardapp.engine.resolve_market",
        "rewardapp.engine.unmatched_orders",
        "rewardapp.engine.market_settlements",
        "rewardapp.engine.update_market_price",
        "rewardapp.engine.get_marketwise_transaction_summary",
        "rewardapp.engine.get_available_quantity",
        "rewardapp.engine.update_order_price",
        "rewardapp.wallet.get_deposit_and_withdrawal",
        "rewardapp.engine.total_returns",
        "rewardapp.engine.cancel_order",
        "rewardapp.engine.total_traders",
        "rewardapp.engine.get_marketwise_holding",
        "rewardapp.task.execute",
        "rewardapp.api.logout"
    ]
}

# scheduler_events = {
#     "cron": {
#         "*/1 * * * *": [
#             "rewardapp.task.execute"
#         ]
#     }
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"rewardapp.tasks.all"
# 	],
# 	"daily": [
# 		"rewardapp.tasks.daily"
# 	],
# 	"hourly": [
# 		"rewardapp.tasks.hourly"
# 	],
# 	"weekly": [
# 		"rewardapp.tasks.weekly"
# 	],
# 	"monthly": [
# 		"rewardapp.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "rewardapp.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "rewardapp.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "rewardapp.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["rewardapp.utils.before_request"]
# after_request = ["rewardapp.utils.after_request"]

# Job Events
# ----------
# before_job = ["rewardapp.utils.before_job"]
# after_job = ["rewardapp.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"rewardapp.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }


website_route_rules = [{'from_route': '/admin/<path:app_path>', 'to_route': 'admin'}, {'from_route': '/trade/<path:app_path>', 'to_route': 'trade'},]
