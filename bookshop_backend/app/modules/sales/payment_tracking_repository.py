from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from ...db import models
from datetime import datetime
from decimal import Decimal
from typing import Optional
import uuid


class PaymentTrackingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_mpesa_payment_intent(
        self,
        tenant_id: uuid.UUID,
        amount: Decimal,
        payment_method: str,
        invoice_number: str,
        checkout_request_id: str,
        sale_data_snapshot: dict,
        raw_request_json: dict,
        expires_at: datetime,
        provider: str = "kcb_buni",
        currency: str = "KES",
    ) -> models.Payments:
        payment = models.Payments(
            tenant_id=tenant_id,
            provider=provider,
            payment_method=payment_method,
            amount=amount,
            currency=currency,
            invoice_number=invoice_number,
            checkout_request_id=checkout_request_id,
            sale_data_snapshot=sale_data_snapshot,
            raw_request_json=raw_request_json,
            status="pending",
            expires_at=expires_at,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        self.db.add(payment)
        await self.db.commit()
        await self.db.refresh(payment)
        return payment

    async def get_by_checkout_or_invoice(
        self,
        lookup_value: str,
        tenant_id: Optional[uuid.UUID] = None,
    ) -> Optional[models.Payments]:
        if not lookup_value:
            return None

        stmt = select(models.Payments).where(
            (models.Payments.checkout_request_id == lookup_value)
            | (models.Payments.invoice_number == lookup_value)
        )
        if tenant_id:
            stmt = stmt.where(models.Payments.tenant_id == tenant_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_recent_pending_payments(self, limit: int = 100) -> list[models.Payments]:
        stmt = (
            select(models.Payments)
            .where(models.Payments.status == "pending")
            .order_by(models.Payments.created_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def expire_stale_pending(self, cutoff: datetime) -> int:
        stmt = select(models.Payments).where(
            models.Payments.status == "pending",
            models.Payments.expires_at.is_not(None),
            models.Payments.expires_at < cutoff,
        )
        result = await self.db.execute(stmt)
        stale = result.scalars().all()

        updated = 0
        for payment in stale:
            payment.status = "expired"
            payment.failure_reason = payment.failure_reason or "Payment request expired"
            payment.updated_at = datetime.now()
            self.db.add(payment)
            updated += 1

        if updated:
            await self.db.commit()

        return updated

    async def mark_callback_received(
        self,
        payment: models.Payments,
        raw_callback_json: dict,
    ) -> models.Payments:
        payment.raw_callback_json = raw_callback_json
        payment.callback_received_at = datetime.now()
        payment.updated_at = datetime.now()
        self.db.add(payment)
        await self.db.commit()
        await self.db.refresh(payment)
        return payment

    async def mark_completed(
        self,
        payment: models.Payments,
        sale_id: uuid.UUID,
        provider_receipt: Optional[str] = None,
    ) -> models.Payments:
        payment.status = "completed"
        payment.sale_id = sale_id
        payment.provider_receipt = provider_receipt or payment.provider_receipt
        payment.failure_code = None
        payment.failure_reason = None
        payment.completed_at = datetime.now()
        payment.updated_at = datetime.now()
        self.db.add(payment)
        await self.db.commit()
        await self.db.refresh(payment)
        return payment

    async def mark_failed(
        self,
        payment: models.Payments,
        reason: str,
        code: Optional[str] = None,
    ) -> models.Payments:
        payment.status = "failed"
        payment.failure_code = code
        payment.failure_reason = reason
        payment.updated_at = datetime.now()
        self.db.add(payment)
        await self.db.commit()
        await self.db.refresh(payment)
        return payment
