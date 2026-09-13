# Consumer Attention Mapping System — Presentation Slide Deck

> **Project Title**: Consumer Attention Mapping System — Tested, Deployable, Production-Ready Retail Intelligence Platform  
> **Architecture**: FastAPI, Python AI Engine (YOLOv8 + ByteTrack), React 18, PostgreSQL, Docker  
> **Team Lead / Author**: Sai Charitha  

---

## Slide 1: Title Slide

# 👁️ Consumer Attention Mapping System
### *Tested, Deployable, Production-Ready Retail Intelligence Platform*

* **Visuals**: A modern retail floorplan layout diagram paired with an AI Computer Vision gaze heatmap camera graphic.
* **Tagline**: Converting Surveillance Video into Actionable Shopper Insights, Spatial Heatmaps, & Merchandising Intelligence.

---

## Slide 2: Technology Stack: The System Framework Explained

* ⚛️ **React 18 & Vite**: Client-side UI library leveraging component-based architecture, TailwindCSS, ECharts/Recharts visual analytics, and Lucide icons.
* ⚡ **FastAPI & Python 3.12**: High-performance backend API framework powering asynchronous requests, Pydantic v2 data validation, SQLAlchemy ORM, and JWT authentication.
* 🤖 **AI Engine (YOLOv8 + ByteTrack)**: Computer vision pipeline built with PyTorch, YOLOv8 object detection, ByteTrack multi-person tracking, 2D Kalman motion vectors, and OpenCV.
* 🐘 **PostgreSQL & Docker**: Relational database storing telemetry data, dwell times, and gaze metrics, fully containerized via Docker and Docker Compose with Nginx reverse proxy.

---

## Slide 3: Core Features of Consumer Attention Mapping System

* 🎯 **Computer Vision & Multi-Layer Spatial Heatmaps**: Real-time YOLOv8 + ByteTrack multi-shopper tracking, exact dwell time computation (`Exit - Entry`), and 2D Gaussian heatmaps (Movement, Attention Fixations, Shelf Engagement).
* 📊 **Product Attractiveness & Planogram Recommendations**: Weighted scoring model based on views, pickups, purchases, and gaze duration, generating evidence-backed AI layout optimization suggestions.
* 🛡️ **Role-Based Access Control & AI Copilot**: Manager Dashboard (8 Executive KPIs, analytics) and Worker Dashboard (task dispatch with photo proof), paired with an interactive natural language AI Retail Copilot with database telemetry citations.

---

## Slide 4: Challenges Facing Physical Retail Stores

| Challenge | Impact | Consumer Attention Mapping System Solution |
| :--- | :--- | :--- |
| **Lack of Shopper Insight** | Store managers lack visibility into where shoppers look or why products are overlooked. | Computer vision gaze fixation tracking, dwell time analysis, and 2D Gaussian heatmaps |
| **Suboptimal Product Placement** | Trial-and-error shelf placement leads to reduced sales conversions and poor product visibility. | Weighted Product Attractiveness Scoring & automated AI planogram layout optimization |
| **Static & Manual Auditing** | Manual store audits are periodic, subjective, error-prone, and labor-intensive. | Automated video pipeline processing & instant 10-section downloadable evidence reports (.PDF, .CSV, .JSON) |
| **Disconnected Operations** | Disconnect between management decisions and floor worker task execution. | Role-Based Access Control (RBAC) with automated task dispatches to worker dashboards |

---

## Slide 5: System Architecture Overview

* 🧩 **Modular Layered Architecture**: Decoupled microservices architecture with React Frontend, FastAPI API Gateway, PostgreSQL Database, AI Processing Engine, and LLM Copilot tools.
* 🔌 **RESTful APIs & Telemetry Pipeline**: FastAPI endpoints bridge communication between client applications, video analysis workers, analytics computation, and database storage.
* 🔒 **Data Security & Validation**: Multi-step security validation checking video file extensions, 500MB size limits, script rejection (.exe, .bat, .sh), OpenCV decode integrity, and JWT authentication.
* 📈 **Scalability & Containerization**: Fully containerized using Docker & Docker Compose with Nginx reverse proxy, ready for cloud deployment (AWS EC2 / GCP Compute Engine).

---

## Slide 6: Challenges and Solutions in Consumer Attention Mapping System

* ⚡ **Scalability Solutions**: Optimized 8-stage AI vision pipeline handles high-resolution video streams and multi-shopper tracking efficiently with GPU CUDA acceleration.
* 🔐 **Security Enhancements**: End-to-end token verification (JWT + bcrypt), OTP verification (Email/SMS), and 4-tier video upload security checks protect system integrity.
* 🎯 **Shopper Behavior Analysis**: Overcomes visual occlusion using ByteTrack 2D Kalman motion tracking and computes consumer segments (Explorers, Quick Buyers, Comparison Shoppers, Impulse Buyers).
* 🏗️ **Modular Design Advantages**: Independent AI vision engine, backend API, and frontend dashboards ensure maintainability and future third-party POS integrations.

---

## Slide 7: Measurable Outcomes and Positive Impact

* ⭐ **Data-Driven Merchandising**: Replaces guessing with evidence-based product placement, increasing high-value shelf gaze duration and sales conversions.
* ⏳ **Reduced Manual Coordination**: Automates store auditing, stock inspection, and task assignment, significantly reducing organizer and floor manager workload.
* 📈 **Increased Retail Intelligence**: Provides 8 Executive KPI metrics, 6 interactive analytics charts, and 10-section downloadable reports for complete operational transparency.

---

## Slide 8: Platform Mock-ups

* 🖼️ **UI/UX Showcase**: Presents interface mock-ups demonstrating the platform's user flow, visual design, and accessibility across core workflows:
  * *Manager Executive Dashboard* (8 KPI Cards, Shelf Intensity Graph, AI Recommendations Panel)
  * *Video Analysis Workspace* (Dual Canvas: Raw Video vs Live Bounding Box Tracking & Heatmaps)
  * *Worker Task Management Dashboard* (Assigned Store Tasks, Priority Badges, Photo Proof Upload)
  * *Interactive AI Retail Copilot* (Natural Language Query Assistant with Database Telemetry Citations)

---

## Slide 9: Store Admin & User Workflow Process

* 🚀 **Simple User Onboarding**: Straightforward signup flow supporting role-based registration (Manager vs Worker) with secure authentication and OTP verification.
* 🛡️ **Secure Video Ingestion**: Store managers upload surveillance video feeds; system automatically validates file format, size limits, and video decode safety.
* 📊 **Executive Control & Task Dispatch**: Grants managers full control over video processing, spatial heatmaps, product scores, and 1-click task dispatch to worker dashboards upon verification.

---

## Slide 10: Future Enhancements for Consumer Attention Mapping System

* 🎥 **Multi-Camera 3D Re-Identification**: Cross-camera person tracking across overlapping surveillance angles to maintain shopper identity across large store layouts.
* 💳 **POS Sales Integration**: Linking gaze fixations and shelf dwell times directly with point-of-sale checkout data to calculate true gaze-to-purchase ROI.
* ⚡ **Real-Time Edge AI Processing**: Deploying models onto edge hardware (NVIDIA Jetson / TensorRT) for real-time sub-10ms inference and live floor alerts.

---

## Slide 11: Team Members

### 👥 Project Contributors
* **Sai Charitha** *(Lead Developer & Project Author)*
* **Retail Intelligence AI Engineering Team**

---

## Slide 12: Presentation Video

* 📹 **Project Demo Video**: Contains a link to the recorded project demonstration video showing end-to-end video upload, YOLOv8 tracking, heatmap rendering, AI Copilot interaction, and report generation.
  * [Watch Project Demonstration Video](https://drive.google.com) *(Link to recorded demo)*

---

## Slide 13: Q & A

* ❓ **Questions & Answers**: Dedicated slide for opening the floor to questions and answers from the evaluators, faculty reviewers, and store stakeholders.

---

## Slide 14: Thank You

* 🙏 **Thank You!**: Concluding slide acknowledging the audience, mentors, evaluators, and project contributors for their guidance and support. Concluding slide acknowledging the audience, mentors, and evaluators for their time and guidance.
