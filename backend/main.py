from fastapi import FastAPI, Depends, HTTPException, Response, Cookie
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from datetime import datetime, timedelta, timezone
import hashlib
import secrets

import schemas
import models
from database import get_db, Base, engine


# =========================
# APP CONFIGURATION
# =========================

app = FastAPI(
    title="GreenLoop API",
    version="1.0.0",
    description="Smart Waste Management & Green Rewards Platform",
)

Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:4173",
        "http://localhost:4174",
        "http://localhost:4175",
        "https://greenloop-web.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# AUTHENTICATION CONFIG
# =========================

SESSION_COOKIE_NAME = "greenloop_session"
SESSION_DURATION_DAYS = 7


# =========================
# PASSWORD HELPERS
# =========================

def hash_password(password: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        b"greenloop-password-salt",
        100_000,
    ).hex()


# =========================
# SESSION HELPERS
# =========================

def create_session(db: Session, user_id: int) -> str:
    raw_token = secrets.token_urlsafe(32)

    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    session = models.Session(
        token_hash=token_hash,
        user_id=user_id,
        expires_at=datetime.utcnow()
        + timedelta(days=SESSION_DURATION_DAYS),
    )

    db.add(session)
    db.commit()

    return raw_token


def get_current_user(
    greenloop_session: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if not greenloop_session:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    token_hash = hashlib.sha256(
        greenloop_session.encode("utf-8")
    ).hexdigest()

    session = (
        db.query(models.Session)
        .filter(models.Session.token_hash == token_hash)
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=401,
            detail="Invalid session",
        )

    if session.expires_at < datetime.now(timezone.utc):
        db.delete(session)
        db.commit()

        raise HTTPException(
            status_code=401,
            detail="Session expired",
        )

    user = (
        db.query(models.User)
        .filter(models.User.id == session.user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user


# =========================
# BASIC ROUTES
# =========================

@app.get("/")
def root():
    return {
        "message": "GreenLoop API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# =========================
# AUTHENTICATION
# =========================

@app.post("/auth/register")
def register(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    print("REGISTER ENDPOINT REACHED")

    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    user = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
    }


@app.post("/auth/login")
def login(
    user_data: schemas.UserLogin,
    response: Response,
    db: Session = Depends(get_db),
):
    user = (
        db.query(models.User)
        .filter(models.User.email == user_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if user.password_hash != hash_password(user_data.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    session_token = create_session(
        db,
        user.id,
    )

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=SESSION_DURATION_DAYS * 24 * 60 * 60,
    )

    return {
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
    }


@app.post("/auth/logout")
def logout(
    response: Response,
    greenloop_session: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if greenloop_session:
        token_hash = hashlib.sha256(
            greenloop_session.encode("utf-8")
        ).hexdigest()

        session = (
            db.query(models.Session)
            .filter(
                models.Session.token_hash == token_hash
            )
            .first()
        )

        if session:
            db.delete(session)
            db.commit()

    response.delete_cookie(
        key=SESSION_COOKIE_NAME
    )

    return {
        "message": "Logged out successfully"
    }


@app.get("/auth/me")
def get_me(
    current_user: models.User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "family_id": current_user.family_id,
    }


# =========================
# FAMILIES
# =========================

@app.get(
    "/families",
    response_model=list[schemas.FamilyResponse],
)
def get_families(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Family).all()


@app.post(
    "/families",
    response_model=schemas.FamilyResponse,
)
def create_family(
    family_data: schemas.FamilyCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing_family = (
        db.query(models.Family)
        .filter(
            models.Family.family_id
            == family_data.family_id
        )
        .first()
    )

    if existing_family:
        raise HTTPException(
            status_code=400,
            detail="Family ID already exists",
        )

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


# =========================
# WASTE RECORDS
# =========================

@app.get("/waste-records")
def get_waste_records(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.WasteRecord).all()


@app.post("/waste-records")
def create_waste_record(
    waste_data: schemas.WasteRecordCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
# Check that the family exists
    family = (
        db.query(models.Family)
        .filter(
            models.Family.family_id
            == waste_data.family_id
        )
        .first()
    )

    if not family:
        raise HTTPException(
            status_code=404,
            detail="Family not found",
        )

    # Calculate Green Coins
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

    # Create waste record
    record = models.WasteRecord(
        record_id=waste_data.record_id,
        family_id=waste_data.family_id,
        total_weight=waste_data.total_weight,
        dry_weight=waste_data.dry_weight,
        wet_weight=waste_data.wet_weight,
        recyclable_weight=waste_data.recyclable_weight,
        green_coins=green_coins,
    )

    # Add coins to family
    family.green_coins += green_coins

    # Save
    db.add(record)
    db.commit()

    db.refresh(record)
    db.refresh(family)

    return record
    # Check that the family exists
    family = (
        db.query(models.Family)
        .filter(
            models.Family.family_id
            == waste_data.family_id
        )
        .first()
    )

    if not family:
        raise HTTPException(
            status_code=404,
            detail="Family not found",
        )

    # Calculate Green Coins
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

    # Create waste record
    record = models.WasteRecord(
        record_id=waste_data.record_id,
        family_id=waste_data.family_id,
        total_weight=waste_data.total_weight,
        dry_weight=waste_data.dry_weight,
        wet_weight=waste_data.wet_weight,
        recyclable_weight=waste_data.recyclable_weight,
        green_coins=green_coins,
    )

    # Add coins to family
    family.green_coins += green_coins

    # Save
    db.add(record)
    db.commit()

    db.refresh(record)
    db.refresh(family)

    return record
@app.delete("/waste-records/{record_id}")
def delete_waste_record(
    record_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Find the waste record
    record = (
        db.query(models.WasteRecord)
        .filter(
            models.WasteRecord.record_id == record_id
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Waste record not found",
        )

    # Find the related family
    family = (
        db.query(models.Family)
        .filter(
            models.Family.family_id == record.family_id
        )
        .first()
    )

    # Remove the Green Coins earned from this record
    if family:
        family.green_coins = max(
            0,
            family.green_coins - record.green_coins
        )

    # Delete the record
    db.delete(record)
    db.commit()

    return {
        "message": "Waste record deleted successfully"
    }
    # Check that the family exists
    family = (
        db.query(models.Family)
        .filter(
            models.Family.family_id
            == waste_data.family_id
        )
        .first()
    )

    if not family:
        raise HTTPException(
            status_code=404,
            detail="Family not found",
        )

    # Calculate Green Coins
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

    # Create waste record
    record = models.WasteRecord(
        record_id=waste_data.record_id,
        family_id=waste_data.family_id,
        total_weight=waste_data.total_weight,
        dry_weight=waste_data.dry_weight,
        wet_weight=waste_data.wet_weight,
        recyclable_weight=waste_data.recyclable_weight,
        green_coins=green_coins,
    )

    # Add coins to family
    family.green_coins += green_coins

    # Save
    db.add(record)
    db.commit()

    db.refresh(record)
    db.refresh(family)

    return record