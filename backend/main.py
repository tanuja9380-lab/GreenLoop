from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
import models
from database import get_db


app = FastAPI(
    title="GreenLoop API",
    version="1.0.0",
    description="Smart Waste Management & Green Rewards Platform",
)


@app.get("/")
def root():
    return {"message": "GreenLoop API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/families", response_model=list[schemas.FamilyResponse])
def get_families(db: Session = Depends(get_db)):
    return db.query(models.Family).all()


@app.post("/families", response_model=schemas.FamilyResponse)
def create_family(
    family_data: schemas.FamilyCreate,
    db: Session = Depends(get_db),
):
    family = models.Family(
        family_id=family_data.family_id,
        family_name=family_data.family_name,
        household_size=family_data.household_size,
        green_coins=0,
    )

    db.add(family)
    db.commit()
    db.refresh(family)

    return family


@app.get("/waste-records")
def get_waste_records(db: Session = Depends(get_db)):
    return db.query(models.WasteRecord).all()


@app.post("/waste-records")
def create_waste_record(
    waste_data: schemas.WasteRecordCreate,
    db: Session = Depends(get_db),
):
    # 1. Check that the family exists
    family = (
        db.query(models.Family)
        .filter(models.Family.family_id == waste_data.family_id)
        .first()
    )

    if not family:
        raise HTTPException(
            status_code=404,
            detail="Family not found",
        )

    # 2. Calculate Green Coins automatically
    green_coins = max(
        0,
        min(
            100,
            round(
                100
                - (waste_data.total_weight * 10)
                + (waste_data.recyclable_weight * 15)
            ),
        ),
    )

    # 3. Create waste record
    record = models.WasteRecord(
        record_id=waste_data.record_id,
        family_id=waste_data.family_id,
        total_weight=waste_data.total_weight,
        dry_weight=waste_data.dry_weight,
        wet_weight=waste_data.wet_weight,
        recyclable_weight=waste_data.recyclable_weight,
        green_coins=green_coins,
    )

    # 4. Add earned coins to the family's balance
    family.green_coins += green_coins

    # 5. Save everything
    db.add(record)
    db.commit()

    db.refresh(record)
    db.refresh(family)

    return record