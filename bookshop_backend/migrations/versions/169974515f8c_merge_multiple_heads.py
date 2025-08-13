"""merge_multiple_heads

Revision ID: 169974515f8c
Revises: 862e4d3eaced, af0ad0c25fd3, c22376c884ec, ee4ae5bd3bde
Create Date: 2025-08-13 18:46:18.261182

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '169974515f8c'
down_revision: Union[str, Sequence[str], None] = ('862e4d3eaced', 'af0ad0c25fd3', 'c22376c884ec', 'ee4ae5bd3bde')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
