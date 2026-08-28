from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from database import Base


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