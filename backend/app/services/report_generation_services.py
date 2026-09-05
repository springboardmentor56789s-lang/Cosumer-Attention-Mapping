from typing import Iterable, Optional

from sqlalchemy.orm import Session

from app import model

REPORT_TYPES = (
    ("Consumer Attention Report", "consumer_attention"),
    ("Product Engagement Report", "product_engagement"),
    ("Shelf Performance Report", "shelf_performance"),
)

REPORT_TYPE_VALUES = frozenset(report_type for _, report_type in REPORT_TYPES)


def create_reports_for_video(
    db: Session,
    store_id: int,
    user_id: int,
    video_path: str,
    video_id: Optional[int] = None,
    camera_id: Optional[int] = None,
    analytics_ids: Optional[Iterable[int]] = None,
    customer_track_ids: Optional[Iterable[int]] = None,
    detection_ids: Optional[Iterable[int]] = None,
) -> list[model.Report]:


    created_reports: list[model.Report] = []


    if not store_id:
        raise ValueError("store_id is required.")

    if not user_id:
        raise ValueError("user_id is required.")

    if not video_path:
        raise ValueError("video_path is required.")


    filters = {
        "video_path": video_path,
    }

    if video_id is not None:
        filters["video_id"] = video_id
    if camera_id is not None:
        filters["camera_id"] = camera_id
    filters["analytics_ids"] = sorted({int(row_id) for row_id in analytics_ids or []})
    filters["customer_track_ids"] = sorted({int(row_id) for row_id in customer_track_ids or []})
    filters["detection_ids"] = sorted({int(row_id) for row_id in detection_ids or []})

    # Remove definitions for report categories no longer supported by Reports.
    db.query(model.Report).filter(
        model.Report.store_id == store_id,
        model.Report.created_by == user_id,
        ~model.Report.report_type.in_(REPORT_TYPE_VALUES),
    ).delete(synchronize_session=False)

    existing_reports = (
        db.query(model.Report)
        .filter(
            model.Report.store_id == store_id,
            model.Report.created_by == user_id,
        )
        .all()
    )

    existing_by_type: dict[str, model.Report] = {}

    for report in existing_reports:

        if report.report_type not in REPORT_TYPE_VALUES:
            continue

        # Check the stored video metadata.
        report_filters = report.filters or {}

        if report_filters.get("video_path") != video_path:
            continue

        existing = existing_by_type.get(report.report_type)
        if existing is None:
            existing_by_type[report.report_type] = report
        else:
            db.delete(report)


    for report_name, report_type in REPORT_TYPES:

        report = existing_by_type.get(report_type)
        if report is None:
            report = model.Report(
                store_id=store_id,
                report_name=report_name,
                report_type=report_type,
                filters=filters,
                file_path=None,
                created_by=user_id,
            )
            db.add(report)
        else:
            report.filters = filters
        created_reports.append(report)

 
    db.commit()
    for report in created_reports:
        db.refresh(report)

    return created_reports
