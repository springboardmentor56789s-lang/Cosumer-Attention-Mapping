# Consumer Attention Mapping System

This is my AI-powered project for the Infosys Internship Program started on 23 July 2026.

An AI-powered retail analytics platform that uses computer vision to track shopper attention, behavior, and engagement in physical stores.

## Features
- User authentication with JWT (role-based: Store Manager, Retail Analyst, Marketing Manager, Admin)
- Store, shelf, and camera management
- Real-time person detection and multi-person tracking (YOLOv8)
- Zone-based dwell time and entry/exit tracking
- Attention/gaze detection (OpenCV)
- Product interaction detection (Viewed, Picked Up, Purchased, Compared, Returned)
- Consumer behavior segmentation (Explorer, Quick Buyer, Comparison Shopper, etc.)
- Attention heatmap generation (store, shelf, product, traffic)
- Product attractiveness scoring engine
- Shelf optimization recommendations
- Notification & alert system
- PDF/Excel report generation

## Tech Stack
- **Backend:** Python, FastAPI, PostgreSQL, SQLAlchemy
- **Auth:** JWT (python-jose), bcrypt
- **Computer Vision:** OpenCV, YOLOv8 (Ultralytics)
- **Data & Visualization:** Matplotlib, Seaborn, NumPy
- **Reports:** ReportLab (PDF), openpyxl (Excel)
- **Testing:** pytest
- **Deployment:** Docker

## Setup Instructions

1. Clone the repository
2. Navigate to `Backend` folder
3. Create virtual environment: `python -m venv venv`
4. Activate: `venv\Scripts\activate` (Windows)
5. Install dependencies: `pip install -r requirements.txt`
6. Create a `.env` file with your `DATABASE_URL`
7. Run the server: `uvicorn main:app --reload`
8. Access API docs at `http://127.0.0.1:8000/docs`
9. Run cd frontend and npm start in frontend terminal to visualize the project

## API Endpoints
- `/register`, `/login` - Authentication
- `/stores`, `/shelves`, `/cameras` - Store management
- `/detect-people` - Person detection
- `/behavior-analysis/{track_id}` - Behavior classification
- `/shelf-scores` - Attractiveness scoring
- `/recommendations` - Optimization suggestions
- `/alerts` - System alerts
- `/reports/pdf`, `/reports/excel` - Report downloads
