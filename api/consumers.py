import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from .models import Friendship, Message, DeletedChat
from .serializers import MessageSerializer

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.inbox_group_name = f"inbox_{self.user.id}"

        # Join personal inbox group
        await self.channel_layer.group_add(
            self.inbox_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'inbox_group_name'):
            # Leave inbox group
            await self.channel_layer.group_discard(
                self.inbox_group_name,
                self.channel_name
            )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        content = text_data_json.get('content')
        msg_type = text_data_json.get('type', 'chat_message')
        message_id = text_data_json.get('message_id')
        recipient_id = text_data_json.get('recipient_id')
        
        if msg_type == 'read_receipt' and message_id:
            # Mark message as read
            msg = await self.get_message_and_mark_read(message_id)
            if not msg:
                return

            # Broadcast the read receipt back to the sender's inbox
            await self.channel_layer.group_send(
                f"inbox_{msg.sender_id}",
                {
                    'type': 'message_read_update',
                    'message_id': message_id,
                    'reader_id': str(self.user.id),
                    'partner_id': str(self.user.id)
                }
            )
        elif content and recipient_id:
            # Verify friendship exists before allowing message send
            is_friend = await self.verify_friendship(self.user.id, recipient_id)
            if not is_friend:
                return

            # Save message to database
            message_data = await self.save_message(self.user.id, recipient_id, content)
            
            # Broadcast message to both the sender and recipient's inboxes
            if message_data:
                payload = {
                    'type': 'chat_message',
                    'message': message_data
                }
                await self.channel_layer.group_send(f"inbox_{self.user.id}", payload)
                await self.channel_layer.group_send(f"inbox_{recipient_id}", payload)

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    # Handle read receipt broadcast
    async def message_read_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'message_id': event['message_id'],
            'reader_id': str(event['reader_id']),
            'partner_id': str(event['partner_id']) if event.get('partner_id') else None
        }))

    @database_sync_to_async
    def verify_friendship(self, user_id, partner_id):
        return Friendship.objects.filter(
            Q(user1_id=user_id, user2_id=partner_id) | Q(user1_id=partner_id, user2_id=user_id),
            status='accepted'
        ).exists()

    @database_sync_to_async
    def save_message(self, sender_id, recipient_id, content):
        recipient = User.objects.get(id=recipient_id)
        message = Message.objects.create(
            sender_id=sender_id,
            recipient=recipient,
            content=content
        )
        return MessageSerializer(message).data

    @database_sync_to_async
    def get_message_and_mark_read(self, message_id):
        try:
            msg = Message.objects.get(id=message_id, recipient=self.user)
            if not msg.is_read:
                msg.is_read = True
                msg.save(update_fields=['is_read'])
            return msg
        except Message.DoesNotExist:
            return None

class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.user_group_name = f"status_{self.user.id}"
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        await self.accept()

        # Update last_active and broadcast to friends
        await self.update_last_active()
        await self.broadcast_status('online')

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
            # Update last_active and broadcast to friends
            await self.update_last_active()
            await self.broadcast_status('offline')

    @database_sync_to_async
    def update_last_active(self):
        self.user.last_active = timezone.now()
        self.user.save(update_fields=['last_active'])

    @database_sync_to_async
    def get_friend_ids(self):
        friendships = Friendship.objects.filter(
            Q(user1=self.user) | Q(user2=self.user),
            status='accepted'
        )
        friend_ids = []
        for f in friendships:
            friend_ids.append(f.user2_id if f.user1_id == self.user.id else f.user1_id)
        return friend_ids

    async def broadcast_status(self, status):
        friend_ids = await self.get_friend_ids()
        for friend_id in friend_ids:
            await self.channel_layer.group_send(
                f"status_{friend_id}",
                {
                    'type': 'status_update',
                    'user_id': str(self.user.id),
                    'status': status
                }
            )

    async def status_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'user_id': str(event['user_id']),
            'status': event['status']
        }))
