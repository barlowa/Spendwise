import requests
from utils import env_var

AUTH0_DOMAIN = env_var("MGMT_API_AUTH0_DOMAIN")
CLIENT_ID = env_var("MGMT_API_AUTH0_CLIENT_ID")
CLIENT_SECRET = env_var("MGMT_API_AUTH0_CLIENT_SECRET")
AUDIENCE = env_var("MGMT_API_AUTH0_AUDIENCE")


def get_management_token() -> str:

    response = requests.post(
        f"https://{AUTH0_DOMAIN}/oauth/token",
        json={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "audience": AUDIENCE,
            "grant_type": "client_credentials",
        },
        timeout=10,
    )
    # response.raise_for_status()
    if not response.ok:
        print("Auth0 status:", response.status_code)
        print("Auth0 error:", response.text)
        response.raise_for_status()

    return response.json()["access_token"]
