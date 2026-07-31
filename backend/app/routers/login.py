import csv
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from database.database import get_db
from app.model import User
from app.schema import LoginUser
from app.auth import verify_password, create_access_token

router = APIRouter(
    prefix="/api",
    tags=["Login"]
)


DATASET_NAME = "samplesuperstore.csv"
DATASET_PATH = Path(__file__).resolve().parents[2] / "datasets" / DATASET_NAME


def _parse_date(value: str):
    return datetime.strptime(value, "%m/%d/%Y").date() if value else None


def _load_superstore_csv_once(db: Session) -> None:
    """Import the bundled Superstore CSV once, using PostgreSQL as the source of truth."""
    if not DATASET_PATH.is_file():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    try:
        # The transaction lock prevents two simultaneous successful logins importing twice.
        db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:dataset_name))"), {"dataset_name": DATASET_NAME})
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS superstore_sales (
                row_id INTEGER PRIMARY KEY,
                order_id TEXT NOT NULL,
                order_date DATE,
                ship_date DATE,
                ship_mode TEXT,
                customer_id TEXT,
                customer_name TEXT,
                segment TEXT,
                country_region TEXT,
                city TEXT,
                state_province TEXT,
                postal_code TEXT,
                region TEXT,
                product_id TEXT,
                category TEXT,
                sub_category TEXT,
                product_name TEXT,
                sales NUMERIC(12, 2),
                quantity INTEGER,
                discount NUMERIC(8, 4),
                profit NUMERIC(12, 4)
            )
        """))
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS dataset_imports (
                dataset_name TEXT PRIMARY KEY,
                imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                row_count INTEGER NOT NULL
            )
        """))

        imported = db.execute(
            text("SELECT 1 FROM dataset_imports WHERE dataset_name = :dataset_name"),
            {"dataset_name": DATASET_NAME},
        ).scalar()
        if imported:
            db.commit()
            return

        with DATASET_PATH.open("r", encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)
            rows = [
                {
                    "row_id": int(record["Row ID"]),
                    "order_id": record["Order ID"],
                    "order_date": _parse_date(record["Order Date"]),
                    "ship_date": _parse_date(record["Ship Date"]),
                    "ship_mode": record["Ship Mode"],
                    "customer_id": record["Customer ID"],
                    "customer_name": record["Customer Name"],
                    "segment": record["Segment"],
                    "country_region": record["Country/Region"],
                    "city": record["City"],
                    "state_province": record["State/Province"],
                    "postal_code": record["Postal Code"],
                    "region": record["Region"],
                    "product_id": record["Product ID"],
                    "category": record["Category"],
                    "sub_category": record["Sub-Category"],
                    "product_name": record["Product Name"],
                    "sales": float(record["Sales"]),
                    "quantity": int(record["Quantity"]),
                    "discount": float(record["Discount"]),
                    "profit": float(record["Profit"]),
                }
                for record in reader
            ]

        if rows:
            db.execute(text("""
                INSERT INTO superstore_sales (
                    row_id, order_id, order_date, ship_date, ship_mode, customer_id,
                    customer_name, segment, country_region, city, state_province,
                    postal_code, region, product_id, category, sub_category,
                    product_name, sales, quantity, discount, profit
                ) VALUES (
                    :row_id, :order_id, :order_date, :ship_date, :ship_mode, :customer_id,
                    :customer_name, :segment, :country_region, :city, :state_province,
                    :postal_code, :region, :product_id, :category, :sub_category,
                    :product_name, :sales, :quantity, :discount, :profit
                )
            """), rows)

        db.execute(
            text("INSERT INTO dataset_imports (dataset_name, row_count) VALUES (:dataset_name, :row_count)"),
            {"dataset_name": DATASET_NAME, "row_count": len(rows)},
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

@router.post("/login")
def login(user: LoginUser, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    try:
        _load_superstore_csv_once(db)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Login succeeded, but the Superstore dataset could not be imported.",
        ) from error

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role.value,
        "full_name": db_user.full_name
    }
