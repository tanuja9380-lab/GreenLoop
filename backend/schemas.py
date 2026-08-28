from pydantic import BaseModel
from datetime import datetime
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


class WasteRecordCreate(BaseModel):
    record_id: str
    family_id: str

    total_weight: float
    dry_weight: float
    wet_weight: float
    recyclable_weight: float

    green_coins: int = 0


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