# User Guide — Consumer Attention Mapping System

## 1. Roles & Permissions
- **Store Manager / Admin**: Full access to Executive Dashboard, Stores, Shelves, Video Upload & AI Analysis, Centralized Analytics, AI Copilot, Recommendations Engine, and Report Exporter. Can assign tasks to workers.
- **Worker / Store Staff**: Access restricted to Worker Dashboard, assigned task list, task details, status updating (Pending → In Progress → Completed), evidence photo upload, notifications, and profile.

## 2. End-to-End Workflow Scenario

### Step 1 — Manager Login & Authentication
Log in at `/auth/manager/login` using credentials or email/phone OTP verification code.

### Step 2 — Upload Surveillance Video
Navigate to **Cameras & Video Analysis Workspace** (`/video-analysis`). Drag & drop or browse a surveillance video file (.mp4, .avi, .mov). The system performs security validation and OpenCV integrity decoding.

### Step 3 — Run AI Processing Pipeline
Click **Start AI Video Analysis**. Watch real-time execution across 8 stages (Frame extraction, YOLOv8 detection, NMS suppression, ByteTrack tracking, Dwell computation, Gaze vector estimation, Heatmap rendering, and Report generation).

### Step 4 — Executive Analytics & Visualization Module
View Executive Dashboard KPIs (`/manager-dashboard`) and Centralized Visualization Module (`/analytics`). Apply multi-level filters (Store → Video → Date → Time Range → Zone → Shelf → Product) to update charts in real-time.

### Step 5 — AI Copilot Assistance
Open the AI Copilot widget on any page. Ask questions like:
> "Which shelf received the highest attention and why?"
> "What is the average dwell time in the beverage aisle?"

Copilot queries live database telemetry and responds with evidence-backed insights.

### Step 6 — Generate Reports & Assign Worker Tasks
1. Navigate to **Reports Workspace** (`/reports`) to view or export 5 evidence report types (.PDF, .TXT, .CSV, .JSON).
2. Go to **AI Recommendations** (`/recommendations`). Click **Assign Task to Worker** on any recommendation card.
3. Log in as Worker (`/auth/worker/login`). View assigned task on **Worker Dashboard** (`/worker-dashboard`), start task, upload completion photo, and mark completed.
