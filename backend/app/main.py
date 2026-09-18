from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import os


# =========================================================
# DATABASE
# =========================================================

from app.database import database


# =========================================================
# ROUTERS
# =========================================================

from app.routers.users import router as user_router
from app.routers.stores import router as store_router
from app.routers.products import router as product_router
from app.routers.shelves import router as shelf_router
from app.routers.cameras import router as camera_router
from app.routers.videos import router as video_router

# ANALYTICS ROUTER
from app.routers.analytics import router as analytics_router

# =========================================================
# NEW ROUTERS
# =========================================================

# NOTIFICATIONS
from app.routers.notifications import router as notification_router

# REPORTS
from app.routers.reports import router as report_router


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Consumer Attention Mapping API",
    description="Backend API for Consumer Attention Mapping System",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://consumer-attention-mapping-shafiya.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# BASE DIRECTORY
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)


# =========================================================
# UPLOADS DIRECTORY
# =========================================================

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# =========================================================
# YOLO RUNS DIRECTORY
#
# Actual location:
#
# backend/
# └── app/
#     └── runs/
#         └── detect/
#
# =========================================================

DETECT_OUTPUT_FOLDER = os.path.join(
    BASE_DIR,
    "app",
    "runs",
    "detect"
)

os.makedirs(
    DETECT_OUTPUT_FOLDER,
    exist_ok=True
)


# =========================================================
# TRACKING VIDEO DIRECTORY
#
# Actual location:
#
# backend/
# └── app/
#     └── runs/
#         └── detect/
#             └── tracked_video/
#
# =========================================================

TRACKING_OUTPUT_FOLDER = os.path.join(
    DETECT_OUTPUT_FOLDER,
    "tracked_video"
)

os.makedirs(
    TRACKING_OUTPUT_FOLDER,
    exist_ok=True
)


# =========================================================
# HEATMAP DIRECTORY
#
# IMPORTANT:
#
# Actual heatmap location:
#
# backend/
# └── app/
#     └── heatmap-output/
#
# =========================================================

HEATMAP_OUTPUT_FOLDER = os.path.join(
    BASE_DIR,
    "app",
    "heatmap-output"
)

os.makedirs(
    HEATMAP_OUTPUT_FOLDER,
    exist_ok=True
)


# =========================================================
# STATIC FILES
# =========================================================


# ---------------------------------------------------------
# Original uploaded videos
#
# URL:
# http://127.0.0.1:8000/uploads/filename.mp4
# ---------------------------------------------------------

app.mount(
    "/uploads",
    StaticFiles(
        directory=UPLOAD_FOLDER
    ),
    name="uploads"
)


# ---------------------------------------------------------
# AI tracking output
#
# Actual file:
#
# backend/app/runs/detect/tracked_video/video.mp4
#
# URL:
#
# /tracking-output/video.mp4
# ---------------------------------------------------------

app.mount(
    "/tracking-output",
    StaticFiles(
        directory=TRACKING_OUTPUT_FOLDER
    ),
    name="tracking-output"
)


# ---------------------------------------------------------
# Heatmap output
#
# Actual file:
#
# backend/app/heatmap-output/video_heatmap.jpg
#
# URL:
#
# /heatmap-output/video_heatmap.jpg
# ---------------------------------------------------------

app.mount(
    "/heatmap-output",
    StaticFiles(
        directory=HEATMAP_OUTPUT_FOLDER
    ),
    name="heatmap-output"
)


# =========================================================
# API ROUTERS
# =========================================================


# ---------------------------------------------------------
# USERS
# ---------------------------------------------------------

app.include_router(
    user_router
)


# ---------------------------------------------------------
# STORES
# ---------------------------------------------------------

app.include_router(
    store_router
)


# ---------------------------------------------------------
# PRODUCTS
# ---------------------------------------------------------

app.include_router(
    product_router
)


# ---------------------------------------------------------
# SHELVES
# ---------------------------------------------------------

app.include_router(
    shelf_router
)


# ---------------------------------------------------------
# CAMERAS
# ---------------------------------------------------------

app.include_router(
    camera_router
)


# ---------------------------------------------------------
# VIDEOS
# ---------------------------------------------------------

app.include_router(
    video_router
)


# ---------------------------------------------------------
# ANALYTICS
# ---------------------------------------------------------

app.include_router(
    analytics_router
)


# ---------------------------------------------------------
# NOTIFICATIONS
# ---------------------------------------------------------

app.include_router(
    notification_router
)


# ---------------------------------------------------------
# REPORTS
# ---------------------------------------------------------

app.include_router(
    report_router
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
async def root():

    return {
        "message": "Consumer Attention Mapping API is running",
        "status": "success"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
async def health_check():

    return {
        "status": "healthy",
        "database": "connected"
    }


# =========================================================
# TRACKING VIDEO TEST
# =========================================================

@app.get("/tracking-output-status")
async def tracking_output_status():

    files = []

    if os.path.exists(
        TRACKING_OUTPUT_FOLDER
    ):

        for filename in os.listdir(
            TRACKING_OUTPUT_FOLDER
        ):

            file_path = os.path.join(
                TRACKING_OUTPUT_FOLDER,
                filename
            )

            if os.path.isfile(
                file_path
            ):

                files.append(
                    filename
                )

    return {
        "folder": TRACKING_OUTPUT_FOLDER,

        "exists": os.path.exists(
            TRACKING_OUTPUT_FOLDER
        ),

        "files": files
    }


# =========================================================
# HEATMAP OUTPUT TEST
# =========================================================

@app.get("/heatmap-output-status")
async def heatmap_output_status():

    files = []

    if os.path.exists(
        HEATMAP_OUTPUT_FOLDER
    ):

        for filename in os.listdir(
            HEATMAP_OUTPUT_FOLDER
        ):

            file_path = os.path.join(
                HEATMAP_OUTPUT_FOLDER,
                filename
            )

            if os.path.isfile(
                file_path
            ):

                files.append(
                    filename
                )

    return {
        "folder": HEATMAP_OUTPUT_FOLDER,

        "exists": os.path.exists(
            HEATMAP_OUTPUT_FOLDER
        ),

        "files": files
    }