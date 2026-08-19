from fastapi.testclient import TestClient
from app.main import app
from database.database import SessionLocal
from app.model import User, UserRole
from app.auth import hash_password

with SessionLocal() as db:
    user = db.query(User).filter(User.email == 'admin@example.com').first()
    if user is None:
        user = User(full_name='Admin', email='admin@example.com', password=hash_password('admin123'), role=UserRole.ADMIN, is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)

client = TestClient(app)
login = client.post('/api/login', json={'email':'admin@example.com','password':'admin123'})
print('LOGIN', login.status_code)
print(login.json())
if login.status_code == 200:
    token = login.json()['access_token']
    r = client.get('/api/stores', headers={'Authorization': f'Bearer {token}'})
    print('STORES', r.status_code)
    print(r.text[:500])
    r2 = client.post('/api/stores', json={'store_name':'Probe','location':'X','manager_name':'Y'}, headers={'Authorization': f'Bearer {token}'})
    print('POST', r2.status_code)
    print(r2.text[:500])
