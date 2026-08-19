"""Data builders for the five supported video-analysis reports."""

from collections import Counter, defaultdict
from datetime import datetime
from typing import Any, Optional

from sqlalchemy.orm import Session

from app import model

SUPPORTED_REPORT_TYPES = frozenset({
    "consumer_attention", "product_engagement", "shelf_performance",
    "conversion", "marketing_effectiveness",
})


def _round(value: float) -> float:
    return round(float(value or 0), 2)


def _rate(part: int | float, whole: int | float) -> float:
    return _round(100 * part / whole) if whole else 0.0


def _timestamp(value: Any) -> str | None:
    return value.isoformat() if isinstance(value, datetime) else None


def _scoped_rows(query: Any, column: Any, filters: dict[str, Any], key: str) -> list[Any]:
    if key in filters:
        row_ids = [int(row_id) for row_id in filters.get(key) or []]
        return query.filter(column.in_(row_ids)).all() if row_ids else []
    return query.all()


def _context(db: Session, store_id: int, report_filters: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    filters = report_filters or {}
    analytics = _scoped_rows(
        db.query(model.Analytics).filter(model.Analytics.store_id == store_id),
        model.Analytics.id,
        filters,
        "analytics_ids",
    )
    tracks = _scoped_rows(
        db.query(model.CustomerTrack).filter(model.CustomerTrack.store_id == store_id),
        model.CustomerTrack.id,
        filters,
        "customer_track_ids",
    )
    detections = _scoped_rows(
        db.query(model.Detection).filter(model.Detection.store_id == store_id),
        model.Detection.id,
        filters,
        "detection_ids",
    )
    shelves = db.query(model.Shelf).filter(model.Shelf.store_id == store_id).all()
    products = db.query(model.Product).filter(model.Product.store_id == store_id).all()
    heatmaps_query = db.query(model.Heatmap).filter(model.Heatmap.store_id == store_id)
    if filters.get("camera_id") is not None:
        heatmaps_query = heatmaps_query.filter(model.Heatmap.camera_id == int(filters["camera_id"]))
    heatmaps = heatmaps_query.all()
    customers = {row.customer_id for row in analytics + tracks if row.customer_id is not None}
    customers.update(
        row.track_id for row in detections
        if row.track_id is not None and str(row.detected_class or "").lower() == "person"
    )
    product_events = [row for row in analytics if row.viewed_product]
    gaze_rows = [row for row in analytics if row.looking_at_shelf or row.looking_at_product]
    engaged_customers = set()
    for row in analytics + tracks:
        product = getattr(row, "viewed_product", None) or getattr(row, "product_viewed", None)
        if row.customer_id is not None and (row.looking_at_shelf or row.looking_at_product or product):
            engaged_customers.add(row.customer_id)
    return locals()


def _chart(labels: list[Any], label: str, data: list[Any], kind: str = "bar", second: tuple[str, list[Any], str] | None = None) -> dict[str, Any]:
    datasets = [{"label": label, "data": data, "kind": kind}]
    if second:
        datasets.append({"label": second[0], "data": second[1], "kind": second[2]})
    return {"labels": labels or ["No data"], "datasets": datasets}


def _heatmap_rows(heatmaps: list[model.Heatmap]) -> list[dict[str, Any]]:
    return [{"shelf_id": item.shelf_id, "coordinates": item.coordinates or {}, "heatmap_type": item.heatmap_type} for item in heatmaps]


def _customer_entity_rows(c: dict[str, Any]) -> list[dict[str, Any]]:
    by_customer: dict[int, dict[str, Any]] = defaultdict(dict)
    for row in c["analytics"]:
        customer_id = row.customer_id
        record = by_customer.setdefault(
            customer_id,
            {
                "customer_id": customer_id,
                "visits": 0,
                "viewed_products": set(),
                "shelf_ids": set(),
                "total_dwell_time": 0.0,
                "total_attention_score": 0.0,
                "gaze_samples": 0,
                "shelf_attention_time": 0.0,
                "product_focus_time": 0.0,
                "looked_at_shelf_count": 0,
                "looked_at_product_count": 0,
                "last_timestamp": None,
            },
        )
        record["visits"] += 1
        record["viewed_products"].add(row.viewed_product)
        if row.shelf_id is not None:
            record["shelf_ids"].add(row.shelf_id)
        record["total_dwell_time"] += float(row.dwell_time or 0)
        if row.looking_at_shelf or row.looking_at_product:
            record["total_attention_score"] += float(row.attention_score or 0)
            record["gaze_samples"] += 1
        record["shelf_attention_time"] += float(row.dwell_time or 0) if row.looking_at_shelf else 0.0
        record["product_focus_time"] += float(row.dwell_time or 0) if row.looking_at_product else 0.0
        record["looked_at_shelf_count"] += 1 if row.looking_at_shelf else 0
        record["looked_at_product_count"] += 1 if row.looking_at_product else 0
        if row.visit_time is not None:
            current = record["last_timestamp"]
            if current is None or row.visit_time > current:
                record["last_timestamp"] = row.visit_time

    rows = []
    for customer_id in sorted(by_customer):
        record = by_customer[customer_id]
        rows.append({
            "customer_id": customer_id,
            "visits": record["visits"],
            "shelf_ids": sorted(filter(None, record["shelf_ids"])),
            "products_viewed": sorted(filter(None, record["viewed_products"])),
            "dwell_time": _round(record["total_dwell_time"]),
            "average_attention_score": _round(record["total_attention_score"] / record["gaze_samples"]) if record["gaze_samples"] else None,
            "shelf_attention_time": _round(record["shelf_attention_time"]),
            "product_focus_time": _round(record["product_focus_time"]),
            "looked_at_shelf_count": record["looked_at_shelf_count"],
            "looked_at_product_count": record["looked_at_product_count"],
            "last_seen": _timestamp(record["last_timestamp"]),
        })
    return rows


def _shelf_entity_rows(c: dict[str, Any]) -> list[dict[str, Any]]:
    shelf_products = Counter(product.shelf_id for product in c["products"] if product.shelf_id is not None)
    rows = []
    for shelf in c["shelves"]:
        events = [row for row in c["analytics"] if row.shelf_id == shelf.id]
        visitors = {row.customer_id for row in events}
        attention = sum(float(row.dwell_time or 0) for row in events if row.looking_at_shelf)
        product_views = sum(1 for row in events if row.viewed_product)
        engaged = sum(1 for row in events if row.looking_at_shelf or row.looking_at_product)
        rows.append({
            "shelf_id": shelf.id,
            "zone_id": shelf.zone_id,
            "shelf_name": shelf.shelf_name,
            "shelf_number": shelf.shelf_number,
            "number_of_visitors": len(visitors),
            "visitor_customer_ids": sorted(visitors),
            "shelf_attention_time": _round(attention),
            "product_views": product_views,
            "products_on_shelf": shelf_products.get(shelf.id, 0),
            "product_pickups": 0,
            "shelf_engagement_rate": _rate(engaged, len(events)) if events else 0.0,
            "shelf_visibility_score": _rate(
                sum(float(row.attention_score or 0) for row in events if row.looking_at_shelf or row.looking_at_product),
                sum(1 for row in events if row.looking_at_shelf or row.looking_at_product) * 100,
            ) if any(row.looking_at_shelf or row.looking_at_product for row in events) else None,
            "shelf_attractiveness_score": _rate(len(visitors), len(c["customers"])) if c["customers"] else 0.0,
            "is_zero_traffic": not events,
        })
    return rows


def _product_entity_rows(c: dict[str, Any]) -> list[dict[str, Any]]:
    product_rows = {}
    for product in c["products"]:
        product_rows[product.sku] = {
            "product_id": product.sku,
            "product_name": product.name,
            "sku": product.sku,
            "shelf_id": product.shelf_id,
            "category": product.category,
            "product_views": 0,
            "visits": 0,
            "unique_customers": set(),
            "engaged_customers": set(),
            "engagement_score": 0.0,
            "dwell_time": 0.0,
            "attention_score": 0.0,
            "is_zero_engagement": True,
        }

    for row in c["analytics"]:
        sku = row.viewed_product or "UNSPECIFIED_PRODUCT"
        entry = product_rows.setdefault(
            sku,
            {
                "product_id": sku,
                "product_name": row.viewed_product or sku,
                "sku": sku,
                "shelf_id": row.shelf_id,
                "category": "Uncategorized",
                "product_views": 0,
                "visits": 0,
                "unique_customers": set(),
                "engaged_customers": set(),
                "engagement_score": 0.0,
                "dwell_time": 0.0,
                "attention_score": 0.0,
                "is_zero_engagement": True,
            },
        )
        entry["product_views"] += 1
        entry["visits"] += 1
        entry["unique_customers"].add(row.customer_id)
        if row.looking_at_product or row.looking_at_shelf:
            entry["engaged_customers"].add(row.customer_id)
        entry["dwell_time"] += float(row.dwell_time or 0)
        entry["attention_score"] += float(row.attention_score or 0)
        entry["engagement_score"] += float(row.attention_score or 0)
        entry["is_zero_engagement"] = False

    product_keys = {
        value.lower(): sku
        for sku, entry in product_rows.items()
        for value in (sku, str(entry["product_name"]))
    }
    for detection in c["detections"]:
        detected_name = str(detection.detected_class or "").strip()
        if not detected_name or detected_name.lower() == "person":
            continue
        sku = product_keys.get(detected_name.lower(), f"detected:{detected_name.lower()}")
        entry = product_rows.setdefault(
            sku,
            {
                "product_id": sku,
                "product_name": detected_name,
                "sku": sku,
                "shelf_id": detection.shelf_id,
                "category": "Detected",
                "product_views": 0,
                "visits": 0,
                "unique_customers": set(),
                "engaged_customers": set(),
                "engagement_score": 0.0,
                "dwell_time": 0.0,
                "attention_score": 0.0,
                "is_zero_engagement": True,
            },
        )
        entry["product_views"] += 1
        if detection.track_id is not None:
            entry["unique_customers"].add(detection.track_id)

    rows = []
    for sku in sorted(product_rows):
        entry = product_rows[sku]
        product_views = entry["product_views"]
        rows.append({
            "product_id": entry["product_id"],
            "product_name": entry["product_name"],
            "sku": entry["sku"],
            "shelf_id": entry.get("shelf_id"),
            "category": entry.get("category"),
            "product_views": product_views,
            "visits": entry["visits"],
            "unique_customers": len(entry["unique_customers"]),
            "engaged_customers": len(entry["engaged_customers"]),
            "engagement_rate": _rate(len(entry["engaged_customers"]), len(entry["unique_customers"])) if entry["unique_customers"] else 0.0,
            "dwell_time": _round(entry["dwell_time"]),
            "attention_score": _round(entry["attention_score"]),
            "engagement_score": _round(entry["engagement_score"]),
            "is_zero_engagement": entry["is_zero_engagement"],
        })
    return rows


def generate_consumer_attention_report(db: Session, store_id: int, report_filters: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    c = _context(db, store_id, report_filters)
    rows = sorted(c["analytics"], key=lambda r: r.visit_time or datetime.min)
    gaze_available = bool(c["gaze_rows"])
    attention_durations = [float(r.dwell_time or 0) for r in c["gaze_rows"]]
    dwell = [float(r.dwell_time or 0) for r in rows]
    shelf_time = sum(float(r.dwell_time or 0) for r in c["gaze_rows"] if r.looking_at_shelf)
    product_time = sum(float(r.dwell_time or 0) for r in c["gaze_rows"] if r.looking_at_product)
    repeated = sum(count - 1 for count in Counter((r.customer_id, r.viewed_product) for r in rows if r.viewed_product).values() if count > 1)
    by_product_shelf = defaultdict(list)
    for r in rows:
        if r.viewed_product or r.shelf_id is not None:
            by_product_shelf[(r.viewed_product or "Unidentified product", r.shelf_id)].append(float(r.attention_score or 0))
    details = [{"product": p, "shelf_id": s, "attention_score": _round(sum(scores) / len(scores))} for (p, s), scores in sorted(by_product_shelf.items(), key=lambda item: sum(item[1]), reverse=True)[:25]]
    customer_rows = _customer_entity_rows(c)
    recorded_customer_ids = {row["customer_id"] for row in customer_rows}
    customer_rows.extend(
        {"customer_id": customer_id, "visits": 0, "viewed_products": [], "shelf_ids": [], "dwell_time": 0.0,
         "average_attention_score": None, "shelf_attention_time": 0.0, "product_focus_time": 0.0,
         "looked_at_shelf_count": 0, "looked_at_product_count": 0, "last_seen": None}
        for customer_id in sorted(c["customers"] - recorded_customer_ids)
    )
    table_rows = [{"customer_id": r.customer_id, "product": r.viewed_product or "-", "shelf_id": r.shelf_id, "attention_duration": _round(r.dwell_time), "attention_score": _round(r.attention_score) if (r.looking_at_shelf or r.looking_at_product) else None, "timestamp": _timestamp(r.visit_time)} for r in rows[:100]]
    return {"report_type": "consumer_attention", "summary": {
        "total_shoppers_analyzed": len(c["customers"]), "average_attention_duration": _round(sum(attention_durations) / len(attention_durations)) if attention_durations else 0,
        "average_dwell_time": _round(sum(dwell) / len(dwell)) if dwell else 0, "shelf_attention_time": _round(shelf_time),
        "product_focus_duration": _round(product_time), "repeated_attention_events": repeated, "gaze_estimation_available": gaze_available,
    }, "attention_trend_over_time": [{"timestamp": _timestamp(r.visit_time), "attention_duration": _round(r.dwell_time)} for r in c["gaze_rows"]],
        "attention_heatmap": _heatmap_rows(c["heatmaps"]), "attention_score_by_product_shelf": details, "rows": customer_rows or table_rows,
        "charts": _chart([_timestamp(r.visit_time) for r in c["gaze_rows"][:30]], "Attention duration", [_round(r.dwell_time) for r in c["gaze_rows"][:30]], "line", ("Attention score", [_round(r.attention_score) for r in c["gaze_rows"][:30]], "line"))}


def generate_product_engagement_report(db: Session, store_id: int, report_filters: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    c = _context(db, store_id, report_filters)
    views = Counter(r.viewed_product for r in c["analytics"] if r.viewed_product)
    products_viewed = len(views)
    rows = _product_entity_rows(c)
    summary_rows = [{"product_id": row["product_id"], "product_name": row["product_name"], "product_views": row["product_views"], "unique_customers": row["unique_customers"], "engagement_rate": row["engagement_rate"], "is_zero_engagement": row["is_zero_engagement"]} for row in rows]
    return {"report_type": "product_engagement", "summary": {"registered_or_detected_products": len(rows), "products_with_recorded_views": products_viewed, "engagement_rate": _rate(len(c["engaged_customers"]), len(c["customers"])), "pickup_purchase_data_available": False}, "rows": summary_rows, "charts": _chart([r["product_name"] for r in summary_rows], "Recorded product views", [r["product_views"] for r in summary_rows])}


def generate_shelf_performance_report(db: Session, store_id: int, report_filters: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    c = _context(db, store_id, report_filters)
    shelf_products = Counter(p.shelf_id for p in c["products"])
    rows = _shelf_entity_rows(c)
    return {"report_type": "shelf_performance", "summary": {"shelf_attention_time": _round(sum(r["shelf_attention_time"] for r in rows)), "number_of_visitors": len(c["customers"]), "products_on_shelf": len(c["products"]), "product_views": sum(r["product_views"] for r in rows), "shelf_engagement_rate": _rate(sum(1 for r in c["analytics"] if r.looking_at_shelf or r.looking_at_product), len(c["analytics"])) if c["analytics"] else 0.0, "shelf_visibility_score": _rate(sum(float(r.attention_score or 0) for r in c["analytics"]), len(c["analytics"]) * 100) if c["analytics"] else 0.0, "shelf_attractiveness_score": _rate(sum(r["number_of_visitors"] for r in rows), len(c["customers"]) * max(len(rows), 1)) if c["customers"] else 0.0}, "shelf_heatmap": _heatmap_rows(c["heatmaps"]), "rows": [{"shelf_id": r["shelf_id"], "shelf": r["shelf_name"], "shelf_attention_time": r["shelf_attention_time"], "number_of_visitors": r["number_of_visitors"], "products_on_shelf": r["products_on_shelf"], "product_views": r["product_views"], "shelf_engagement_rate": r["shelf_engagement_rate"], "shelf_visibility_score": r["shelf_visibility_score"], "shelf_attractiveness_score": r["shelf_attractiveness_score"], "is_zero_traffic": r["is_zero_traffic"]} for r in rows], "charts": _chart([r["shelf_name"] for r in rows], "Shelf attention time", [r["shelf_attention_time"] for r in rows], "bar", ("Shelf engagement rate", [r["shelf_engagement_rate"] for r in rows], "bar"))}


def generate_conversion_report(db: Session, store_id: int, report_filters: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    c = _context(db, store_id, report_filters)
    return {"report_type": "conversion", "summary": {"data_available": False, "reason": "No pickup or purchase events are recorded for this video."}, "product_wise_conversion": [], "shelf_wise_conversion": [], "conversion_trend": [], "rows": [], "charts": _chart([], "Conversion rate", [], "line")}


def generate_marketing_effectiveness_report(db: Session, store_id: int, report_filters: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    _context(db, store_id, report_filters)
    return {"report_type": "marketing_effectiveness", "summary": {"data_available": False, "reason": "No campaign or promotional-display events are recorded for this video."}, "rows": [], "charts": _chart([], "Marketing effectiveness", [], "bar")}


GENERATORS = {
    "consumer_attention": generate_consumer_attention_report,
    "product_engagement": generate_product_engagement_report,
    "shelf_performance": generate_shelf_performance_report,
    "conversion": generate_conversion_report,
    "marketing_effectiveness": generate_marketing_effectiveness_report,
}


def generate_consumer_attention_report(db: Session, store_id: int, report_filters: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    c = _context(db, store_id, report_filters)
    return {
        "report_type": "consumer_attention",
        "rows": [
            {
                "customer_id": row.customer_id,
                "shelf": row.shelf_id,
                "product_viewed": row.viewed_product or "-",
                "dwell_time": _round(row.dwell_time),
                "attention_score": _round(row.attention_score),
            }
            for row in sorted(c["analytics"], key=lambda item: item.visit_time or datetime.min)
        ],
    }


def generate_product_engagement_report(db: Session, store_id: int, report_filters: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    c = _context(db, store_id, report_filters)
    return {
        "report_type": "product_engagement",
        "rows": [
            {
                "customer_id": row.customer_id,
                "product_sku_name": row.viewed_product or "-",
                "interaction_time": _round(row.dwell_time),
                "pick_up": False,
                "put_back": False,
                "engagement_score": _round(row.attention_score) if (row.looking_at_shelf or row.looking_at_product) else 0.0,
            }
            for row in sorted(c["analytics"], key=lambda item: item.visit_time or datetime.min)
            if row.viewed_product or row.looking_at_product
        ],
    }


def generate_shelf_performance_report(db: Session, store_id: int, report_filters: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    c = _context(db, store_id, report_filters)
    rows = []
    for shelf in c["shelves"]:
        events = [row for row in c["analytics"] if row.shelf_id == shelf.id]
        visits = {row.customer_id for row in events}
        interactions = [row for row in events if row.looking_at_shelf or row.looking_at_product]
        rows.append({
            "shelf_id": shelf.id,
            "visits": len(visits),
            "dwell_time": _round(sum(float(row.dwell_time or 0) for row in events)),
            "interactions": len(interactions),
            "performance_score": _round(
                sum(float(row.attention_score or 0) for row in interactions) / len(interactions)
            ) if interactions else 0.0,
        })
    return {"report_type": "shelf_performance", "rows": rows}


def generate_conversion_report(db: Session, store_id: int, report_filters: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    c = _context(db, store_id, report_filters)
    return {
        "report_type": "conversion",
        "rows": [
            {
                "customer_id": row.customer_id,
                "product_sku_name": row.viewed_product or "-",
                "viewed": bool(row.viewed_product),
                "interacted": bool(row.looking_at_shelf or row.looking_at_product),
                "pick_up": False,
                "purchase": False,
                "conversion": False,
            }
            for row in sorted(c["analytics"], key=lambda item: item.visit_time or datetime.min)
        ],
    }


def generate_marketing_effectiveness_report(db: Session, store_id: int, report_filters: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    c = _context(db, store_id, report_filters)
    by_product: dict[str, list[Any]] = defaultdict(list)
    for row in c["analytics"]:
        if row.viewed_product:
            by_product[row.viewed_product].append(row)
    rows = []
    for product, events in sorted(by_product.items()):
        attention_events = [row for row in events if row.looking_at_shelf or row.looking_at_product]
        interactions = [row for row in events if row.looking_at_product]
        rows.append({
            "campaign": "Video Analysis",
            "product": product,
            "exposure": len(events),
            "attention": len(attention_events),
            "interaction": len(interactions),
            "conversion": 0,
            "uplift": 0.0,
        })
    return {"report_type": "marketing_effectiveness", "rows": rows}


GENERATORS = {
    "consumer_attention": generate_consumer_attention_report,
    "product_engagement": generate_product_engagement_report,
    "shelf_performance": generate_shelf_performance_report,
    "conversion": generate_conversion_report,
    "marketing_effectiveness": generate_marketing_effectiveness_report,
}


def get_dynamic_report_data(
    db: Session,
    report_type: str,
    store_id: int,
    report_filters: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    normalized_type = str(report_type or "").strip().lower()
    generator = GENERATORS.get(normalized_type)
    if not generator:
        raise ValueError(f"Unsupported report type: {normalized_type}")
    return generator(db, store_id, report_filters or {})
