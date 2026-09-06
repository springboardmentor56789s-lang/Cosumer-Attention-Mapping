# 🧠 AI Consumer Attention Mapping System

An AI-powered retail intelligence platform that analyzes customer behavior from retail video footage using **computer vision, object detection, multi-object tracking, gaze estimation, and behavioral analytics**.

The system identifies shoppers, tracks their movement, measures attention and dwell time, analyzes shelf/product engagement, and converts video observations into actionable retail intelligence through interactive dashboards and reports.

The project is designed to help retailers understand **where customers look, which shelves attract attention, how long shoppers stay, which products receive engagement, and how customers move through a retail environment**.

---

## 📌 Project Overview

The **AI Consumer Attention Mapping System** is an end-to-end video analytics platform for understanding consumer behavior inside retail environments.

The system processes uploaded retail videos through a computer-vision pipeline and generates structured analytics such as:

* Customer detection and tracking
* Customer movement paths
* Shelf visits
* Dwell time
* Gaze direction
* Gaze confidence
* Attention score
* Shelf attention
* Product engagement
* Customer behavioral patterns
* Attention distribution across shelves/zones
* Product attractiveness
* Retail intelligence insights
* Customer attention reports
* Shelf performance reports
* Product engagement reports

The platform separates **video-level processing** from **aggregated retail analytics**, allowing temporary customer-level tracking during video processing while maintaining useful aggregated intelligence for dashboards and reports.

The overall project objective is consistent with the project specification: use cameras, computer vision, behavioral analytics, and AI models to understand interactions with retail shelves, products, displays, and store layouts.

---

# 🎯 Problem Statement

Traditional retail stores have limited visibility into what customers actually do inside a physical store.

Sales data can show **what was purchased**, but it does not directly explain:

* Which shelf attracted the customer's attention?
* Which product was noticed first?
* How long did the customer stay near a shelf?
* Did the customer quickly pass a shelf?
* Which areas received the highest attention?
* Which products received the most engagement?
* How did customers move through the store?
* Which shelves caused repeated visits?
* Which products appear visually attractive?
* Where should products or promotional displays be improved?

Manual observation is time-consuming, subjective, and difficult to scale.

### Proposed Solution

The AI Consumer Attention Mapping System uses video analytics and AI to transform retail camera/video data into measurable consumer behavior intelligence.

The system automatically detects and tracks shoppers, analyzes their attention and movement, associates behavior with retail zones and shelves, and presents the resulting insights through role-based dashboards.

---

# ⭐ Key Features

## 1. Secure Authentication

* User registration
* User login
* JWT-based authentication
* Bearer-token API authentication
* Role-based access control
* Protected dashboard routes
* Session/token validation

### Supported Roles

* Administrator
* Retail Analyst
* Store Manager
* Marketing Analyst

Each role can access functionality according to its permissions.

---

## 2. Customer Detection & Tracking

The video-analysis pipeline detects shoppers and maintains their identities across video frames.

### Capabilities

* Person detection
* Multi-person tracking
* Unique tracking IDs
* Movement/path tracking
* Entry and exit detection
* Zone tracking
* Shelf interaction tracking
* Temporary customer journey construction

The system uses **YOLOv8** for object/person detection and **ByteTrack** for multi-object tracking.

---

## 3. Attention Analysis

The system analyzes customer attention toward retail areas using visual and behavioral signals.

### Attention Metrics

* Attention score
* Gaze direction
* Gaze confidence
* Dwell time
* View duration
* Shelf attention time
* Product focus duration
* Repeated attention events

These metrics help identify which retail areas attract the most customer attention.

---

## 4. Shelf & Zone Analytics

Retail shelves and zones are represented as defined areas of interest.

The system can calculate:

* Customers visiting a shelf
* Average dwell time
* Attention percentage
* High-interest interactions
* Shelf revisits
* Quick passes
* Attention distribution across zones

---

## 5. Product Engagement Analysis

The system analyzes customer interactions with products and retail shelves.

Example signals include:

* Product viewed
* Product engagement
* Product pickup
* Product return
* Repeated product attention
* Product-focused dwell time

These signals contribute to product-level engagement and attractiveness analysis.

---

## 6. Customer Behavior Intelligence

Customer movement and attention signals are converted into behavioral categories and aggregate insights.

Example behavioral patterns include:

* Quick Pass
* Browsing
* High Interest
* Revisit

The system can analyze customer paths, shelf visits, attention patterns, and engagement behavior.

---

## 7. Attention Mapping

The system provides visual representations of attention distribution across retail areas.

Attention mapping helps answer:

> "Which parts of the store receive the most customer attention?"

The system can represent attention by:

* Zone
* Shelf
* Retail area
* Product

The original project specification also identifies store, shelf, product-attention, traffic, and engagement hotspot heatmaps as core attention-mapping capabilities.

---

## 8. Product Attractiveness Scoring

The system calculates product attractiveness using multiple behavioral signals.

The scoring concept defined in the project specification uses:

| Signal                        | Weight |
| ----------------------------- | -----: |
| Attention Duration            |    35% |
| Product Interaction Frequency |    25% |
| Product Pickup Rate           |    20% |
| Purchase Conversion Rate      |    15% |
| Repeat Engagement Rate        |     5% |

**Product Attractiveness Score = weighted combination of behavioral/product engagement signals.**

In the current dashboard design, the emphasis is on presenting the **highest-attractiveness products**, rather than overwhelming the user with every detected product.

---

# 🏗️ System Architecture

                    ┌─────────────────────────┐
                    │       User / Analyst    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      Web Frontend       │
                    │ Dashboard / Reports /   │
                    │ Video Analysis Workspace │
                    └────────────┬────────────┘
                                 │
                         HTTP / REST API
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      FastAPI Backend    │
                    │ Authentication / APIs / │
                    │ Analytics / Reports     │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌────────────┐    ┌──────────────┐   ┌─────────────┐
       │ PostgreSQL │    │ Video Engine │   │ Analytics   │
       │            │    │              │   │ Services    │
       └────────────┘    └──────┬───────┘   └──────┬──────┘
                                │                   │
                                ▼                   ▼
                         ┌───────────────┐   ┌───────────────┐
                         │ YOLOv8        │   │ Behavioral    │
                         │ ByteTrack     │   │ Analytics     │
                         │ Gaze Analysis │   │ Attention      │
                         │ OpenCV        │   │ Product/Shelf │
                         │ FFmpeg        │   │ Analytics     │
                         └───────────────┘   └───────────────┘
                                │
                                ▼
                         ┌───────────────┐
                         │ Aggregated    │
                         │ Intelligence  │
                         └───────┬───────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Dashboards & Reports    │
                    │                         │
                    │ Live Insights            │
                    │ Retail Intelligence      │
                    │ Reports                  │
                    │ Admin Dashboard          │
                    └─────────────────────────┘
```

### Architecture Flow

```text
Video Input
     ↓
Video Preprocessing
     ↓
Person / Object Detection
     ↓
Multi-Object Tracking
     ↓
Customer Movement Analysis
     ↓
Gaze / Attention Analysis
     ↓
Shelf & Product Association
     ↓
Behavioral Analytics
     ↓
Aggregation
     ↓
Retail Intelligence
     ↓
Dashboard / Reports
```

---

# 🛠️ Technology Stack

## Backend

* **Python**
* **FastAPI**
* REST APIs
* JWT Authentication

The project specification identifies Python and FastAPI as the backend technologies.

## Frontend

* HTML
* JavaScript
* Tailwind CSS
* Chart.js
* Interactive dashboard components

The broader project specification also identifies React.js, Next.js and Tailwind CSS as frontend technologies.

## Database

### Primary Database

* PostgreSQL

PostgreSQL is defined as the primary database in the project specification.

## Computer Vision & AI

* YOLOv8
* OpenCV
* Gaze estimation
* Computer vision processing

## Tracking

* ByteTrack

## Video Processing

* OpenCV
* FFmpeg

The project specification explicitly identifies OpenCV, ByteTrack and FFmpeg for video analytics.

## Data Analytics

* Pandas
* NumPy
* Scikit-learn

## Visualization

* Chart.js
* Plotly / Matplotlib where applicable

## DevOps

* Docker
* Docker Compose
* Git
* GitHub
* GitHub Actions
* VS Code
* Postman

Docker, GitHub Actions, Postman and related deployment tooling are included in the project technology specification.

---

# 📊 Dataset Information

The project specification recommends multiple datasets for developing and validating the computer-vision components.

## Recommended Datasets

### Retail Product Checkout Dataset

**Purpose:**

* Retail object detection
* Product recognition

### SKU-110K

**Purpose:**

* Shelf product detection
* Retail shelf analytics

### COCO Dataset

**Purpose:**

* Person detection
* Object tracking

### Retail Store Traffic Dataset

**Purpose:**

* Consumer movement analytics
* Store traffic monitoring

These datasets are identified in the original project specification as recommended datasets.

### Project Video Input

In addition to datasets used for model development/testing, the application supports **retail video input** for analysis.

A typical input workflow is:

```text
Retail Video
     ↓
Upload / Select Video
     ↓
Video Processing
     ↓
Detection + Tracking
     ↓
Attention Analysis
     ↓
Behavior Analysis
     ↓
Aggregated Analytics
     ↓
Dashboard + Reports
```



# 🔐 Environment Configuration

The application requires environment-specific configuration for:

| Variable         | Purpose                         |
| ---------------- | ------------------------------- |
| `DATABASE_URL`   | PostgreSQL database connection  |
| `JWT_SECRET_KEY` | JWT signing secret              |
| `JWT_ALGORITHM`  | JWT signing algorithm           |
| `UPLOAD_DIR`     | Uploaded video location         |
| `OUTPUT_DIR`     | Processed video/output location |
| `ENVIRONMENT`    | Application environment         |
| `DEBUG`          | Development debugging           |

### Security Recommendations

* Never commit `.env` files.
* Use strong JWT secrets.
* Do not expose database credentials.
* Use environment variables for production secrets.
* Configure CORS according to deployment requirements.
* Protect API endpoints with authentication and authorization.

---

# 🐳 Running with Docker

Docker provides a reproducible environment for running the application.

## Build the Containers

```bash
docker compose build
```

## Start the Application

```bash
docker compose up
```

For background execution:

```bash
docker compose up -d
```

## View Running Containers

```bash
docker compose ps
```

## View Logs

```bash
docker compose logs -f
```

## Stop the Application

```bash
docker compose down
```

## Rebuild After Code Changes

```bash
docker compose up --build
```

### Typical Docker Architecture

```text
                 Docker Compose
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
   Backend Container          PostgreSQL
      FastAPI                    Database
          │
          ├── Authentication
          ├── Analytics APIs
          ├── Report APIs
          └── Video Processing
```

The project specification explicitly includes Docker containerization and production deployment as part of the final integration stage.

---

# 🔑 Authentication

The system uses **JWT bearer-token authentication**.

## Authentication Flow

```text
Register
   ↓
Login
   ↓
Backend validates credentials
   ↓
JWT token generated
   ↓
Frontend stores authenticated session/token
   ↓
Token sent with API requests
   ↓
Backend validates JWT
   ↓
Role / permission checked
   ↓
Protected resource returned
```

Example API request:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Role-Based Access

The platform uses role-based access to separate responsibilities.

### Administrator

Responsible for:
* Store management
* Shelf management
* Retail intelligence
* Product management
* Camera management
* Reports
* Heatmaps


### Retail Analyst

Focuses on:

* Consumer behavior
* Attention analytics
* Shelf performance
* Product engagement
* Retail intelligence
* Customer paths
* Reports

### Store Manager

Focuses on:

* Store performance
* Shelf performance
* Customer traffic
* Product engagement
* Operational retail insights

### Marketing Analyst

Focuses on:

* Consumer engagement
* Product attractiveness
* Promotional/product visibility insights
* Marketing-oriented analytics

---

# 📊 Dashboard Explanation

## 1. Admin Dashboard

The Admin Dashboard acts as the platform administration center.

### Main Areas

* Store Management
* Shelf Management
* Product Management
* Camera Management
* Reports
* Heatmaps
* Logout

The dashboard is designed for configuration and platform management rather than detailed consumer-behavior analysis.

The project specification defines user management, platform analytics, camera management and system monitoring as administrative functions.

---

# 👥 Retail Analyst Dashboard

The Retail Analyst Dashboard provides a high-level view of consumer and retail performance.

It brings together:

* Consumer KPIs
* Attention metrics
* Shelf performance
* Product performance
* Customer paths
* Behavioral insights
* Attention trends
* Retail intelligence

The dashboard retrieves analytics through authenticated APIs and converts backend results into visual KPI cards, charts, tables and insights.

---

# 👁️ Live Insights

The **Live Insights** page focuses on the latest consumer behavior signals generated from video analysis.

### Major Components

#### Consumer KPIs

Examples:

* Total customers
* Average dwell time
* Average attention
* Other aggregate signals

#### Aggregated Attention

Displays attention distribution across retail shelves/zones.

Example:

```text
Zone A
 ├── A01 → 42%
 ├── A02 → 86%
 ├── A03 → 71%
 └── A04 → 35%

Zone B
 ├── B01 → 31%
 ├── B02 → 64%
 └── B03 → 48%
```

#### Aggregate Shopper Behavior

Example categories:

```text
Quick Pass     18%
Browsing       42%
High Interest  21%
Revisit        19%
```

#### Key Insights

Highlights the most important aggregate attention and behavior signals instead of forcing the user to interpret every individual detection.

#### Product Attractiveness

The current design emphasizes the **top products with the highest attractiveness**, providing a concise product-performance view.

---

# 📈 Retail Intelligence

The Retail Intelligence page converts processed analytics into business-oriented insights.

Instead of duplicating all Live Insights information, it focuses on higher-level interpretation.

Typical areas include:

* Trends
* Comparisons
* Rankings
* Anomalies
* Behavioral changes
* Peak periods
* Customer path changes
* Engagement opportunities
* Strategic recommendations

The goal is to answer:

> **"What does the analyzed consumer behavior mean for retail decision-making?"**

---

# 📑 Reports

The reporting module provides structured retail analytics.

The current report design focuses on three core reports:

## Customer Attention Report

Displays customer-level attention information in tabular form.

Example fields:

| Field                  |
| ---------------------- |
| Customer / Tracking ID |
| Attention Score        |
| Dwell Time             |
| Shelf Visited          |
| Behavior               |

Each detected customer is represented as a single customer-level record rather than displaying repeated rows for every video frame/event.

---

## Shelf Performance Report

Provides shelf-level performance analytics.

Example fields:

| Field               |
| ------------------- |
| Shelf ID            |
| Customers           |
| Average Dwell Time  |
| Attention %         |
| High Interest Count |

---

## Product Engagement Report

Provides product-level engagement analytics.

Example fields:

| Field              |
| ------------------ |
| Product ID         |
| Product Name       |
| Shelf ID           |
| Customers Engaged  |
| Average Attention  |
| Average Dwell Time |

The project specification identifies consumer attention, product engagement and shelf performance reports among the reporting requirements.

---

# 🎥 Video Analysis Workspace

The Video Analysis Workspace is the main processing environment where retail videos are analyzed.

## Workflow

```text
1. Upload Video
       ↓
2. Validate Video
       ↓
3. Read Video Frames
       ↓
4. Detect Customers / Objects
       ↓
5. Track Customers
       ↓
6. Analyze Movement
       ↓
7. Estimate Attention / Gaze
       ↓
8. Associate Customers with Shelves / Zones
       ↓
9. Calculate Behavioral Metrics
       ↓
10. Aggregate Results
       ↓
11. Store Required Analytics
       ↓
12. Display Dashboards / Reports
```

## Detection

YOLOv8 identifies relevant objects/persons in the video.

## Tracking

ByteTrack assigns and maintains tracking IDs across frames.

## Video Processing

OpenCV handles frame-level processing while FFmpeg can be used for video manipulation and media processing.

## Attention Analysis

Attention signals are calculated using gaze/visual behavior and customer interaction with defined retail areas.

## Customer Journey

Customer movement is constructed temporarily during processing to calculate journey/path analytics.

The system emphasizes **aggregated journey and behavioral information** rather than permanently storing every frame-level customer movement.

---

# 📦 Analytics Events

The platform can generate behavioral events such as:

```text
CUSTOMER_ENTER_ZONE
CUSTOMER_EXIT_ZONE

SHELF_ENTER
SHELF_EXIT

ATTENTION_START
ATTENTION_END

QUICK_PASS
HIGH_INTEREST
SHELF_REVISIT
```

These events can then be converted into higher-level analytics.

---

# 📊 Core Analytics

The system produces metrics including:

### Customer Metrics

* Total customers
* Customer tracking
* Average dwell time
* Customer paths
* Zone visits

### Attention Metrics

* Average attention
* Attention score
* Gaze direction
* Gaze confidence
* Attention duration

### Shelf Metrics

* Shelf visits
* Shelf attention
* Shelf dwell time
* High-interest interactions
* Shelf revisits

### Product Metrics

* Product engagement
* Product attention
* Product dwell time
* Product attractiveness

### Behavioral Metrics

* Quick Pass
* Browsing
* High Interest
* Revisit

---

# 🧪 Testing Strategy

Testing is performed at multiple levels.

## 1. Unit Testing

Test individual functions and services.

Examples:

* Authentication functions
* Analytics calculations
* Report generation
* Score calculations
* Data transformations

---

## 2. API Testing

Validate backend endpoints using tools such as:

* Postman
* Automated API tests

Test:

* HTTP status codes
* Authentication
* Authorization
* Request validation
* Response structure
* CRUD operations

---

## 3. Authentication Testing

Validate:

* Registration
* Login
* Invalid credentials
* Expired JWT
* Missing token
* Invalid token
* Role restrictions
* Unauthorized API access

---

## 4. Video Pipeline Testing

Validate the complete processing pipeline:

```text
Video
 ↓
Detection
 ↓
Tracking
 ↓
Attention
 ↓
Shelf Association
 ↓
Aggregation
 ↓
Analytics
```

Test with different:

* Video lengths
* Number of shoppers
* Camera angles
* Lighting conditions
* Shopper densities
* Shelf configurations

---

## 5. Frontend Testing

Validate:

* Dashboard loading
* API integration
* Loading states
* Empty states
* Error handling
* Authentication expiry
* Role restrictions
* Charts
* Tables
* Report rendering

---

## 6. Integration Testing

Validate the complete flow:

```text
Frontend
   ↓
FastAPI
   ↓
Database
   ↓
Video Processing
   ↓
Analytics
   ↓
Dashboard
```

---

## 7. Performance Testing

Important performance metrics include:

* Video processing latency
* API response time
* Dashboard loading speed
* Concurrent camera/video handling
* CPU/GPU utilization
* Memory consumption

The project specification identifies video-processing latency, API response time, dashboard loading speed and concurrent camera handling as key system-performance metrics.

---

# 📏 Evaluation Metrics

The system can be evaluated using:

### Consumer Tracking

* Person detection accuracy
* Tracking accuracy
* Shopper re-identification accuracy

### Attention Analysis

* Gaze estimation accuracy
* Dwell-time accuracy
* Attention mapping precision

### Product Engagement

* Product interaction detection accuracy
* Pickup detection accuracy
* Conversion prediction accuracy

### Retail Analytics

* Heatmap accuracy
* Consumer segmentation quality
* Shelf optimization effectiveness

These evaluation categories are defined in the project specification.

---

# 🚀 Future Improvements

The platform can be extended in several directions.

## 1. Real-Time Camera Analytics

Move from primarily uploaded-video analysis toward continuous real-time camera processing.

---

## 2. Advanced Gaze Estimation

Improve gaze estimation using:

* Better head-pose estimation
* More robust facial landmarks
* Camera calibration
* Multi-camera attention tracking

---

## 3. Cross-Camera Customer Tracking

Allow a shopper to be tracked across multiple cameras while maintaining privacy-aware identifiers.

---

## 4. Advanced Product Interaction Detection

Improve detection of:

* Product pickup
* Product return
* Product comparison
* Product placement changes

---

## 5. Advanced Recommendations

Expand retail recommendations for:

* Shelf placement
* Product positioning
* Promotional placement
* Store layout
* Consumer engagement

The project specification identifies shelf optimization, product placement, promotional placement, consumer engagement and layout recommendations as future optimization capabilities.

---

## 6. Executive Dashboard

Introduce a dedicated executive-level dashboard with:

* High-level KPIs
* Business trends
* Store comparisons
* Product rankings
* Strategic recommendations

---

## 7. Scalable Cloud Deployment

Scale the platform using cloud infrastructure such as:

* AWS
* Azure
* GPU-enabled processing
* Container orchestration
* Distributed video processing

---

## 8. Advanced Analytics

Future versions could introduce:

* Predictive analytics
* Customer segmentation
* Demand prediction
* Anomaly detection
* Advanced conversion modeling
* Campaign effectiveness analysis

---

# 🔒 Privacy & Responsible AI

Because the system analyzes customer video, responsible handling of visual data is important.

Recommended practices:

* Avoid unnecessary storage of raw video.
* Store only required analytics where possible.
* Use temporary processing data for customer journeys.
* Avoid exposing personally identifiable information.
* Apply access control to analytics.
* Secure uploaded videos and generated outputs.
* Define retention policies.
* Use anonymized identifiers for customer tracking.

---

# 📁 Suggested Project Structure

```text
AI_Consumer-Attention-Mapping-System/
│
├── backend/
│   ├── app/
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── analytics/
│   ├── production/
│   └── main.py
│
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── js/
│   └── styles/
│
├── models/
│   └── YOLO/
│
├── uploads/
│
├── outputs/
│
├── migrations/
│
├── tests/
│
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── .env.example
└── README.md
```


# 🔄 End-to-End System Workflow

```text
                 USER LOGIN
                     │
                     ▼
             ROLE VALIDATION
                     │
                     ▼
             SELECT WORKSPACE
                     │
                     ▼
              UPLOAD VIDEO
                     │
                     ▼
            VIDEO PREPROCESSING
                     │
                     ▼
             YOLOv8 DETECTION
                     │
                     ▼
              BYTETRACK TRACKING
                     │
                     ▼
            CUSTOMER MOVEMENT
                     │
                     ▼
          GAZE / ATTENTION ANALYSIS
                     │
                     ▼
          SHELF / ZONE ASSOCIATION
                     │
                     ▼
          PRODUCT ENGAGEMENT ANALYSIS
                     │
                     ▼
          BEHAVIORAL CLASSIFICATION
                     │
                     ▼
             DATA AGGREGATION
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
      LIVE       RETAIL      REPORTS
     INSIGHTS  INTELLIGENCE
          │          │          │
          └──────────┼──────────┘
                     ▼
              RETAIL DECISIONS
```

---

# 💡 Business Value

The system converts raw retail video into measurable consumer intelligence.

### Instead of:

> "Customers walk past this shelf frequently."

The system can provide:

> "Shelf A02 receives significantly higher attention and longer dwell time than neighboring shelves."

This allows retail teams to make data-driven decisions regarding:

* Product placement
* Shelf arrangement
* Store layout
* Product visibility
* Customer engagement
* Merchandising strategy

---

# 🎯 Project Outcomes

The project delivers an AI-powered retail analytics platform capable of:

* Detecting and tracking shoppers
* Measuring customer movement
* Measuring attention and dwell time
* Mapping attention to retail areas
* Analyzing shelf engagement
* Measuring product engagement
* Generating product attractiveness insights
* Producing customer, shelf and product reports
* Providing role-based dashboards
* Supporting video-based retail analytics
* Running through Docker
* Providing authenticated backend APIs

The original project specification defines the intended outcome as an AI-powered retail attention intelligence platform with shopper tracking, attention analysis, product/shelf engagement analytics, behavioral intelligence, dashboards, reporting, Docker deployment and end-to-end testing.

---

# 📌 Performance Goals

The platform is intended to support:

* Accurate customer detection
* Reliable multi-person tracking
* Accurate attention estimation
* Reliable dwell-time measurement
* Product/shelf engagement measurement
* Useful attention visualization
* Fast API responses
* Responsive dashboards
* Stable video processing

The project's quantitative goals focus on identifying highly attended products/shelves, measuring product engagement, improving merchandising decisions, understanding shopping journeys and maintaining stable video-analytics performance.

---

# 🤝 Development & Deployment

Development tools include:

* VS Code
* Git
* GitHub
* Postman
* Docker
* Docker Compose

The project can be developed locally and packaged into Docker containers for consistent deployment environments.

---

# 📜 Project Status

### Current Focus

* ✅ JWT authentication
* ✅ Role-based dashboards
* ✅ Customer detection/tracking pipeline
* ✅ YOLOv8 integration
* ✅ ByteTrack integration
* ✅ Gaze/attention analysis
* ✅ Shelf and zone analytics
* ✅ Live Insights
* ✅ Retail Intelligence
* ✅ Product attractiveness insights
* ✅ Customer Attention Report
* ✅ Shelf Performance Report
* ✅ Product Engagement Report
* ✅ PostgreSQL integration
* ✅ Docker-based deployment workflow

### Future Scope

* Advanced real-time multi-camera analytics
* Cross-camera tracking
* More advanced product interaction detection
* Predictive retail intelligence
* Advanced recommendation engine
* Cloud-scale video processing
* Executive-level analytics

---

# 👩‍💻 Author

**Parnika Chaudhari**

AI Consumer Attention Mapping System

---
