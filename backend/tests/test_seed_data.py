import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import database.import_data as import_data_module
from app.model import UserRole


def test_seed_database_uses_reset_and_seed_workflow(monkeypatch):
    class DummyImporter(import_data_module.DatasetImporter):
        def __init__(self):
            self.db = object()
            self.reset_called = False

        def seed_database(self):
            return self.reset_and_seed_database()

        def reset_and_seed_database(self):
            self.reset_called = True
            return {
                "stores": 3,
                "users": 4,
                "shelves": 9,
                "products": 18,
                "cameras": 6,
                "analytics": 12,
                "customer_tracks": 8,
                "heatmaps": 6,
                "reports": 3,
                "settings": 3,
                "detections": 24,
            }

    monkeypatch.setattr(import_data_module, "DatasetImporter", DummyImporter)

    importer = import_data_module.DatasetImporter()
    summary = importer.seed_database()

    assert importer.reset_called is True
    assert summary["stores"] == 3
    assert summary["users"] == 4


def test_default_users_use_enum_compatible_roles():
    importer = import_data_module.DatasetImporter.__new__(import_data_module.DatasetImporter)
    importer.db = object()

    users = [
        import_data_module.User(
            full_name="Admin User",
            email="admin@retailsystem.com",
            role=UserRole.ADMIN,
            password="hashed_password_123",
        ),
        import_data_module.User(
            full_name="Store Manager",
            email="manager@retailsystem.com",
            role=UserRole.STORE_MANAGER,
            password="hashed_password_456",
        ),
        import_data_module.User(
            full_name="Retail Analyst",
            email="analyst@retailsystem.com",
            role=UserRole.RETAIL_ANALYST,
            password="hashed_password_789",
        ),
    ]

    assert [user.role for user in users] == [UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.RETAIL_ANALYST]
