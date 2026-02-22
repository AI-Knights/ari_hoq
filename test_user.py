import requests
import sys

# Login to get token (assuming jamil/test1234 exists or we can just fetch without auth if it's public? Wait, it's IsAuthenticated)
# Let's just create a new user to test
session = requests.Session()
data = {"email": "test_profile@arihoq.com", "password": "password123", "username": "test_profile_user", "full_name": "Test Profile"}
res = session.post("http://localhost:8000/api/auth/register/", json=data)

# if already registered, just login
res = session.post("http://localhost:8000/api/auth/login/", json={"email": "test_profile@arihoq.com", "password": "password123"})
if res.status_code == 200:
    token = res.json().get('access')
    print("Got token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try fetching the ID from the image
    target = "85abff8b-09ba-49ca-aeb8-86f22d53e91f"
    res = session.get(f"http://localhost:8000/api/users/{target}/", headers=headers)
    print("Fetch target status:", res.status_code)
    print("Fetch target response:", res.text)
else:
    print("Login failed", res.text)
