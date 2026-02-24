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
        
        if msg_type == 'read_receipt':
            message_id = text_data_json.get('message_id')
            message_ids = text_data_json.get('message_ids', [])
            
            # Normalize to list
            to_process = [message_id] if message_id else message_ids
            if not to_process:
                return

            # Mark messages as read and get the sender(s)
            # We assume for now they belong to the same sender for a single signal
            sender_id = await self.process_read_receipts(to_process)
            if sender_id:
                # Broadcast the read receipt back to the sender
                await self.channel_layer.group_send(
                    f"inbox_{sender_id}",
                    {
                        'type': 'message_read_update',
                        'message_ids': to_process,
                        'reader_id': str(self.user.id),
                        'partner_id': str(self.user.id)
                    }
                )
        elif msg_type == 'ping':
            # Respond to heartbeat
            await self.send(text_data=json.dumps({'type': 'pong'}))

        elif msg_type in [
            'call_initiate', 'call_accept', 'call_reject', 'call_end', 
            'call_ringing', 'call_cancelled', 'call_busy', 'call_missed',
            'user_muted', 'user_unmuted', 'camera_on', 'camera_off'
        ] and recipient_id:
            # Route video call signaling (including mute/camera state) to recipient
            is_friend = await self.verify_friendship(self.user.id, recipient_id)
            if not is_friend:
                return

            await self.channel_layer.group_send(
                f"inbox_{recipient_id}",
                {
                    'type': 'call_signal',
                    'signal_type': msg_type,
                    'sender_id': str(self.user.id),
                    'channel_name': text_data_json.get('channel_name'),
                    'caller_info': text_data_json.get('caller_info'),  # forwarded from caller
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
                # Include temp_id for the sender to match their optimistic message
                payload = {
                    'type': 'chat_message',
                    'message': message_data,
                    'temp_id': text_data_json.get('temp_id')
                }
                await self.channel_layer.group_send(f"inbox_{self.user.id}", payload)
                await self.channel_layer.group_send(f"inbox_{recipient_id}", payload)

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message,
            'temp_id': event.get('temp_id')
        }))

    # Handle read receipt broadcast
    async def message_read_update(self, event):
        payload = {
            'type': 'read_receipt',
            'reader_id': str(event['reader_id']),
            'partner_id': str(event['partner_id']) if event.get('partner_id') else None
        }
        if 'message_ids' in event:
            payload['message_ids'] = event['message_ids']
        elif 'message_id' in event:
            payload['message_id'] = event['message_id']
            
        await self.send(text_data=json.dumps(payload))

    # Handle video call signals
    async def call_signal(self, event):
        payload = {
            'type': event['signal_type'],
            'sender_id': event['sender_id']
        }
        if 'channel_name' in event and event['channel_name']:
            payload['channel_name'] = event['channel_name']
        
        if 'caller_info' in event:
            payload['caller_info'] = event['caller_info']
            
        await self.send(text_data=json.dumps(payload))

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
    def process_read_receipts(self, message_ids):
        """Mark messages as read and return the sender_id of the first one."""
        msgs = Message.objects.filter(id__in=message_ids, recipient=self.user, is_read=False)
        if not msgs.exists():
            # Might already be read
            first = Message.objects.filter(id__in=message_ids).first()
            return str(first.sender_id) if first else None
            
        first_sender_id = msgs.first().sender_id
        msgs.update(is_read=True)
        return str(first_sender_id)

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
