import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()
u = User.objects.first()
client = APIClient()
client.force_authenticate(user=u)

target_id = "85abff8b-09ba-49ca-aeb8-86f22d53e91f"
res = client.get(f'/api/users/{target_id}/')

print(f"Status: {res.status_code}")
print(f"Data: {res.data}")
