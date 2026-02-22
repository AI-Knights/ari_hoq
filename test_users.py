import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
u = User.objects.first()
print(f"User ID: {u.id}, name: {u.username}")
