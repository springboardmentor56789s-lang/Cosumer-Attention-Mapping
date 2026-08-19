from database.database import SessionLocal
from sqlalchemy import text

session = SessionLocal()
try:
    conn = session.connection()
    tables = ['analytics','customer_tracks','heatmaps','detections','products','reports','settings','cameras','shelves','stores']
    for table in tables:
        try:
            conn.execute(text(f'TRUNCATE TABLE {table} RESTART IDENTITY CASCADE'))
            print(f'cleared {table}')
        except Exception as exc:
            print('truncate-failed', table, exc)
    session.commit()
finally:
    session.close()
