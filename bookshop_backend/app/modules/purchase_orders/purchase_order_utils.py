"""
Utility functions for purchase order operations
"""
from datetime import datetime, timedelta
from typing import Optional


def generate_order_number(latest_order_number: Optional[str] = None) -> str:
    """
    Generate the next order number in format A0001, A0002, etc.
    
    Args:
        latest_order_number: The most recent order number to increment from
        
    Returns:
        The next order number in sequence
    """
    if latest_order_number:
        try:
            # Extract number from format A0001 and increment
            number_part = int(latest_order_number[1:])  # Remove 'A' prefix
            next_number = number_part + 1
        except (ValueError, IndexError):
            next_number = 1
    else:
        next_number = 1
    
    # Format as A0001, A0002, etc.
    return f"A{next_number:04d}"


def calculate_expected_delivery_date(order_date: Optional[datetime] = None, days_offset: int = 5) -> datetime:
    """
    Calculate expected delivery date based on order date plus offset days
    
    Args:
        order_date: The order date (defaults to current datetime)
        days_offset: Number of days to add for delivery (defaults to 5)
        
    Returns:
        Expected delivery datetime
    """
    if order_date is None:
        order_date = datetime.utcnow()
    
    return order_date + timedelta(days=days_offset)
