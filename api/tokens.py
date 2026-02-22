"""Custom JWT tokens — adds email and role to payload (rb-woodroff pattern)"""

from rest_framework_simplejwt.tokens import RefreshToken, AccessToken


class CustomAccessToken(AccessToken):
    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name or user.username
        return token


class CustomRefreshToken(RefreshToken):
    access_token_class = CustomAccessToken

    @classmethod
    def for_user(cls, user):
        token = super().for_user(user)
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.full_name or user.username
        token._user = user
        return token

    @property
    def access_token(self):
        access = self.access_token_class()
        access.set_exp(from_time=self.current_time)
        access['user_id'] = self['user_id']
        if hasattr(self, '_user'):
            u = self._user
            access['email'] = u.email
            access['role'] = u.role
            access['full_name'] = u.full_name or u.username
        else:
            access['email'] = self.get('email')
            access['role'] = self.get('role')
            access['full_name'] = self.get('full_name')
        return access
