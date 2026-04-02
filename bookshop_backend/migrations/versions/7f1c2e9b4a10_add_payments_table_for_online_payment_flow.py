"""add_payments_table_for_online_payment_flow

Revision ID: 7f1c2e9b4a10
Revises: 5ba8d9bb271b
Create Date: 2026-04-01 23:12:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = '7f1c2e9b4a10'
down_revision: Union[str, Sequence[str], None] = '5ba8d9bb271b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'payments',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('tenant_id', sa.Uuid(), nullable=False),
        sa.Column('sale_id', sa.Uuid(), nullable=True),
        sa.Column('provider', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('payment_method', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('currency', sqlmodel.sql.sqltypes.AutoString(length=10), nullable=False),
        sa.Column('invoice_number', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True),
        sa.Column('checkout_request_id', sqlmodel.sql.sqltypes.AutoString(length=150), nullable=True),
        sa.Column('provider_receipt', sqlmodel.sql.sqltypes.AutoString(length=150), nullable=True),
        sa.Column('status', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('failure_code', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column('failure_reason', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True),
        sa.Column('sale_data_snapshot', sa.JSON(), nullable=True),
        sa.Column('raw_request_json', sa.JSON(), nullable=True),
        sa.Column('raw_callback_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('callback_received_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['sale_id'], ['sales.id']),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenant.id']),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_index(op.f('ix_payments_tenant_id'), 'payments', ['tenant_id'], unique=False)
    op.create_index(op.f('ix_payments_sale_id'), 'payments', ['sale_id'], unique=False)
    op.create_index(op.f('ix_payments_invoice_number'), 'payments', ['invoice_number'], unique=True)
    op.create_index(op.f('ix_payments_checkout_request_id'), 'payments', ['checkout_request_id'], unique=True)
    op.create_index(op.f('ix_payments_provider_receipt'), 'payments', ['provider_receipt'], unique=True)
    op.create_index(op.f('ix_payments_created_at'), 'payments', ['created_at'], unique=False)
    op.create_index(op.f('ix_payments_updated_at'), 'payments', ['updated_at'], unique=False)
    op.create_index(op.f('ix_payments_callback_received_at'), 'payments', ['callback_received_at'], unique=False)
    op.create_index(op.f('ix_payments_completed_at'), 'payments', ['completed_at'], unique=False)
    op.create_index(op.f('ix_payments_expires_at'), 'payments', ['expires_at'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_payments_expires_at'), table_name='payments')
    op.drop_index(op.f('ix_payments_completed_at'), table_name='payments')
    op.drop_index(op.f('ix_payments_callback_received_at'), table_name='payments')
    op.drop_index(op.f('ix_payments_updated_at'), table_name='payments')
    op.drop_index(op.f('ix_payments_created_at'), table_name='payments')
    op.drop_index(op.f('ix_payments_provider_receipt'), table_name='payments')
    op.drop_index(op.f('ix_payments_checkout_request_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_invoice_number'), table_name='payments')
    op.drop_index(op.f('ix_payments_sale_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_tenant_id'), table_name='payments')
    op.drop_table('payments')
