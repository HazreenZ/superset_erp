# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"module_name": "Dashboard",
			"category": "Modules",
			"label": _("Superset"),
			"color": "grey",
			'icon': 'octicon octicon-graph',
			"type": "module",
			"description": "Superset Integration with ERPNext",
		}
	]
