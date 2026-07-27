# Consumer Attention Mapping System

## Overview
The Consumer Attention Mapping System is an AI-powered retail intelligence platform that uses cameras, computer vision, and behavioral analytics to understand how shoppers interact with retail shelves, products, promotional displays, and store layouts. It analyzes attention patterns, gaze direction, dwell time, product engagement, and movement paths to help retailers optimize shelf placement, improve product visibility, increase conversion rates, and enhance in-store customer experiences.

The platform is designed for retail stores, supermarkets, shopping malls, FMCG companies, consumer brands, retail analytics teams, and marketing organizations.

## Architecture

The system follows a microservices architecture with the following layers:

- **Data Sources** — In-store cameras (IP/CCTV), depth cameras, POS systems, product master data, promotions/campaign data, and store layout/planogram data.
- **Edge Layer (Store Level)** — Edge gateway for local video pre-processing, buffering, optional encryption, and edge inference before data reaches the cloud.
- **API Gateway (FastAPI)** — Handles routing, authentication, rate limiting, request validation, load balancing, CORS, logging, and throttling.
- **Microservices Layer** — Independent services for user/access management, store & shelf management, video ingestion, consumer detection & tracking, attention analysis, product interaction, behavior intelligence, heatmap generation, attractiveness scoring, recommendation & optimization, analytics & insights, and notifications & alerts.
- **Data Processing & Intelligence Layer** — Stream ingestion (Kafka), video frame extraction, pre-processing, AI inference (detection, tracking, pose/gaze estimation), feature extraction, behavior modeling & scoring, and event correlation/storage.
- **Data Layer** — PostgreSQL (relational data: users, stores, products, shelves, configs), MongoDB (document data: campaigns, sessions), TimescaleDB (time-series metrics, dwell time, traffic), Redis (session/tracking cache), Data Warehouse (analytics, trends, reports), Object Storage (raw video, snapshots), Vector DB (embeddings for re-identification and similarity search), and AI/ML model storage.
- **External Services & Integrations** — Cloud storage (AWS S3/Azure Blob), external AI/ML services, notification services (FCM/SNS/SES), BI & visualization tools, identity providers (Azure AD/Okta), and integrations with ERP/inventory, CRM/loyalty systems, marketing platforms, and data warehouses.
- **Monitoring & Observability** — Application monitoring, model performance monitoring, stream health monitoring, error tracking/logging, alerting, and audit logs.
