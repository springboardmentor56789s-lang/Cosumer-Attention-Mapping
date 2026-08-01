# Architecture — Consumer Attention Mapping System

> System design reference. For what the project is, setup, and tech stack, see `README.md`.

---

## 1. Layers & Data Flow

Data flows from physical cameras at the edge, through ingestion and AI inference, into storage, and out to dashboards/integrations.

```
DATA SOURCES  →  EDGE LAYER (store)  →  API GATEWAY (FastAPI)
(cameras, POS,     (pre-processing,      (routing, auth, rate
 product/promo      buffering, opt.       limiting, CORS,
 data)               edge inference,      logging, throttling)
                     encryption)
                            |
                            v
                  MICROSERVICES LAYER
     (see section 2 -- one service per module, independently
      deployable, communicating over the gateway)
                            |
                            v
        DATA PROCESSING & INTELLIGENCE LAYER
  Stream Ingestion (Kafka/RTSP) -> Frame Extraction ->
  Pre-processing -> AI Inference (detection/tracking/
  pose/gaze) -> Feature Extraction -> Behavior Modeling
  & Scoring -> Event Store
                            |
                            v
                       DATA LAYER
        (see section 3 -- polyglot persistence by data shape)
                            |
                            v
       EXTERNAL SERVICES & INTEGRATIONS
  (cloud storage, notifications, BI, identity provider,
   ERP/CRM/marketing platform integrations)
                            |
                            v
                  PRESENTATION LAYER
     Web dashboard . mobile app . reports . alerts
```

**Why this shape:** camera feeds are high-volume and store-local, so pre-processing happens at the edge before hitting the network. Everything downstream of the gateway is decoupled into single-purpose services so the AI/ML-heavy services (detection, tracking, scoring) can scale and deploy independently of, say, the dashboard or notification service.

**Communication patterns**

| Type | Used for |
|---|---|
| Synchronous (HTTP/HTTPS) | Gateway to microservices, dashboard to API |
| Asynchronous (Kafka) | Video stream ingestion, event processing |
| Data flow | Processing layer to data layer |
| External integration | Cloud storage, AI services, notifications |

---

## 2. Microservices & Responsibilities

| Service | Responsibility | Talks to |
|---|---|---|
| User & Access Management | Auth, JWT/OAuth2, RBAC, profiles | Gateway, Data layer |
| Store & Shelf Management | Store/shelf/zone/camera registry | Gateway, Data layer |
| Video Ingestion | Camera connectivity, stream routing, health checks | Edge layer, Processing layer |
| Consumer Detection & Tracking | Person detection, multi-object tracking, re-ID, entry/exit | Processing layer, Event store |
| Attention Analysis | Gaze estimation, head pose, dwell time, focus detection | Processing layer, Event store |
| Product Interaction | Pickup/return detection, shelf interaction events | Processing layer, Event store |
| Behavior Intelligence | Segmentation, journey/pattern analysis | Event store, Data warehouse |
| Heatmap Generation | Store/shelf/product/traffic heatmaps | Data warehouse |
| Attractiveness Scoring | Weighted scoring model (section 5) | Event store, Data warehouse |
| Recommendation & Optimization | Placement/layout suggestions from scoring output | Data warehouse |
| Analytics & Insights | KPI calc, trend/anomaly analysis | Data warehouse |
| Notification & Alert | Threshold-based alerts (visibility, traffic anomaly, camera health) | External notification services |

**Boundary rule of thumb:** detection/tracking/gaze services own *raw event production*; behavior/heatmap/scoring services own *aggregation and interpretation*; recommendation/analytics/dashboard services *consume* aggregated output only -- they don't touch raw video events directly.

---

## 3. Data Model — Store per Data Shape

| Store | Holds | Why this store |
|---|---|---|
| PostgreSQL | Users, Stores, Cameras, Shelves, Layouts, Configs | Relational integrity for core entities/config |
| MongoDB | Products, Categories, Campaigns, Metadata | Flexible schema for catalog-style data |
| TimescaleDB | Attention data, dwell time, traffic, zone time series, sensor data | High-write time-series workload |
| Redis | Session cache, real-time metrics, hot counters | Sub-ms reads for live dashboards |
| Data Warehouse (S3-backed) | Aggregated data, snapshots, trends, reports, heatmaps | Cheap storage for analytical/batch queries |
| Object Storage | Raw video, exports | Large binary blobs, not queried directly |
| Vector DB | Product/visual/layout embeddings | Similarity search (e.g. re-ID, product matching) |
| AI/ML Model Store | Trained models (detection, tracking, gaze, scoring) | Versioned model artifacts, separate from app data |

---

## 4. Key Design Decisions

- **Edge pre-processing, not edge-only inference (default assumption):** cameras stream to a store-local edge gateway for buffering/encryption before hitting the ingestion pipeline; heavy inference runs centrally unless a service explicitly needs low-latency edge inference. *(Confirm with team -- see open questions.)*
- **Event-sourced pipeline:** detection/tracking/attention services emit events into an event store rather than writing final aggregates directly -- this lets heatmap, scoring, and recommendation services be recomputed/replayed independently.
- **Polyglot persistence over one database:** relational for config/identity, time-series for high-frequency behavioral signals, document store for flexible catalog data, vector store for similarity search. Trade-off: more operational surface area, but each workload gets the right access pattern.
- **Microservices split by pipeline stage**, not by CRUD resource -- detection, attention, interaction, and behavior are separate services because they scale differently (GPU-bound vs. CPU-bound vs. lightweight aggregation).

---
