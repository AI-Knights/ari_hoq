import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class ComplexPasswordValidator:
    """
    Validate whether the password contains:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    - At least 1 special character
    """
    def validate(self, password, user=None):
        if len(password) < 8:
            raise ValidationError(
                _("This password must contain at least 8 characters."),
                code='password_too_short',
            )
        if not re.findall(r'[A-Z]', password):
            raise ValidationError(
                _("This password must contain at least 1 uppercase letter."),
                code='password_no_upper',
            )
        if not re.findall(r'[a-z]', password):
            raise ValidationError(
                _("This password must contain at least 1 lowercase letter."),
                code='password_no_lower',
            )
        if not re.findall(r'\d', password):
            raise ValidationError(
                _("This password must contain at least 1 number."),
                code='password_no_number',
            )
        if not re.findall(r'[()[\]{}|\\`~!@#$%^&*_\-+=;:\'",<>./?]', password):
            raise ValidationError(
                _("This password must contain at least 1 special character."),
                code='password_no_special',
            )

    def get_help_text(self):
        return _(
            "Your password must contain at least 8 characters, "
            "1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
        )
