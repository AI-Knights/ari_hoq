import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Block

blocks = Block.objects.all()
print("All blocks:", list(blocks.values('blocker_id', 'blocked_id')))

from django.contrib.auth import get_user_model
User = get_user_model()
u = User.objects.first()
print("Active User ID sending the request:", u.id)
