# Changelog

All notable changes to the **Consumer Attention Mapping System** are documented here.

This project follows [Semantic Versioning](https://semver.org/) and [Conventional Commits](https://www.conventionalcommits.org/).

---

## [Unreleased]

- CHANGELOG maintenance and repo professionalization
- GitHub issue/PR templates
- CONTRIBUTING.md guide

---

## [1.0.0] — 2026-08-xx — Full-Stack System with Role-Based Dashboards

### Added
- Role-based dashboards: Executive, Admin, Store Manager, Retail Analyst, Marketing Manager
- Email-keyword-based automatic RBAC routing
- Campaign performance & ROI tracking APIs (`/routers/campaigns.py`)
- Restock task automation APIs (`/routers/restock_tasks.py`)
- Product attractiveness scoring APIs (`/routers/products.py`)
- Docker containerization for backend, frontend, and PostgreSQL (`infra/docker-compose.yml`)
- `seed_milestone4.py` for seeding complete milestone demo data

### Changed
- Overhauled README with full setup guide, tech stack, and RBAC tables
- Extended `models.py` with Campaign, RestockTask, and Product SKU entities
- Extended `stores.py` router with full CRUD for stores, shelves, and cameras

---

## [0.9.0] — Behavior Intelligence & Shelf Analytics

### Added
- `behavior_engine.py` — Shopper DNA behavioral classification (5 segments)
- `shelf_analyzer.py` — Shelf planogram gaze intersection and engagement scoring
- `pathway_engine.py` — Consumer journey path extraction and route pattern analysis
- Frontend: `BehaviorIntelligence.jsx`, `AttentionHeatmapsStudio.jsx`, `CommonPathwaysStudio.jsx`, `ShelfPlanogramAuditor.jsx`

---

## [0.8.0] — Video Analysis, Streaming & Gaze/Heatmap Services

### Added
- `video_analysis.py` router — dataset-based multi-person video traffic analysis with annotated output
- `streams.py` router — real-time MJPEG camera stream management
- `gaze_engine.py` — gaze estimation using MediaPipe/OpenCV head-pose analysis
- `heatmap_engine.py` — attention heatmap generation (matplotlib headless Agg backend)
- `stream_manager.py` — camera stream lifecycle manager
- `tracking_engine.py` — multi-object tracking integration
- Frontend: `LiveCameraStream.jsx`, `ShelfGazeHeatmap.jsx`, `LiveFloorplanRadar.jsx`
- Complete Admin Command Center dashboard redesign

---

## [0.7.0] — YOLOv8 Tracking, Detection & Live Dashboards

### Added
- Extended `detection.py` with full YOLOv8 person detection pipeline
- `tracking.py` router — multi-person tracking with unique IDs (ByteTrack/DeepSORT)
- YOLOv8 model weights: `yolov8n-pose.pt`, `best.pt`
- Retail dataset CSVs for testing (`datasets/Stores.csv`)
- Live Store Manager, Retail Analyst, and Marketing Manager dashboard components

---

## [0.6.0] — Next.js Frontend Scaffold & Docker Infrastructure

### Added
- Next.js 16 app scaffold with App Router and Turbopack
- Login page with JWT authentication integration (`login/page.jsx`)
- Backend virtual environment (`venv/`) and `requirements.txt`
- Docker Compose infrastructure (`infra/docker-compose.yml`) for full-stack local deployment

---

## [0.5.0] — Notification & Alert System (Module 11)

### Added
- Threshold-based alerts for visibility, traffic anomaly, and camera health
- Alert notification system with real-time push to dashboards

---

## [0.4.0] — PDF & CSV Export Reporting (Module 12)

### Added
- PDF dossier generation with compact 2×2 heatmap grid and segment breakdown table
- CSV exports for analytics, funnel metrics, shopper personas, and campaign ROI
- `reports_engine.py` — unified report generation engine

---

## [0.3.0] — Product Attractiveness Scoring (Modules 8 & 9)

### Added
- Weighted attractiveness scoring model: 35% Attention + 25% Interaction + 20% Pickup + 15% Conversion + 5% Repeat
- Expanded recommendation engine covering all 5 placement optimization types

---

## [0.2.0] — Gaze Detection, Zone Tracking & Behavior Classification (Modules 3–7)

### Added
- Multi-person tracking with unique IDs using YOLOv8 (`e51a7d7`)
- Zone entry/exit monitoring and dwell time calculation (`10bc699`, `4adfd11`)
- Gaze/attention detection using OpenCV head-pose estimation (`98df4e3`)
- Consumer behavior classification — 5 Shopper DNA profiles (`1d85cdb`)
- Journey/path analytics API endpoint — Module 6 (`d9d75b7`)
- Attention heatmap generation — Module 7 (`69e840d`)

---

## [0.1.0] — Milestone 1: Foundation (Modules 1 & 2)

### Added
- FastAPI backend with PostgreSQL via SQLAlchemy (`5b9b558`)
- JWT authentication, registration, and login APIs (`1ba5716`, `60c2a49`)
- Store, Shelf, Camera management REST APIs — Module 2 (`1760356`, `fadf6ec`)
- YOLOv8 real-time webcam person detection — Module 1 (`894adb9`, `bde1b64`)
- Docker containerization: `Dockerfile`, `docker-compose.yml`
- Project folder structure: `backend/`, `frontend/`, `database/`, `docs/`, `infra/`, `datasets/`

---

## [0.0.1] — Project Initialization

### Added
- Initial repository setup
- README with project overview
- Architecture documentation (`docs/architecture.md`)
- `.gitignore` for Python, Node.js, and Docker artifacts
