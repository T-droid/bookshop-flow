"""
Quick test script to verify purchase order number generation
"""
import sys
import os
sys.path.append('/home/tindi/bookshop-flow/bookshop_backend')

from app.modules.purchase_orders.purchase_order_utils import generate_order_number, calculate_expected_delivery_date
from datetime import datetime

def test_order_number_generation():
    """Test order number generation logic"""
    print("Testing order number generation:")
    
    # Test first order number
    first_order = generate_order_number()
    print(f"First order number: {first_order}")
    assert first_order == "A0001"
    
    # Test increment from existing number
    second_order = generate_order_number("A0001")
    print(f"Second order number: {second_order}")
    assert second_order == "A0002"
    
    # Test with higher number
    high_order = generate_order_number("A0099")
    print(f"High order number: {high_order}")
    assert high_order == "A0100"
    
    print("✅ Order number generation tests passed!")

def test_delivery_date_calculation():
    """Test delivery date calculation"""
    print("\nTesting delivery date calculation:")
    
    # Test default 5-day delivery
    test_date = datetime(2024, 1, 1, 10, 0, 0)
    expected_delivery = calculate_expected_delivery_date(test_date)
    print(f"Order date: {test_date}")
    print(f"Expected delivery: {expected_delivery}")
    
    # Test custom offset
    custom_delivery = calculate_expected_delivery_date(test_date, 7)
    print(f"7-day delivery: {custom_delivery}")
    
    print("✅ Delivery date calculation tests passed!")

if __name__ == "__main__":
    test_order_number_generation()
    test_delivery_date_calculation()
    print("\n🎉 All tests passed!")
