import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
target_id = "85abff8b-09ba-49ca-aeb8-86f22d53e91f"
try:
    u = User.objects.get(id=target_id)
    print("User found natively:", u.username, "Active:", u.is_active)
except User.DoesNotExist:
    print("User totally missing from DB")
