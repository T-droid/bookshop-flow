"""
KCB Buni API integration utilities for M-Pesa STK Push payments.

Handles:
- Phone number formatting to 2547XXXXXXXX format
- OAuth2 token generation
- STK Push initiation
"""

import httpx
import base64
import re
import os
import logging
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)

# KCB Buni API configuration
KCB_CONSUMER_KEY = os.getenv("KCB_CONSUMER_KEY", "")
KCB_CONSUMER_SECRET = os.getenv("KCB_CONSUMER_SECRET", "")
KCB_ORG_SHORTCODE = os.getenv("KCB_ORG_SHORTCODE", "533533")
KCB_CALLBACK_URL = os.getenv("KCB_CALLBACK_URL", "")
BASE_URL = os.getenv("KCB_BASE_URL", "")

# Token cache
_token_cache = {
    "access_token": None,
    "expires_at": None,
}


def format_phone_number(phone: str) -> str:
    """
    Normalize a Kenyan phone number to 2547XXXXXXXX format.
    
    Handles the following input formats:
    - 0712345678  -> 254712345678
    - +254712345678 -> 254712345678
    - 254712345678 -> 254712345678
    - 0112345678  -> 254112345678 (Safaricom 011x numbers)
    - +254112345678 -> 254112345678
    - 712345678   -> 254712345678
    
    Raises ValueError if the phone number format is invalid.
    """
    # Remove all whitespace, dashes, and parentheses
    phone = re.sub(r'[\s\-\(\)\+]', '', phone)
    
    # Remove any non-digit characters
    phone = re.sub(r'[^\d]', '', phone)
    
    if not phone:
        raise ValueError("Phone number cannot be empty")
    
    # Handle various formats
    if phone.startswith('0') and len(phone) == 10:
        # 07XXXXXXXX or 01XXXXXXXX -> 2547XXXXXXXX or 2541XXXXXXXX
        phone = '254' + phone[1:]
    elif phone.startswith('254') and len(phone) == 12:
        # Already in correct format
        pass
    elif len(phone) == 9 and (phone.startswith('7') or phone.startswith('1')):
        # 7XXXXXXXX or 1XXXXXXXX -> 2547XXXXXXXX or 2541XXXXXXXX
        phone = '254' + phone
    else:
        raise ValueError(
            f"Invalid phone number format: {phone}. "
            "Expected formats: 07XXXXXXXX, +254XXXXXXXXX, 254XXXXXXXXX, or 7XXXXXXXX"
        )
    
    # Validate final format
    if not re.match(r'^254[17]\d{8}$', phone):
        raise ValueError(
            f"Phone number {phone} does not match expected Kenyan format (254[17]XXXXXXXX)"
        )
    
    return phone


async def get_access_token() -> str:
    """
    Get an OAuth2 access token from KCB Buni API.
    Uses client_credentials grant type.
    Caches token until expiry.
    """
    global _token_cache
    
    # Check cache
    if (_token_cache["access_token"] 
        and _token_cache["expires_at"] 
        and datetime.now() < _token_cache["expires_at"]):
        return _token_cache["access_token"]
    
    token_url = f"{BASE_URL}/token?grant_type=client_credentials"
    
    # Create Basic auth header
    credentials = f"{KCB_CONSUMER_KEY}:{KCB_CONSUMER_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    headers = {
        "Authorization": f"Basic {encoded_credentials}",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(token_url, headers=headers)
            
            try:
                data = response.json()
            except Exception:
                data = {"message": response.text}
            
            if not response.is_success:
                logger.error(f"KCB Token generation error: status={response.status_code}, statusText={response.reason_phrase}, data={data}")
                error_msg = data.get('errorMessage') or data.get('message') or response.reason_phrase
                raise Exception(f"Failed to generate KCB token: {error_msg}")
            
            if not data.get("access_token"):
                logger.error(f"KCB Token response missing 'access_token': {data}")
                raise Exception("Invalid response from KCB token endpoint")
            
            access_token = data.get("access_token")
            expires_in = int(data.get("expires_in", 3600))
            
            # Cache token with some buffer (subtract 60 seconds)
            _token_cache["access_token"] = access_token
            _token_cache["expires_at"] = datetime.now() + timedelta(seconds=expires_in - 60)
            
            logger.info("KCB access token obtained successfully")
            return access_token
        except Exception as error:
            logger.error(f"Error in get_access_token: {error}")
            raise error


async def initiate_stk_push(
    phone_number: str,
    amount: str,
    invoice_number: str,
    transaction_description: str = "Payment"
) -> dict:
    """
    Initiate an M-Pesa STK Push via KCB Buni API.
    
    Args:
        phone_number: Customer phone in 2547XXXXXXXX format (will be formatted if not)
        amount: Transaction amount in KES
        invoice_number: Unique identifier for the transaction
        callback_url: Override the default callback URL
        transaction_description: Description for the transaction
    
    Returns:
        dict with the STK push response from KCB
    """
    # Format phone number
    formatted_phone = format_phone_number(phone_number)
    
    # Get access token
    access_token = await get_access_token()
    
    stk_url = f"{BASE_URL}/mm/api/request/1.0.0/stkpush"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "phoneNumber": formatted_phone,
        "amount": str(amount),
        "invoiceNumber": invoice_number,
        "sharedShortCode": True,
        "orgShortCode": KCB_ORG_SHORTCODE,
        "callbackUrl": KCB_CALLBACK_URL,
        "transactionDescription": transaction_description,
    }
    
    logger.info(f"Initiating STK push for {formatted_phone}, amount: {amount}, invoice: {invoice_number}")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(stk_url, json=payload, headers=headers)
        
        if response.status_code != 200:
            logger.error(f"STK push failed: {response.status_code} - {response.text}")
            raise Exception(f"STK push request failed: {response.text}")
        
        data = response.json()
        logger.info(f"STK push initiated successfully: {data}")
        return data
