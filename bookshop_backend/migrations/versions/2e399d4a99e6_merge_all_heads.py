"""merge_all_heads

Revision ID: 2e399d4a99e6
Revises: 1f32060c8afc, 4b733b5be783, f766805fed7e
Create Date: 2025-08-15 13:03:34.814087

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2e399d4a99e6'
down_revision: Union[str, Sequence[str], None] = ('1f32060c8afc', '4b733b5be783', 'f766805fed7e')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
