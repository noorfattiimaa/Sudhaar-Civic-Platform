from django.core.exceptions import ValidationError
import re


def validate_password_strength(password):
    """
    Validate that password contains:
    - At least one number
    - At least one symbol (special character)
    - Minimum 8 characters
    """
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long.")
    
    if not re.search(r'\d', password):
        raise ValidationError("Password must contain at least one number.")
    
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>/?]', password):
        raise ValidationError("Password must contain at least one symbol (!@#$%^&* etc.).")
    
    return password


def validate_name_length(value):
    """Validate that name is not longer than 50 characters"""
    if len(value) > 50:
        raise ValidationError("Name cannot be longer than 50 characters.")
    return value


def validate_phone_number(value):
    """Validate phone number format (Pakistani format: 03XXXXXXXXX)"""
    if not value:
        return value
    
    # Remove all non-digits
    cleaned = re.sub(r'\D', '', value)
    
    # Check if it's exactly 11 digits
    if len(cleaned) != 11:
        raise ValidationError("Phone number must be exactly 11 digits (e.g., 03211234567).")
    
    if not cleaned.startswith('03'):
         raise ValidationError("Phone number must start with '03'.")
    
    return cleaned


def validate_cnic(value):
    """Validate CNIC format (13 digits numeric)"""
    if not value:
        return value
    
    # Remove all non-digits
    cleaned = re.sub(r'\D', '', value)
    
    # Check if it's 13 digits
    if len(cleaned) != 13:
        raise ValidationError("CNIC must be exactly 13 digits.")
    
    return cleaned


def validate_email_domain(value):
    """Validate email format"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, value):
        raise ValidationError("Please enter a valid email address.")
    return value

