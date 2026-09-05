"""Dynamic report data derived from persisted pipeline analytics."""

from collections import defaultdict
from typing import Any, Optional

from sqlalchemy.orm import Session

from app import model


SUPPORTED_REPORT_TYPES = frozenset({
    "consumer_attention",
    "product_engagement",
    "shelf_performance",
})


def _round(value: float) -> float:
    return round(float(value or 0), 2)


def _analytics_rows(
    db: Session, store_id: int, filters: Optional[dict[str, Any]] = None
) -> list[model.Analytics]:
    query = db.query(model.Analytics).filter(model.Analytics.store_id == store_id)
    analytics_ids = (filters or {}).get("analytics_ids")
    if analytics_ids is not None:
        valid_ids = [int(value) for value in analytics_ids]
        return query.filter(model.Analytics.id.in_(valid_ids)).all() if valid_ids else []
    return query.all()


def _behaviour(row: model.Analytics) -> str:
    if float(row.attention_score or 0) >= 70:
        return "High interest"
    if row.looking_at_product:
        return "Product focus"
    if row.looking_at_shelf:
        return "Shelf attention"
    return "Passing"


def _chart(labels: list[str], datasets: list[dict[str, Any]]) -> dict[str, Any]:
    return {"labels": labels or ["No data"], "datasets": datasets}


def generate_consumer_attention_report(
    db: Session, store_id: int, filters: Optional[dict[str, Any]] = None
) -> dict[str, Any]:
    customers: dict[int, list[model.Analytics]] = defaultdict(list)
    for event in _analytics_rows(db, store_id, filters):
        customers[event.customer_id].append(event)

    rows = []
    for customer_id, events in sorted(customers.items()):
        attention_observations = [
            float(event.attention_score)
            for event in events
            if event.attention_score is not None
        ]
        average_attention = _round(
            sum(attention_observations) / len(attention_observations)
        ) if attention_observations else 0.0
        shelves = sorted({event.shelf_id for event in events if event.shelf_id is not None})
        representative_event = model.Analytics(
            attention_score=average_attention,
            looking_at_product=any(event.looking_at_product for event in events),
            looking_at_shelf=any(event.looking_at_shelf for event in events),
        )
        rows.append({
            "track_customer_id": customer_id,
            "average_attention_score": average_attention,
            "total_dwell_time": _round(sum(float(event.dwell_time or 0) for event in events)),
            "shelves_visited": ", ".join(str(shelf_id) for shelf_id in shelves) or "-",
            "behaviour": _behaviour(representative_event),
        })
    return {
        "report_type": "consumer_attention",
        "rows": rows,
        "charts": _chart(
            [str(row["track_customer_id"]) for row in rows],
            [
                {"label": "Average attention score", "data": [row["average_attention_score"] for row in rows], "kind": "line"},
                {"label": "Total dwell time", "data": [row["total_dwell_time"] for row in rows], "kind": "bar"},
            ],
        ),
    }


def generate_product_engagement_report(
    db: Session, store_id: int, filters: Optional[dict[str, Any]] = None
) -> dict[str, Any]:
    events_by_product: dict[str, list[model.Analytics]] = defaultdict(list)
    for event in _analytics_rows(db, store_id, filters):
        if event.viewed_product:
            events_by_product[event.viewed_product.lower()].append(event)

    rows = []
    for product in db.query(model.Product).filter(model.Product.store_id == store_id).all():
        events_by_id = {
            event.id: event
            for key in {product.sku.lower(), product.name.lower()}
            for event in events_by_product.get(key, [])
        }
        events = list(events_by_id.values())
        attention_events = [event for event in events if event.looking_at_product or event.looking_at_shelf]
        rows.append({
            "product_id": product.id,
            "product_name": product.name,
            "shelf_id": product.shelf_id,
            "customers_engaged": len({event.customer_id for event in attention_events}),
            "average_attention": _round(sum(event.attention_score or 0 for event in attention_events) / len(attention_events)) if attention_events else 0.0,
            "average_dwell_time": _round(sum(event.dwell_time or 0 for event in events) / len(events)) if events else 0.0,
        })
    return {
        "report_type": "product_engagement",
        "rows": rows,
        "charts": _chart(
            [row["product_name"] for row in rows],
            [
                {"label": "Customers engaged", "data": [row["customers_engaged"] for row in rows], "kind": "bar"},
                {"label": "Average attention", "data": [row["average_attention"] for row in rows], "kind": "line"},
            ],
        ),
    }


def generate_shelf_performance_report(
    db: Session, store_id: int, filters: Optional[dict[str, Any]] = None
) -> dict[str, Any]:
    analytics = _analytics_rows(db, store_id, filters)
    rows = []
    for shelf in db.query(model.Shelf).filter(model.Shelf.store_id == store_id).all():
        events = [event for event in analytics if event.shelf_id == shelf.id]
        attention_events = [event for event in events if event.looking_at_shelf or event.looking_at_product]
        rows.append({
            "shelf_id": shelf.id,
            "customers": len({event.customer_id for event in events}),
            "average_dwell_time": _round(sum(event.dwell_time or 0 for event in events) / len(events)) if events else 0.0,
            "attention_percent": _round(sum(event.attention_score or 0 for event in attention_events) / len(attention_events)) if attention_events else 0.0,
            "high_interest": sum(1 for event in attention_events if float(event.attention_score or 0) >= 70),
        })
    return {
        "report_type": "shelf_performance",
        "rows": rows,
        "charts": _chart(
            [str(row["shelf_id"]) for row in rows],
            [
                {"label": "Customers", "data": [row["customers"] for row in rows], "kind": "bar"},
                {"label": "Attention %", "data": [row["attention_percent"] for row in rows], "kind": "line"},
            ],
        ),
    }


GENERATORS = {
    "consumer_attention": generate_consumer_attention_report,
    "product_engagement": generate_product_engagement_report,
    "shelf_performance": generate_shelf_performance_report,
}


def get_dynamic_report_data(
    db: Session, report_type: str, store_id: int, filters: Optional[dict[str, Any]] = None
) -> dict[str, Any]:
    generator = GENERATORS.get(str(report_type or "").strip().lower())
    if generator is None:
        raise ValueError(f"Unsupported report type: {report_type}")
    return generator(db, store_id, filters)