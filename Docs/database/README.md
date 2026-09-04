# Database Documentation

This project uses **PostgreSQL** as its primary database. The database itself runs as a separate service (not stored as files in this repository) — this folder documents its structure.

## Connection
- Configured in `Backend/database.py`
- Credentials stored in `Backend/.env` (not committed, for security)

## Schema
Defined in `Backend/models.py` using SQLAlchemy ORM. Tables include:

- **users** — authentication, roles
- **stores** — store locations
- **shelves** — shelf mapping, linked to stores
- **cameras** — camera assignment, linked to stores
- **attention_records** — tracked attention duration per zone/shelf
- **product_interactions** — detected interactions (Viewed, Picked Up, Purchased, Compared, Returned)
- **detection_sessions** — dwell time tracking sessions
- **position_points** — raw x/y tracking points (used for heatmaps)
- **journey_logs** — sequential zone visit tracking per shopper
- **alerts** — system-generated notifications

## Schema Backup
See `schema_backup.sql` for a full SQL export of the current schema (generated via pgAdmin).

## Setup
1. Create a PostgreSQL database
2. Set `DATABASE_URL` in `Backend/.env`
3. Run the backend once — SQLAlchemy auto-creates all tables via `Base.metadata.create_all()`



