from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from datetime import datetime
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

from openpyxl import Workbook

from app.database import database


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# =========================================================
# GET ANALYTICS DATA
# =========================================================

async def get_latest_analytics():

    analytics = await database.analytics.find_one(
        sort=[
            ("created_at", -1)
        ]
    )

    if analytics:

        analytics["_id"] = str(
            analytics["_id"]
        )

    return analytics


# =========================================================
# CONSUMER ATTENTION REPORT DATA
# =========================================================

@router.get("/consumer-attention")
async def consumer_attention_report():

    analytics = await get_latest_analytics()

    if not analytics:

        return {
            "message": "No analytics data available",
            "data": None
        }

    return {
        "report_type": "Consumer Attention Report",
        "generated_at": datetime.utcnow(),

        "data": analytics
    }


# =========================================================
# SHELF PERFORMANCE REPORT
# =========================================================

@router.get("/shelf-performance")
async def shelf_performance_report():

    shelves = []

    cursor = database.shelves.find()

    async for shelf in cursor:

        shelf["_id"] = str(
            shelf["_id"]
        )

        shelves.append(
            shelf
        )

    return {
        "report_type": "Shelf Performance Report",

        "generated_at": datetime.utcnow(),

        "total_shelves": len(shelves),

        "shelves": shelves
    }


# =========================================================
# TRAFFIC REPORT
# =========================================================

@router.get("/traffic")
async def traffic_report():

    analytics = await get_latest_analytics()

    if not analytics:

        return {
            "message": "No analytics data available"
        }

    return {
        "report_type": "Traffic Report",

        "generated_at": datetime.utcnow(),

        "data": {
            "persons_detected": analytics.get(
                "persons_detected",
                0
            ),

            "frames_processed": analytics.get(
                "frames_processed",
                0
            ),

            "average_people": analytics.get(
                "average_people",
                0
            )
        }
    }


# =========================================================
# PDF EXPORT
# =========================================================

@router.get("/export/pdf")
async def export_pdf():

    analytics = await get_latest_analytics()

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4
    )

    elements = []

    styles = getSampleStyleSheet()

    title = Paragraph(
        "Consumer Attention Report",
        styles["Title"]
    )

    elements.append(title)

    elements.append(
        Spacer(
            1,
            20
        )
    )

    if analytics:

        data = [

            [
                "Metric",
                "Value"
            ],

            [
                "Frames Processed",
                str(
                    analytics.get(
                        "frames_processed",
                        0
                    )
                )
            ],

            [
                "Persons Detected",
                str(
                    analytics.get(
                        "persons_detected",
                        0
                    )
                )
            ],

            [
                "Average People",
                str(
                    analytics.get(
                        "average_people",
                        0
                    )
                )
            ],

            [
                "Attention Score",
                str(
                    analytics.get(
                        "attention_score",
                        0
                    )
                ) + "%"
            ],

            [
                "Attention Level",
                str(
                    analytics.get(
                        "attention_level",
                        "Unknown"
                    )
                )
            ]
        ]

    else:

        data = [

            [
                "Message",
                "No analytics data available"
            ]
        ]

    table = Table(
        data
    )

    table.setStyle(
        TableStyle(
            [

                (
                    "BACKGROUND",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        0
                    ),
                    colors.darkblue
                ),

                (
                    "TEXTCOLOR",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        0
                    ),
                    colors.white
                ),

                (
                    "GRID",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    1,
                    colors.grey
                ),

                (
                    "ALIGN",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    "CENTER"
                ),

                (
                    "PADDING",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    10
                )
            ]
        )
    )

    elements.append(
        table
    )

    document.build(
        elements
    )

    buffer.seek(
        0
    )

    return StreamingResponse(

        buffer,

        media_type="application/pdf",

        headers={

            "Content-Disposition":

            "attachment; filename=consumer_attention_report.pdf"
        }
    )


# =========================================================
# EXCEL EXPORT
# =========================================================

@router.get("/export/excel")
async def export_excel():

    analytics = await get_latest_analytics()

    workbook = Workbook()

    sheet = workbook.active

    sheet.title = "Consumer Attention"

    sheet.append(
        [
            "Metric",
            "Value"
        ]
    )

    if analytics:

        sheet.append(
            [
                "Frames Processed",

                analytics.get(
                    "frames_processed",
                    0
                )
            ]
        )

        sheet.append(
            [
                "Persons Detected",

                analytics.get(
                    "persons_detected",
                    0
                )
            ]
        )

        sheet.append(
            [
                "Average People",

                analytics.get(
                    "average_people",
                    0
                )
            ]
        )

        sheet.append(
            [
                "Attention Score",

                analytics.get(
                    "attention_score",
                    0
                )
            ]
        )

        sheet.append(
            [
                "Attention Level",

                analytics.get(
                    "attention_level",
                    "Unknown"
                )
            ]
        )

    else:

        sheet.append(
            [
                "Message",

                "No analytics data available"
            ]
        )

    buffer = BytesIO()

    workbook.save(
        buffer
    )

    buffer.seek(
        0
    )

    return StreamingResponse(

        buffer,

        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        headers={

            "Content-Disposition":

            "attachment; filename=consumer_attention_report.xlsx"
        }
    )