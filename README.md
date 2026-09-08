# ?? AI Consumer Attention Mapping System

An enterprise-grade, role-based intelligent retail analytics platform powered by **Computer Vision (YOLOv8, MediaPipe, OpenCV)**, **FastAPI**, **PostgreSQL**, and **Next.js**. The platform analyzes in-store shopper movement, gaze fixation, dwell times, and product engagement to optimize shelf planograms, measure golden zone attractiveness, and drive retail conversion.

---

## ??? System Architecture

`	ext
                               +----------------------------+
                               ¦       Retail Cameras       ¦
                               ¦   (RTSP / IP / Webcams)    ¦
                               +----------------------------+
                                             ¦
                                             ?
                     +--------------------------------------------+
                     ¦          AI Processing Layer               ¦
                     ¦--------------------------------------------¦
                     ¦ • YOLOv8 Person Detection                  ¦
                     ¦ • DeepSORT / ByteTrack Movement Tracking   ¦
                     ¦ • MediaPipe Gaze & Head-Pose Estimation    ¦
                     ¦ • Shelf Planogram Gaze Intersection        ¦
                     ¦ • Multi-Zone Heatmap Generation            ¦
                     ¦ • Shopper DNA Behavioral Clustering        ¦
                     +--------------------------------------------+
                                    ¦
                                    ?
                     +--------------------------------------------+
                     ¦          Backend API Layer (FastAPI)       ¦
                     ¦--------------------------------------------¦
                     ¦ • JWT Authentication & Email Auto-RBAC     ¦
                     ¦ • Store, Zone & Camera PostgreSQL CRUD     ¦
                     ¦ • Real-Time Stream Manager (MJPEG/Webcam)  ¦
                     ¦ • Product SKU Attractiveness Engine        ¦
                     ¦ • Out-of-Stock (OOS) Task Automation       ¦
                     ¦ • Marketing Campaigns & ROI Engine         ¦
                     ¦ • Behavioral & Funnel Analytics APIs       ¦
                     +--------------------------------------------+
                                    ¦
                                    ?
                     +--------------------------------------------+
                     ¦            Database Layer                  ¦
                     ¦--------------------------------------------¦
                     ¦ • PostgreSQL (Stores, Shelves, SKUs,       ¦
                     ¦   Cameras, Users, Campaigns, Restock Tasks)¦
                     +--------------------------------------------+
                                    ¦
                                    ?
                     +--------------------------------------------+
                     ¦       Presentation Layer (Next.js 16)      ¦
                     ¦--------------------------------------------¦
                     ¦ • ?? Executive C-Suite Dashboard           ¦
                     ¦ • ??? Admin Command Center                  ¦
                     ¦ • ?? Store Manager Operations Dashboard    ¦
                     ¦ • ?? Retail Analyst Intelligence Studio    ¦
                     ¦ • ?? Marketing Manager ROI Dashboard       ¦
                     +--------------------------------------------+
`

---

## ?? 5 Role-Based Dashboards

The application implements an intelligent **Email Keyword Role Detection** and **Role-Based Access Control (RBAC)** architecture that automatically navigates users to their dedicated dashboard with route protection and session isolation:

| Role | Dedicated Route | Primary Features |
|------|-----------------|------------------|
| **Executive (C-Suite)** | /dashboard/executive | Multi-Store Benchmarking, Portfolio Attention Index, Network Footfall Leaderboards, Golden Zone Monetization, Board of Directors Reports. |
| **Administrator** | /dashboard/admin | Full PostgreSQL CRUD for Stores, Cameras & Users, Real-Time System Monitoring, Platform Activity Logs, Alert Notifications. |
| **Store Manager** | /dashboard/store-manager | Real-Time Store Occupancy Gauge, AI Action Commander, Zone Congestion Monitor, Out-of-Stock (OOS) Void Gap Task Board, Live Camera Streams. |
| **Retail Analyst** | /dashboard/retail-analyst | 5-Stage Purchase Funnel (Passersby ? Gaze ? Touch ? Cart ? Sale), 5 Shopper DNA Behavioral Profiles, Weighted Product Attractiveness Scoring, Gaze Heatmaps. |
| **Marketing Manager** | /dashboard/marketing-manager | Campaign Performance & ROI Tracker, Merchandising Revenue Leakage Analyzer, Eye-Level Golden Zone Impression Share, Promotion Scheduler. |

---

## ?? 5 Shopper DNA Behavioral Segments

Categorized based on tracking velocity, dwell duration, and interaction frequencies:

1. ?? **Explorers (26%)**: Broad navigation across multiple aisles with high visual curiosity; discovers new products; high exposure to promotional displays.
2. ? **Quick Buyers (31%)**: High-velocity transit directly to target shelf coordinates with immediate pickup and rapid checkout; highest revenue efficiency per minute.
3. ?? **Comparison Shoppers (21%)**: Extended dwell inspecting packaging, ingredient labels, and price tags; multiple pickup and return events before deciding.
4. ?? **Impulse Buyers (14%)**: Strong attention fixation on Eye-Level Golden Zone displays and endcaps; high conversion on bundle promotions and discounts.
5. ?? **Brand Loyal Customers (8%)**: Direct, habitual navigation to known product positions; minimal comparison deliberation; highest repeat engagement and retention.

---

## ?? Weighted Product Attractiveness Scoring Model

Compliant with standard retail merchandising evaluation standards:

\text{Product Attractiveness Score} = 35\%(\text{Attention}) + 25\%(\text{Interaction}) + 20\%(\text{Pickup}) + 15\%(\text{Conversion}) + 5\%(\text{Repeat})

---

## ?? Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router, Turbopack), React 19 |
| **Styling & Icons** | Tailwind CSS, Lucide React, JetBrains Mono |
| **Backend Framework** | Python 3.12, FastAPI, Uvicorn, Pydantic |
| **Database & ORM** | PostgreSQL 16, SQLAlchemy 2.0 |
| **Authentication** | JWT (JSON Web Tokens), Passlib Bcrypt, RBAC |
| **Computer Vision & AI** | YOLOv8 (Ultralytics), MediaPipe, OpenCV, NumPy |
| **Tracking & Gaze** | DeepSORT / ByteTrack, Perspective Homography |
| **DevOps & Containers** | Docker, Docker Compose |

---

## ?? Quickstart & Setup Guide

### 1?? Clone the Repository
`ash
git clone https://github.com/springboardmentor56789s-lang/Cosumer-Attention-Mapping.git
cd Cosumer-Attention-Mapping
`

### 2?? Database Setup (PostgreSQL)
Ensure PostgreSQL is running locally on port 5432 with a database named ttention_mapping:
`ash
# Using Docker (optional):
cd infra
docker compose up -d postgres
`
Connection string: postgresql://postgres:infy_springboard@localhost:5432/attention_mapping

### 3?? Backend Setup (FastAPI)
`ash
cd backend
python -m venv venv
venv\Scripts\activate          # On Windows
# source venv/bin/activate     # On macOS/Linux

pip install -r requirements.txt

# Run database migrations and seed milestone data
python -m app.create_tables
python -m app.seed_milestone4

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
`
Backend API docs available at: http://localhost:8000/docs

### 4?? Frontend Setup (Next.js)
`ash
cd ../frontend
npm install
npm run dev
`
Open http://localhost:3000 in your browser.

---

## ?? Demo Credentials & Automatic Role Detection

When registering or logging in at http://localhost:3000/login, the system dynamically detects your role based on keywords in your email:

| Email Keyword Pattern | Example Email | Auto-Assigned Role | Destination Route |
|---|---|---|---|
| dmin | kushalini.admin@corp.com | Administrator | /dashboard/admin |
| exec / ceo / coo | kushalini.exec@corp.com | Executive C-Suite | /dashboard/executive |
| store / manager | kushalini.manager@corp.com | Store Manager | /dashboard/store-manager |
| nalyst | kushalini.analyst@corp.com | Retail Analyst | /dashboard/retail-analyst |
| marketing / mktg | kushalini.marketing@corp.com | Marketing Manager | /dashboard/marketing-manager |

---

## ?? Export & Reporting Features
- **CSV Data Export**: High-level store analytics, 5-stage funnel conversion drop-offs, clustered shopper personas, campaign ROI, and board executive summaries.
- **Executive PDF Dossier**: Integrated **"?? Export as PDF / Print Report"** functionality on all reporting modules pre-formatted for executive presentations.

---

## ?? Docker Deployment
To launch the complete unified stack with Docker Compose:
`ash
cd infra
docker compose up --build
`
This deploys PostgreSQL on port 5432, the FastAPI API on port 8000, and the Next.js frontend on port 3000.

---

## ?? Authors & Contributors
- **Kushalini & Sreeja** — *Infosys Springboard AI Retail Analytics Project*
