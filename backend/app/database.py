from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load variables from .env
load_dotenv()

# Read values
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Create MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)

# Select the database
database = client[DATABASE_NAME]