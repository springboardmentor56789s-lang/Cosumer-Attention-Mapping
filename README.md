# Consumer Attention Mapping System
### Tested, Deployable, Production-Ready Retail Intelligence Platform (Milestone 4 Final Release)

---

## 1. Project Overview
The **Consumer Attention Mapping System** converts raw retail surveillance video feeds into real-time shopper tracking, gaze fixation heatmaps, product attractiveness scores, automated merchandising recommendations, interactive AI Copilot assistance, downloadable evidence reports, and executive analytics.

---

## 2. Problem Statement
Traditional brick-and-mortar retail managers lack visibility into how customers interact with store shelves, where shopper attention is focused, why certain products are overlooked despite high footfall, and how store layouts impact sales conversions. This system bridges physical retail with digital analytics.

---

## 3. Key Features
- **Role-Based Access Control (RBAC)**: Manager Dashboard with executive analytics and Worker Dashboard for task management.
- **YOLOv8 + ByteTrack Multi-Person Tracking**: Multi-shopper tracking with 2D Kalman motion vector estimation.
- **Attention & Dwell Time Engine**: Exact dwell time computation (`Exit Time - Entry Time`) and gaze fixation metrics.
- **Behavioral Intelligence & Consumer Segments**: Categorizes shoppers into Explorers, Quick Buyers, Comparison Shoppers, Impulse Buyers, and Brand Loyal Customers.
- **Multi-Layer Spatial Heatmaps**: 2D Gaussian heatmaps for Shopper Movement, Attention Fixations, and Shelf Engagement.
- **Product Attractiveness Scoring**: Weighted scoring model based on views, pickups, purchases, and gaze duration.
- **AI Placement Recommendations**: Evidence-backed planogram and layout optimization suggestions.
- **AI Retail Copilot**: Natural-language AI assistant answering store queries using backend database telemetry.
- **Report Generation & Data Integrity**: 5 report types (.PDF, .TXT, .CSV, .JSON) derived strictly from analyzed video data.
- **Video Security Validation**: Validates file format (.mp4, .avi, .mov), size limit (500MB), rejects script/executable files (.exe, .bat, .sh), and verifies video decode integrity with OpenCV.

---

## 4. System Architecture

```text
                         ┌──────────────────┐
                         │     MANAGER      │
                         └────────┬─────────┘
                                  ↓
                         ┌──────────────────┐
                         │  React Frontend  │
                         │  Dashboards      │
                         │  AI Copilot      │
                         └────────┬─────────┘
                                  ↓
                         ┌──────────────────┐
                         │   FastAPI API    │
                         └────────┬─────────┘
                                  ↓
              ┌───────────────────┼───────────────────┐
              ↓                   ↓                   ↓
        Authentication       Analytics API       Copilot API
              ↓                   ↓                   ↓
              │             ┌─────┴─────┐        LLM + Tools
              │             ↓           ↓             │
              │          PostgreSQL   AI Engine       │
              │                         ↓             │
              │                 YOLO + ByteTrack      │
              │                         ↓             │
              │                Attention Engine       │
              │                         ↓             │
              │              Behavioral Engine        │
              │                         ↓             │
              │               Recommendation         │
              │                         ↓             │
              └─────────────────┬─────────────────────┘
                                ↓
                         Reports + Analytics
                                ↓
                           Docker / Cloud
```

---

## 5. Technology Stack
- **Frontend**: React 18, Vite, TailwindCSS, ECharts / Recharts, Lucide Icons, React Router v6.
- **Backend API**: Python 3.12, FastAPI, SQLAlchemy, Pydantic v2, Pytest, Python-Multipart.
- **AI Engine**: Python 3.10, PyTorch, YOLOv8 (Ultralytics), ByteTrack, OpenCV.
- **Database**: PostgreSQL (Production) / SQLite (Development).
- **Containerization & Cloud**: Docker, Docker Compose, Nginx.

---

## 6. AI Pipeline
1. Frame Extraction & Rescaling (1920x1080 @ 30/60 FPS).
2. YOLOv8 Object Detection with NMS suppression.
3. ByteTrack Multi-Person Motion Tracking & Trajectory Smoothing.
4. Dwell Time Computation & Gaze Vector Angle Analysis.
5. Behavioral Pattern Analysis & Consumer Segmentation.
6. 2D Gaussian Spatial Heatmap Rendering.
7. Product Attractiveness Score Calculation.
8. Evidence-Based Optimization Recommendation Generation.

---

## 7. Dataset Information
- **Retail Store Surveillance Dataset**: Used for training & validating multi-person detection and tracking under store lighting conditions.
- **Retail Product Checkout (RPC) Dataset**: Used for product recognition, SKU classification, and shelf placement modeling.

---

## 8. Installation Instructions

### Prerequisites
- Python 3.12+
- Node.js 18+
- Git

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
pip install python-multipart
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 9. Environment Configuration
Create a `.env` file in root or backend:
```env
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/consumer_attention
SECRET_KEY=antigravity_consumer_attention_secret_key_2026
ACCESS_TOKEN_EXPIRE_MINUTES=4320
AI_MODEL_PATH=models/yolov8m.pt
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGINS=*
```

---

## 10. Running with Docker
```bash
# Build and spin up all containers
docker compose up -d --build
```
Access points:
- **Frontend App**: `http://localhost:80`
- **FastAPI API**: `http://localhost:8000`
- **Swagger Docs**: `http://localhost:8000/docs`

---

## 11. API Documentation
See full reference in [`docs/api.md`](file:///d:/CHERRY/SaiCharitha-Consumer-Attention-Mapping-System-main%20%282%29/SaiCharitha-Consumer-Attention-Mapping-System-main/docs/api.md).

---

## 12. Authentication
Supports Manager & Worker user registration, password hashing (HMAC-SHA256), JWT token issuance, and OTP email/SMS verification.

---

## 13. Dashboard Explanation
- **Manager Dashboard**: Displays all 8 Executive KPI Cards (Total Shoppers, Dwell Time, Attention Events, Top Shelf, Top Product, Peak Traffic Period, Most Visited Zone, Overall Store Engagement), top AI recommendations, and shelf intensity graph.
- **Worker Dashboard**: Displays assigned store tasks, priority badges, task details, status updating (Pending → In Progress → Completed), and photo upload.

---

## 14. AI Copilot
Integrated assistant answering natural language store queries using real backend database telemetry with evidence citations.

---

## 15. Video Analysis Workspace
Provides video upload security validation, dual overlay canvas (original video vs bounding box AI process), progress pipeline execution, and 10-section report export.

---

## 16. Centralized Analytics & Visualization Module
Includes a 7-stage filter bar (Store → Video → Date → Time Range → Zone → Shelf → Product) dynamically updating 6 core charts (Shopper Traffic, Dwell Distribution, Attention Fixation Trend, Product Ranking, Shelf Comparison, and Heatmaps).

---

## 17. Testing Strategy
Full automated test suite:
```bash
python -m pytest backend/tests/
```
Covers unit tests (`test_unit.py`), integration tests (`test_integration.py`), and AI pipeline tracking consistency (`test_ai_pipeline.py`).

---

## 18. Cloud Deployment
Supports deployment on cloud infrastructure (AWS EC2 / GCP Compute Engine / Azure VMs) via Docker Compose and reverse proxy setup. See [`docs/deployment.md`](file:///d:/CHERRY/SaiCharitha-Consumer-Attention-Mapping-System-main%20%282%29/SaiCharitha-Consumer-Attention-Mapping-System-main/docs/deployment.md).

---

## 19. Limitations
- Video quality & camera height affect YOLO detection accuracy in extreme crowd occlusions.
- Real-time 60 FPS multi-camera processing requires GPU acceleration (Nvidia CUDA).

---

## 20. Future Improvements
- Multi-camera 3D re-identification across overlapping surveillance angles.
- Direct POS sales integration to measure true gaze-to-purchase ROI.
