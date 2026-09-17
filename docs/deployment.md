# Deployment Guide — Consumer Attention Mapping System

## 1. Prerequisites
- Docker Engine 20.10+
- Docker Compose v2.0+
- Python 3.12+ (for local non-docker runs)
- Node.js 18+ (for local frontend dev)

## 2. Dockerized Production Deployment
To spin up the entire system (Frontend, Backend, AI Engine, PostgreSQL database) with Docker Compose:

```bash
# 1. Clone repository
git clone https://github.com/organization/consumer-attention-mapping.git
cd consumer-attention-mapping

# 2. Copy environment file
cp .env.example .env

# 3. Build & start containers
docker compose up -d --build
```

### Access Ports:
- **Frontend Dashboard**: `http://localhost:80` (or `http://localhost:5173` in dev)
- **FastAPI Backend API**: `http://localhost:8000`
- **Swagger Interactive API Docs**: `http://localhost:8000/docs`
- **PostgreSQL Database**: `localhost:5432`

## 3. Local Development Run

### Backend & AI Engine:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install python-multipart
uvicorn app.main:app --reload --port 8000
```

### Frontend Web App:
```bash
cd frontend
npm install
npm run dev
```

## 4. Run Automated Test Suite
```bash
python -m pytest backend/tests/
```
