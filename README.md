# Consumer Attention Mapping System

> **AI-powered retail intelligence platform** that uses computer vision to track shopper behavior, map attention patterns, and generate actionable insights for store optimization.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://docs.docker.com/compose/)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [5 Role-Based Dashboards](#5-role-based-dashboards)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)
- [Authors](#authors)

---

## Overview

The **Consumer Attention Mapping System** is a full-stack retail analytics platform built for the **Infosys Springboard AI Program**. It processes live camera feeds using **YOLOv8**, **MediaPipe**, and **OpenCV** to:

- Detect and track multiple shoppers in real time
- Estimate gaze direction and attention focus per shelf/product zone
- Classify shopper behavior into 5 DNA profiles
- Score product attractiveness using a weighted multi-metric model
- Generate heatmaps, journey paths, and executive-grade PDF/CSV reports
- Surface insights through 5 role-specific dashboards with automatic RBAC routing

---

## Key Features

| Feature | Description |
|---|---|
| **Real-Time Person Detection** | YOLOv8-based multi-person detection with unique ID tracking (ByteTrack) |
| **Gaze and Attention Analysis** | MediaPipe head-pose estimation mapped to shelf planogram zones |
| **Shopper DNA Segmentation** | 5 behavioral profiles: Explorer, Quick Buyer, Comparison Shopper, Impulse Buyer, Brand Loyal |
| **Heatmap Generation** | 4-grid attention heatmaps per store/shelf/product zone |
| **Journey Path Analytics** | Consumer movement trajectories and common route patterns |
| **Product Attractiveness Scoring** | Weighted 5-metric scoring model (attention, interaction, pickup, conversion, repeat) |
| **Role-Based Dashboards** | 5 dedicated dashboards auto-routed by email keyword detection |
| **Out-of-Stock Automation** | Void gap detection with automated restock task board |
| **Campaign ROI Tracking** | Promotion scheduler and marketing revenue leakage analyzer |
| **PDF and CSV Reports** | Executive dossier and data exports for all analytics modules |

---

## Architecture

Data flows from physical store cameras through edge pre-processing, AI inference, and storage layers, out to role-specific dashboards.

```
+------------------------------------------+
|  EDGE LAYER (Store Cameras / RTSP)       |
|  - Pre-processing and stream routing     |
|  - YOLOv8 frame-level detection          |
+--------------------+---------------------+
                     |
                     v
+------------------------------------------+
|  AI INFERENCE PIPELINE                   |
|  - Multi-person tracking (ByteTrack)     |
|  - Gaze estimation (MediaPipe)           |
|  - Behavior classification               |
|  - Attractiveness scoring                |
+--------------------+---------------------+
                     |
                     v
+------------------------------------------+
|  BACKEND API LAYER (FastAPI)             |
|  - JWT Auth and Email-based RBAC         |
|  - Store / Zone / Camera CRUD            |
|  - Campaign and Restock Task APIs        |
|  - Analytics and Reports APIs            |
+--------------------+---------------------+
                     |
                     v
+------------------------------------------+
|  DATA LAYER (PostgreSQL 16)              |
|  - Users, Stores, Cameras, Shelves       |
|  - Campaigns, RestockTasks, SKUs         |
+--------------------+---------------------+
                     |
                     v
+------------------------------------------+
|  PRESENTATION LAYER (Next.js 16)         |
|  - Executive C-Suite Dashboard           |
|  - Admin Command Center                  |
|  - Store Manager Operations              |
|  - Retail Analyst Intelligence           |
|  - Marketing Manager ROI Dashboard       |
+------------------------------------------+
```

For full microservices breakdown and data model details, see [docs/architecture.md](./docs/architecture.md).

---

## 5 Role-Based Dashboards

The system uses **Email Keyword Role Detection** to automatically navigate users to their dedicated dashboard with route protection and session isolation:

| Role | Route | Primary Features |
|---|---|---|
| **Executive (C-Suite)** | /dashboard/executive | Multi-store benchmarking, Portfolio Attention Index, Network Footfall Leaderboards, Golden Zone Monetization, Board Reports |
| **Administrator** | /dashboard/admin | Full PostgreSQL CRUD for Stores, Cameras and Users, Real-Time System Monitoring, Platform Activity Logs |
| **Store Manager** | /dashboard/store-manager | Live Store Occupancy Gauge, AI Action Commander, Zone Congestion Monitor, OOS Void Gap Task Board, Live Camera Streams |
| **Retail Analyst** | /dashboard/retail-analyst | 5-Stage Purchase Funnel, 5 Shopper DNA Profiles, Weighted Attractiveness Scoring, Gaze Heatmaps |
| **Marketing Manager** | /dashboard/marketing-manager | Campaign Performance and ROI Tracker, Revenue Leakage Analyzer, Eye-Level Golden Zone Impressions, Promotion Scheduler |

---


## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router, Turbopack), React 19 |
| **Styling and Icons** | Tailwind CSS, Lucide React, JetBrains Mono |
| **Backend Framework** | Python 3.12, FastAPI, Uvicorn, Pydantic |
| **Database and ORM** | PostgreSQL 16, SQLAlchemy 2.0 |
| **Authentication** | JWT (JSON Web Tokens), Passlib Bcrypt, RBAC |
| **Computer Vision and AI** | YOLOv8 (Ultralytics), MediaPipe, OpenCV, NumPy |
| **Tracking and Gaze** | ByteTrack / DeepSORT, Perspective Homography |
| **DevOps and Containers** | Docker, Docker Compose |

---

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming conventions, commit message format, and the pull request process.

---

## Authors

**Kushalini Sreeja** - Infosys Springboard AI Retail Analytics Project
