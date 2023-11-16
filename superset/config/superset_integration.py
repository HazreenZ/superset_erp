# # superset_integration.py

# import requests

# def get_superset_access_token(username, password):
#     superset_api_url = 'http://localhost:8088/api/v1/security/login'
#     credentials = {'username': admin, 'password': admin}

#     response = requests.post(superset_api_url, json=credentials)

#     if response.status_code == 200:
#         return response.json().get('access_token')
#     else:
#         # Handle authentication error
#         return None

# def get_superset_guest_token():
#     superset_guest_token_url = 'http://localhost:8088/api/v1/security/guest_token/'

#     response = requests.get(superset_guest_token_url)

#     if response.status_code == 200:
#         return response.json().get('guest_token')
#     else:
#         # Handle error
#         return None
