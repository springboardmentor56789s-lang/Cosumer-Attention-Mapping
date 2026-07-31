# 🏗️ System Architecture

## Overview

The **AI Consumer Attention Mapping System** is a role-based intelligent retail analytics platform that leverages **Artificial Intelligence (AI)** and **Computer Vision** to analyze customer behavior inside retail stores. The system captures live video feeds from surveillance cameras, processes them using AI models, stores analytical insights in a centralized database, and presents actionable information through role-specific dashboards.

The architecture follows a modular multi-tier design consisting of five major layers:

- **Presentation Layer**
- **Backend API Layer**
- **AI Processing Layer**
- **Database Layer**
- **External Devices Layer**

---

## 🏛️ System Architecture

```text
                              ┌────────────────────────────┐
                              │      Retail Cameras        │
                              │     (IP/Web Cameras)       │
                              └─────────────┬──────────────┘
                                            │
                                            ▼
                    ┌────────────────────────────────────────────┐
                    │          AI Processing Layer               │
                    │────────────────────────────────────────────│
                    │ • Video Frame Extraction                  │
                    │ • Consumer Detection                      │
                    │ • Consumer Tracking                       │
                    │ • Attention Analysis                      │
                    │ • Heatmap Generation                      │
                    │ • Behaviour Analytics                     │
                    └──────────────┬─────────────────────────────┘
                                   │
                                   ▼
                    ┌────────────────────────────────────────────┐
                    │          Backend API Layer                 │
                    │────────────────────────────────────────────│
                    │ • Authentication                          │
                    │ • Authorization                           │
                    │ • User Management                         │
                    │ • Store Management                        │
                    │ • Camera Management                       │
                    │ • Analytics APIs                          │
                    │ • Reports & Notifications                 │
                    └──────────────┬─────────────────────────────┘
                                   │
                                   ▼
                    ┌────────────────────────────────────────────┐
                    │            Database Layer                  │
                    │────────────────────────────────────────────│
                    │ • Users                                   │
                    │ • Roles                                   │
                    │ • Stores                                  │
                    │ • Cameras                                 │
                    │ • Analytics                               │
                    │ • Reports                                 │
                    │ • Notifications                           │
                    │ • System Logs                             │
                    └──────────────┬─────────────────────────────┘
                                   │
                                   ▼
                    ┌────────────────────────────────────────────┐
                    │          Presentation Layer                │
                    │────────────────────────────────────────────│
                    │ • Admin Dashboard                         │
                    │ • Store Manager Dashboard                 │
                    │ • Retail Analyst Dashboard                │
                    │ • Marketing Manager Dashboard             │
                    └────────────────────────────────────────────┘
```

---

# 📋 Architecture Components

## 1️⃣ Presentation Layer

The Presentation Layer provides a responsive, user-friendly interface developed using **Next.js**, **React**, and **Tailwind CSS**. Users are redirected to role-specific dashboards after authentication.

### Admin Dashboard

- User Management
- Store Management
- Camera Management
- System Monitoring
- Platform Analytics
- Reports
- Activity Logs
- Notifications

### Store Manager Dashboard

- Store Overview
- Shelf Performance
- Camera Monitoring
- Heatmap Analysis
- Consumer Attention Metrics
- Daily Reports

### Retail Analyst Dashboard

- Consumer Behaviour Analysis
- Attention Heatmaps
- Product Engagement
- Customer Journey Analysis
- Zone Performance
- AI Insights

### Marketing Manager Dashboard

- Campaign Performance
- Product Visibility
- Customer Engagement
- Product Rankings
- Promotional Effectiveness
- Marketing Reports

---

## 2️⃣ Backend API Layer

The backend acts as the communication bridge between the frontend, AI engine, and database.

### Responsibilities

- JWT Authentication
- Role-Based Authorization
- CRUD Operations
- REST APIs
- Report Generation
- Notification Services
- Analytics APIs

---

## 3️⃣ AI Processing Layer

The AI layer processes surveillance video to generate customer analytics.

### Workflow

1. Capture live video stream
2. Extract video frames
3. Detect customers
4. Track customer movement
5. Calculate attention duration
6. Generate heatmaps
7. Analyze consumer behaviour
8. Store analytics in the database

### AI Outputs

- Consumer Detection
- Consumer Tracking
- Attention Score
- Dwell Time
- Heatmaps
- Product Interaction
- Behaviour Analytics
- AI Recommendations

---

## 4️⃣ Database Layer

Stores both operational and analytical data.

### Database Tables

- Users
- Roles
- Stores
- Cameras
- Analytics
- Reports
- Notifications
- System Logs

---

## 5️⃣ External Devices Layer

Retail surveillance cameras capture live video streams used for AI processing.

### Responsibilities

- Video Capture
- Customer Monitoring
- Real-time Data Collection
- AI Input Source

---

# 🔐 Authentication Flow

```text
User Login
     │
     ▼
Authentication
     │
     ▼
JWT Token Generated
     │
     ▼
Role Validation
     │
     ▼
Role-Based Dashboard
```

---

# 🔄 Data Flow

```text
Retail Cameras
      │
      ▼
Video Frames
      │
      ▼
AI Processing
      │
      ▼
Analytics Generation
      │
      ▼
Database
      │
      ▼
Backend APIs
      │
      ▼
Role-Based Dashboards
```

---

# 💻 Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT |
| AI & Computer Vision | Python, OpenCV, YOLO |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel (Frontend), Render/Railway (Backend) |

---

# ✨ Key Features

- Secure JWT Authentication
- Role-Based Access Control (RBAC)
- Multi-Store Management
- Camera Monitoring
- AI Consumer Attention Analysis
- Heatmap Visualization
- Behaviour Analytics
- Interactive Dashboards
- Exportable Reports
- Notifications & Activity Logs
- Responsive Enterprise UI

---

# 📈 Scalability

The modular architecture enables:

- Multiple retail stores
- Multiple surveillance cameras
- Future AI model integration
- Cloud deployment
- Additional analytics modules
- Business Intelligence integration

---

# 🔒 Security

- JWT Authentication
- Protected API Routes
- Role-Based Authorization
- Secure Password Hashing
- Input Validation
- Audit Logging
- Session Management

---