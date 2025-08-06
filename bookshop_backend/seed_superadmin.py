#!/usr/bin/env python3
"""
Script to seed the superadmin user in the database
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.base import async_session_maker
from app.db.models.superadmins import SuperAdmin
from passlib.context import CryptContext
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_superadmin():
    """Seed the superadmin user"""
    
    # Get superadmin credentials from environment
    SUPERADMIN_NAME = os.getenv("SUPERADMIN_NAME", "Super Admin")
    SUPERADMIN_EMAIL = os.getenv("SUPERADMIN_EMAIL", "admin@bookshop.com")
    SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD", "SuperAdmin123!")
    
    async with async_session_maker() as db:
        try:
            # Check if superadmin already exists
            stmt = select(SuperAdmin).where(SuperAdmin.email == SUPERADMIN_EMAIL)
            result = await db.execute(stmt)
            existing_admin = result.scalars().first()
            
            if existing_admin:
                logger.info(f"✅ SuperAdmin already exists: {SUPERADMIN_EMAIL}")
                print(f"""
🎯 SuperAdmin exists:
Name: {existing_admin.name}
Email: {existing_admin.email}
Active: {existing_admin.is_active}
Created: {existing_admin.created_at}
""")
                return existing_admin
            
            # Hash the password
            hashed_password = pwd_context.hash(SUPERADMIN_PASSWORD)
            
            # Create superadmin
            superadmin = SuperAdmin(
                name=SUPERADMIN_NAME,
                email=SUPERADMIN_EMAIL,
                password=hashed_password,
                is_active=True
            )
            
            db.add(superadmin)
            await db.commit()
            await db.refresh(superadmin)
            
            logger.info(f"✅ SuperAdmin created successfully: {superadmin.email}")
            
            print(f"""
🎉 SuperAdmin created successfully!

Login Credentials:
==================
Name: {superadmin.name}
Email: {superadmin.email}
Password: {SUPERADMIN_PASSWORD}
Active: {superadmin.is_active}
Created: {superadmin.created_at}

🔒 Keep these credentials safe!
""")
            
            return superadmin
            
        except Exception as e:
            logger.error(f"❌ Error creating superadmin: {e}")
            await db.rollback()
            raise

async def main():
    """Main function"""
    print("🌱 Starting SuperAdmin seeding...")
    
    try:
        await seed_superadmin()
        print("✅ SuperAdmin seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ SuperAdmin seeding failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
