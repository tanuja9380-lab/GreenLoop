from pydantic import BaseModel
from datetime import datetime


# =========================
# Family schemas
# =========================

class FamilyCreate(BaseModel):
    family_id: str
    family_name: str
    household_size: int


class FamilyResponse(BaseModel):
    id: int
    family_id: str
    family_name: str
    household_size: int
    green_coins: int
    created_at: datetime

    class Config:
        from_attributes = True


# =========================
# Waste record schemas
# =========================

class WasteRecordCreate(BaseModel):
    record_id: str
    family_id: str

    total_weight: float
    dry_weight: float
    wet_weight: float
    recyclable_weight: float


class WasteRecordResponse(BaseModel):
    id: int
    record_id: str
    family_id: str

    total_weight: float
    dry_weight: float
    wet_weight: float
    recyclable_weight: float

    green_coins: int
    timestamp: datetime

    class Config:
        from_attributes = True


# =========================
# Authentication schemas
# =========================

class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    family_id: str | None = None

    class Config:
        from_attributes = True