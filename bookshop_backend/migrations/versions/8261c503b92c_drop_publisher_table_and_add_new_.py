"""drop_publisher_table_and_add_new_inventory_schema

Revision ID: 8261c503b92c
Revises: 4d25068cd499
Create Date: 2025-08-13 14:37:50.021820

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8261c503b92c'
down_revision: Union[str, Sequence[str], None] = '4d25068cd499'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
