from database.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    print(conn.execute(text("SELECT enum_range(NULL::userrole)")).scalar())
    print(conn.execute(text("SELECT unnest(enum_range(NULL::userrole))")).fetchall())
