from ...db.session import SessionDep
from .payment_tracking_repository import PaymentTrackingRepository
from ...db import models
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional
import uuid


class PaymentTrackingService:
    def __init__(self, db: SessionDep):
        self.repository = PaymentTrackingRepository(db)

    async def cleanup_expired_payments(self) -> int:
        return await self.repository.expire_stale_pending(datetime.now())

    async def create_pending_mpesa_payment(
        self,
        tenant_id: uuid.UUID,
        amount: Decimal,
        payment_method: str,
        invoice_number: str,
        checkout_request_id: str,
        sale_data_snapshot: dict,
        raw_request_json: dict,
        expires_in_minutes: int = 10,
    ) -> models.Payments:
        expires_at = datetime.now() + timedelta(minutes=expires_in_minutes)
        return await self.repository.create_mpesa_payment_intent(
            tenant_id=tenant_id,
            amount=amount,
            payment_method=payment_method,
            invoice_number=invoice_number,
            checkout_request_id=checkout_request_id,
            sale_data_snapshot=sale_data_snapshot,
            raw_request_json=raw_request_json,
            expires_at=expires_at,
        )

    async def get_payment_status_by_lookup(
        self,
        invoice_number: str,
        tenant_id: uuid.UUID,
    ) -> Optional[models.Payments]:
        return await self.repository.get_by_checkout_or_invoice(
            lookup_value=invoice_number,
            tenant_id=tenant_id,
        )

    async def find_payment_for_callback(
        self,
        checkout_request_id: Optional[str],
        invoice_number: Optional[str],
        merchant_request_id: Optional[str] = None,
    ) -> Optional[models.Payments]:
        if checkout_request_id:
            payment = await self.repository.get_by_checkout_or_invoice(checkout_request_id)
            if payment:
                return payment

        if invoice_number:
            payment = await self.repository.get_by_checkout_or_invoice(invoice_number)
            if payment:
                return payment

        # Backward-compatible fallback:
        # older rows may have checkout_request_id incorrectly stored as invoice_number.
        # We attempt to match by merchant request ID kept in raw_request_json.
        if merchant_request_id:
            recent_pending = await self.repository.list_recent_pending_payments(limit=200)
            for payment in recent_pending:
                raw_request = payment.raw_request_json or {}
                merchant_id = (
                    raw_request.get("merchant_request_id")
                    or raw_request.get("stk_response", {}).get("MerchantRequestID")
                    or raw_request.get("stk_response", {}).get("response", {}).get("MerchantRequestID")
                )
                if merchant_id == merchant_request_id:
                    return payment

        return None
