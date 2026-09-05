# API Documentation — Consumer Attention Mapping System

Base URL: `http://localhost:8000/api/v1`

## 1. Authentication & Authorization (`/auth`)
- `POST /auth/register`: Register new Manager or Worker user.
- `POST /auth/login`: Authenticate email & password, returns JWT access token.
- `POST /auth/send-otp`: Request 6-digit verification OTP via Email or SMS.
- `POST /auth/verify-otp`: Verify OTP code.
- `POST /auth/login-otp`: Log in using OTP verification.
- `POST /auth/logout`: Invalidate session.

## 2. Video Upload Security (`/video`)
- `POST /video/upload`: Upload video file (.mp4, .avi, .mov). Performs size check, format check, anti-malware check, and OpenCV decoding verification.

## 3. Executive Dashboard & Analytics (`/analytics`)
- `GET /analytics/dashboard`: Returns Executive KPI metrics (Total Shoppers, Dwell Time, Attention Events, Top Shelf, Top Product, Peak Traffic Period, Most Visited Zone, Overall Store Engagement).
- `GET /analytics/attention`: Category attention scores.
- `GET /analytics/traffic`: Footfall & peak traffic hours.
- `GET /analytics/products`: Top viewed and picked product metrics.
- `POST /analytics/process-video-frame`: Frame-level YOLO + ByteTrack detection & tracking.
- `GET /analytics/video-analysis-report`: Processed video summary & zone heatmaps.

## 4. Retail Intelligence & Behavior (`/intelligence`, `/behavior`)
- `GET /intelligence/{video_id}`: Consolidated retail intelligence summary.
- `GET /behavior/{video_id}`: Shopper trajectories, zone visits, and consumer segments.

## 5. Heatmaps & Product Scoring (`/heatmaps-v2`, `/products-v2`)
- `GET /heatmaps-v2/{video_id}`: Multi-layer movement, attention, and shelf heatmaps.
- `GET /products-v2/{video_id}/scores`: Weighted product attractiveness scores & rankings.

## 6. Recommendations & Task Queue (`/recommendations-v2`)
- `GET /recommendations-v2/{video_id}`: Active optimization recommendations with evidence.

## 7. AI Copilot (`/copilot`)
- `POST /copilot/chat`: Natural-language store analytics query endpoint.

## 8. Reports (`/reports`)
- `GET /reports/{video_id}`: 9-section evidence-backed report generator.
- `POST /reports/export`: PDF/TXT report generation.
