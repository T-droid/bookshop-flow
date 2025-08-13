"""restructure_schema_for_new_inventory_system

Revision ID: af0ad0c25fd3
Revises: 8261c503b92c
Create Date: 2025-08-13 16:28:16.918014

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'af0ad0c25fd3'
down_revision: Union[str, Sequence[str], None] = '8261c503b92c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to new inventory system."""
    
    # Step 1: Create new tables that don't depend on modified tables
    op.create_table('category',
        sa.Column('category_id', sa.Uuid(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.PrimaryKeyConstraint('category_id')
    )
    op.create_index(op.f('ix_category_name'), 'category', ['name'], unique=False)
    
    # Step 2: Modify book table structure
    # First, add new columns to book table
    op.add_column('book', sa.Column('book_id', sa.Uuid(), nullable=True))  # Allow NULL temporarily
    op.add_column('book', sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('book', sa.Column('language', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True))  # Allow NULL temporarily
    op.add_column('book', sa.Column('category_id', sa.Uuid(), nullable=True))
    
    # Populate book_id with unique values
    op.execute("UPDATE book SET book_id = gen_random_uuid() WHERE book_id IS NULL")
    op.execute("UPDATE book SET language = 'English' WHERE language IS NULL")
    
    # Make book_id and language NOT NULL
    op.alter_column('book', 'book_id', nullable=False)
    op.alter_column('book', 'language', nullable=False)
    
    # Create primary key constraint for book_id
    op.create_primary_key('book_pkey_new', 'book', ['book_id'])
    
    # Modify author column type
    op.alter_column('book', 'author',
                   existing_type=sa.VARCHAR(length=100),
                   type_=sqlmodel.sql.sqltypes.AutoString(length=255),
                   existing_nullable=False)
    
    # Drop old constraints and indexes
    op.drop_constraint('book_publisher_id_key', 'book', type_='unique')
    op.drop_constraint('book_tenant_id_key', 'book', type_='unique')
    op.drop_index('ix_book_isbn', table_name='book')
    op.drop_index('ix_book_title', table_name='book')
    
    # Create new index for title (non-unique)
    op.create_index(op.f('ix_book_title'), 'book', ['title'], unique=False)
    
    # Drop old foreign keys
    op.drop_constraint('book_publisher_id_fkey', 'book', type_='foreignkey')
    op.drop_constraint('book_tenant_id_fkey', 'book', type_='foreignkey')
    
    # Create new foreign key
    op.create_foreign_key(None, 'book', 'category', ['category_id'], ['category_id'])
    
    # Step 3: Now that book table has book_id, we can create bookedition table
    op.create_table('bookedition',
        sa.Column('edition_id', sa.Uuid(), nullable=False),
        sa.Column('book_id', sa.Uuid(), nullable=False),
        sa.Column('isbn_13', sqlmodel.sql.sqltypes.AutoString(length=13), nullable=False),
        sa.Column('isbn_10', sqlmodel.sql.sqltypes.AutoString(length=10), nullable=True),
        sa.Column('format', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('edition_number', sa.Integer(), nullable=False),
        sa.Column('publisher', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('publication_date', sa.Date(), nullable=True),
        sa.Column('page_count', sa.Integer(), nullable=True),
        sa.Column('dimensions', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['book_id'], ['book.book_id'], ),
        sa.PrimaryKeyConstraint('edition_id')
    )
    op.create_index(op.f('ix_bookedition_created_at'), 'bookedition', ['created_at'], unique=False)
    op.create_index(op.f('ix_bookedition_isbn_10'), 'bookedition', ['isbn_10'], unique=False)
    op.create_index(op.f('ix_bookedition_isbn_13'), 'bookedition', ['isbn_13'], unique=True)
    op.create_index(op.f('ix_bookedition_updated_at'), 'bookedition', ['updated_at'], unique=False)
    
    # Step 4: Update supplier table
    op.add_column('supplier', sa.Column('supplier_id', sa.Uuid(), nullable=True))  # Allow NULL temporarily
    
    # Populate supplier_id with unique values
    op.execute("UPDATE supplier SET supplier_id = gen_random_uuid() WHERE supplier_id IS NULL")
    
    # Make supplier_id NOT NULL
    op.alter_column('supplier', 'supplier_id', nullable=False)
    
    # Alter supplier columns
    op.alter_column('supplier', 'name',
                   existing_type=sa.VARCHAR(length=100),
                   type_=sqlmodel.sql.sqltypes.AutoString(length=255),
                   existing_nullable=False)
    op.alter_column('supplier', 'contact_info',
                   existing_type=sa.VARCHAR(length=255),
                   type_=sqlmodel.sql.sqltypes.AutoString(length=500),
                   existing_nullable=False)
    
    # Update supplier index
    op.drop_index('ix_supplier_name', table_name='supplier')
    op.create_index(op.f('ix_supplier_name'), 'supplier', ['name'], unique=False)
    
    # Step 5: Update inventory table structure
    op.add_column('inventory', sa.Column('inventory_id', sa.Uuid(), nullable=True))  # Allow NULL temporarily
    op.add_column('inventory', sa.Column('edition_id', sa.Uuid(), nullable=True))
    op.add_column('inventory', sa.Column('quantity_on_hand', sa.Integer(), nullable=True))
    op.add_column('inventory', sa.Column('quantity_reserved', sa.Integer(), nullable=True))
    op.add_column('inventory', sa.Column('reorder_level', sa.Integer(), nullable=True))
    op.add_column('inventory', sa.Column('cost_price', sa.Numeric(scale=2), nullable=True))
    op.add_column('inventory', sa.Column('sale_price', sa.Numeric(scale=2), nullable=True))
    op.add_column('inventory', sa.Column('location', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True))
    op.add_column('inventory', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('inventory', sa.Column('updated_at', sa.DateTime(), nullable=True))
    
    # Populate new inventory columns with default values
    op.execute("UPDATE inventory SET inventory_id = gen_random_uuid() WHERE inventory_id IS NULL")
    op.execute("UPDATE inventory SET quantity_on_hand = COALESCE(quantity, 0) WHERE quantity_on_hand IS NULL")
    op.execute("UPDATE inventory SET quantity_reserved = 0 WHERE quantity_reserved IS NULL")
    op.execute("UPDATE inventory SET reorder_level = 5 WHERE reorder_level IS NULL")
    op.execute("UPDATE inventory SET cost_price = 0.00 WHERE cost_price IS NULL")
    op.execute("UPDATE inventory SET sale_price = 0.00 WHERE sale_price IS NULL")
    op.execute("UPDATE inventory SET created_at = NOW() WHERE created_at IS NULL")
    op.execute("UPDATE inventory SET updated_at = NOW() WHERE updated_at IS NULL")
    
    # Make required columns NOT NULL
    op.alter_column('inventory', 'inventory_id', nullable=False)
    op.alter_column('inventory', 'quantity_on_hand', nullable=False)
    op.alter_column('inventory', 'quantity_reserved', nullable=False)
    op.alter_column('inventory', 'reorder_level', nullable=False)
    op.alter_column('inventory', 'cost_price', nullable=False)
    op.alter_column('inventory', 'sale_price', nullable=False)
    op.alter_column('inventory', 'created_at', nullable=False)
    op.alter_column('inventory', 'updated_at', nullable=False)
    
    # Create indexes for inventory
    op.create_index(op.f('ix_inventory_created_at'), 'inventory', ['created_at'], unique=False)
    op.create_index(op.f('ix_inventory_updated_at'), 'inventory', ['updated_at'], unique=False)
    
    # Drop old inventory constraints and foreign keys
    op.drop_constraint('inventory_book_id_fkey', 'inventory', type_='foreignkey')
    op.drop_constraint('inventory_tenant_id_fkey', 'inventory', type_='foreignkey')
    
    # Create new inventory foreign keys
    op.create_foreign_key(None, 'inventory', 'tenant', ['tenant_id'], ['id'])
    # Note: edition_id foreign key will be created after we populate edition data
    
    # Step 6: Update purchase order table
    op.add_column('purchaseorder', sa.Column('po_id', sa.Uuid(), nullable=True))  # Allow NULL temporarily
    op.add_column('purchaseorder', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('purchaseorder', sa.Column('updated_at', sa.DateTime(), nullable=True))
    
    # Populate new purchase order columns
    op.execute("UPDATE purchaseorder SET po_id = gen_random_uuid() WHERE po_id IS NULL")
    op.execute("UPDATE purchaseorder SET created_at = order_date WHERE created_at IS NULL")
    op.execute("UPDATE purchaseorder SET updated_at = order_date WHERE updated_at IS NULL")
    
    # Make required columns NOT NULL
    op.alter_column('purchaseorder', 'po_id', nullable=False)
    op.alter_column('purchaseorder', 'created_at', nullable=False)
    op.alter_column('purchaseorder', 'updated_at', nullable=False)
    
    # Create indexes for purchase order
    op.create_index(op.f('ix_purchaseorder_created_at'), 'purchaseorder', ['created_at'], unique=False)
    op.create_index(op.f('ix_purchaseorder_updated_at'), 'purchaseorder', ['updated_at'], unique=False)
    
    # Drop old purchase order foreign keys
    op.drop_constraint('purchaseorder_supplier_id_fkey', 'purchaseorder', type_='foreignkey')
    op.drop_constraint('purchaseorder_tenant_id_fkey', 'purchaseorder', type_='foreignkey')
    
    # Create new purchase order foreign keys
    op.create_foreign_key(None, 'purchaseorder', 'supplier', ['supplier_id'], ['supplier_id'])
    op.create_foreign_key(None, 'purchaseorder', 'tenant', ['tenant_id'], ['id'])
    
    # Step 7: Update foreign key references in other tables
    # Update monthly sales summary
    op.drop_constraint('monthlysalessummary_book_id_fkey', 'monthlysalessummary', type_='foreignkey')
    op.create_foreign_key(None, 'monthlysalessummary', 'book', ['book_id'], ['book_id'])
    
    # Update purchase order items
    op.drop_constraint('purchaseorderitems_book_id_fkey', 'purchaseorderitems', type_='foreignkey')
    op.drop_constraint('purchaseorderitems_order_id_fkey', 'purchaseorderitems', type_='foreignkey')
    op.create_foreign_key(None, 'purchaseorderitems', 'purchaseorder', ['order_id'], ['po_id'])
    op.create_foreign_key(None, 'purchaseorderitems', 'book', ['book_id'], ['book_id'])
    
    # Update sale items
    op.drop_constraint('saleitems_book_id_fkey', 'saleitems', type_='foreignkey')
    op.create_foreign_key(None, 'saleitems', 'book', ['book_id'], ['book_id'])
    
    # Update tenant supplier
    op.drop_constraint('tenantsupplier_supplier_id_fkey', 'tenantsupplier', type_='foreignkey')
    op.create_foreign_key(None, 'tenantsupplier', 'supplier', ['supplier_id'], ['supplier_id'])
    
    # Step 8: Drop old columns from book table
    op.drop_column('book', 'isbn')
    op.drop_column('book', 'tenant_id')
    op.drop_column('book', 'id')
    op.drop_column('book', 'price')
    op.drop_column('book', 'publisher_id')
    
    # Step 9: Drop old columns from inventory table
    op.drop_column('inventory', 'book_id')
    op.drop_column('inventory', 'quantity')
    op.drop_column('inventory', 'low_stock_threshold')
    
    # Step 10: Drop old columns from supplier table
    op.drop_column('supplier', 'id')
    
    # Step 11: Drop old columns from purchase order table
    op.drop_column('purchaseorder', 'id')


def downgrade() -> None:
    """Downgrade schema."""
    # This is a major schema change, downgrade would be complex
    # In production, you'd want to implement this carefully
    pass
