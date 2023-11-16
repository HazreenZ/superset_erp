from __future__ import unicode_literals
from frappe import _

def get_data():
    return [
        {
            "label": _("Superset Integration"),
            "icon": "fa fa-star",
            "items": [
                {
                    "type": "doctype",
                    "name": "superset setting",
                    "description": _("Connection to Superset."),
                    "onboard": 1,
                },
                {
                    "type": "page",
                    "name": "superset-integration",
                    "label":_("Superset Dashboard"),
                    "description": _("Visualize the dashboard."),
                    "onboard": 1,
                },
            ]
        },
    ]
