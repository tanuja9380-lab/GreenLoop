from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)

    # Store ONLY the password hash, never the actual password
    password_hash = Column(String, nullable=False)

    # User can join/create a family later
    family_id = Column(String, ForeignKey("families.family_id"), nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)

    # Store a hash of the session token, not the raw token
    token_hash = Column(String, unique=True, index=True, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    expires_at = Column(DateTime, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)


class WasteRecord(Base):
    __tablename__ = "waste_records"

    id = Column(Integer, primary_key=True, index=True)

    record_id = Column(String, unique=True, index=True)
    family_id = Column(String, index=True)

    total_weight = Column(Float)
    dry_weight = Column(Float)
    wet_weight = Column(Float)
    recyclable_weight = Column(Float)

    green_coins = Column(Integer, default=0)

    timestamp = Column(DateTime, default=datetime.utcnow)


class Family(Base):
    __tablename__ = "families"

    id = Column(Integer, primary_key=True, index=True)

    family_id = Column(String, unique=True, index=True)
    family_name = Column(String)
    household_size = Column(Integer)

    green_coins = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)