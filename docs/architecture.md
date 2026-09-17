# System Architecture — Consumer Attention Mapping System

## Overview
The Consumer Attention Mapping System converts raw retail surveillance video feeds into real-time behavioral intelligence, spatial gaze heatmaps, product attractiveness scoring, automated merchandising recommendations, and interactive AI Copilot queries.

```text
                         ┌──────────────────┐
                         │     MANAGER      │
                         └────────┬─────────┘
                                  ↓
                         ┌──────────────────┐
                         │  React Frontend  │
                         │  Dashboards      │
                         │  AI Copilot      │
                         └────────┬─────────┘
                                  ↓
                         ┌──────────────────┐
                         │   FastAPI API    │
                         └────────┬─────────┘
                                  ↓
              ┌───────────────────┼───────────────────┐
              ↓                   ↓                   ↓
        Authentication       Analytics API       Copilot API
              ↓                   ↓                   ↓
              │             ┌─────┴─────┐        LLM + Tools
              │             ↓           ↓             │
              │          PostgreSQL   AI Engine       │
              │                         ↓             │
              │                 YOLO + ByteTrack      │
              │                         ↓             │
              │                Attention Engine       │
              │                         ↓             │
              │              Behavioral Engine        │
              │                         ↓             │
              │               Recommendation         │
              │                         ↓             │
              └─────────────────┬─────────────────────┘
                                ↓
                         Reports + Analytics
                                ↓
                           Docker / Cloud
```

## AI Pipeline Flow
1. **Video Ingestion & Security Validation**: Validates file format (.mp4, .avi, .mov), size limit (500MB), rejects script/executable files (.exe, .bat, .sh), and verifies video decode integrity with OpenCV.
2. **Shopper Detection**: YOLOv8 detects person and product objects with NMS bounding box suppression.
3. **Multi-Object Tracking**: ByteTrack maintains consistent person IDs across video frames with 2D Kalman motion vectors.
4. **Attention Analysis Engine**: Computes dwell time (`Exit - Entry`), gaze vector fixations, and repeat shelf visits.
5. **Behavioral Intelligence Engine**: Classifies shopper segments (Explorers, Quick Buyers, Comparison Shoppers, Impulse Buyers) and trajectory paths.
6. **Spatial Heatmap Engine**: Renders multi-layer 2D Gaussian heatmaps (Movement, Attention Fixation, Shelf Engagement).
7. **Product Intelligence Engine**: Computes weighted product attractiveness scores based on views, pickups, and gaze duration.
8. **Recommendation Engine**: Generates evidence-backed planogram and layout optimizations with confidence metrics.
9. **AI Retail Copilot**: Resolves natural language queries against real telemetry with zero hallucination guarantees.
10. **Executive Dashboard & Reports**: Provides high-level KPIs and generates downloadable evidence reports (.PDF, .TXT, .CSV, .JSON).
