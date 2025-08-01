# test_imports.py
import sys
import traceback

try:
    print("Testing model imports...")
    
    # Test the exact import that alembic is using
    from app.db.models import *
    print("✓ Models imported successfully")
    
    # Test SQLModel metadata
    from sqlmodel import SQLModel
    print(f"✓ SQLModel metadata tables: {list(SQLModel.metadata.tables.keys())}")
    
except Exception as e:
    print(f"❌ Import Error: {e}")
    traceback.print_exc()