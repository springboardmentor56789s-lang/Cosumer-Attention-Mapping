from collections import Counter
from datetime import date, datetime, timedelta
from typing import Any, Dict, List

from sqlalchemy import func
from sqlalchemy.orm import Session

from app import model


class ProductionAnalyticsService:
    def get_dashboard_summary(self, db: Session) -> Dict[str, Any]:
        total_stores = db.query(model.Store).filter(model.Store.is_live_store.is_(True)).count()
        total_users = db.query(model.User).count()
        total_cameras = db.query(model.Camera).count()
        total_products = db.query(model.Product).count()
        total_shelves = db.query(model.Shelf).count()

        today = date.today()
        analytics = db.query(model.Analytics)
        today_records = analytics.filter(func.date(model.Analytics.visit_time) == today).all()
        current_records = analytics.filter(model.Analytics.visit_time >= datetime.utcnow() - timedelta(minutes=15)).all()

        todays_visitors = len({record.customer_id for record in today_records if record.customer_id is not None})
        current_visitors = len({record.customer_id for record in current_records if record.customer_id is not None})

        dwell_values = [record.dwell_time for record in today_records if record.dwell_time is not None]
        attention_values = [record.attention_score for record in today_records if record.attention_score is not None]

        avg_dwell_time = round(sum(dwell_values) / len(dwell_values), 2) if dwell_values else 0.0
        avg_attention_score = round(sum(attention_values) / len(attention_values), 2) if attention_values else 0.0

        product_counts = Counter(record.viewed_product for record in today_records if record.viewed_product)
        most_viewed_product = product_counts.most_common(1)[0][0] if product_counts else "No activity"
        least_viewed_product = product_counts.most_common()[-1][0] if product_counts else "No activity"

        shelf_counts = Counter(record.shelf_id for record in today_records if record.shelf_id is not None)
        if shelf_counts:
            shelf_id = max(shelf_counts.items(), key=lambda item: item[1])[0]
            shelf_name = db.query(model.Shelf).filter(model.Shelf.id == shelf_id).first()
            most_viewed_shelf = shelf_name.shelf_name if shelf_name else f"Shelf {shelf_id}"
        else:
            most_viewed_shelf = "No activity"

        hourly_counts = Counter(record.visit_time.hour for record in today_records if record.visit_time)
        peak_shopping_hour = max(hourly_counts.items(), key=lambda item: item[1])[0] if hourly_counts else 0

        camera_states = db.query(model.Camera).all()
        active_cameras = sum(1 for camera in camera_states if camera.status == "Online")

        return {
            "total_stores": total_stores,
            "total_users": total_users,
            "total_cameras": total_cameras,
            "total_products": total_products,
            "total_shelves": total_shelves,
            "todays_visitors": todays_visitors,
            "current_visitors": current_visitors,
            "avg_attention_score": round(avg_attention_score, 2),
            "avg_dwell_time_mins": round(avg_dwell_time, 2),
            "peak_shopping_hour": f"{peak_shopping_hour:02d}:00",
            "most_viewed_product": most_viewed_product,
            "least_viewed_product": least_viewed_product,
            "most_viewed_shelf": most_viewed_shelf,
            "active_ai_cameras": active_cameras,
            "product_engagement_score": round(avg_attention_score, 2),
            "attention_focus": "High" if avg_attention_score >= 70 else "Medium" if avg_attention_score >= 40 else "Low",
            "camera_status": {"online": active_cameras, "offline": max(total_cameras - active_cameras, 0)},
        }

    def get_dashboard_series(self, db: Session) -> Dict[str, Any]:
        analytics = db.query(model.Analytics).order_by(model.Analytics.visit_time.asc()).all()
        hourly = Counter(record.visit_time.hour for record in analytics if record.visit_time)
        daily = Counter(record.visit_time.strftime("%Y-%m-%d") for record in analytics if record.visit_time)
        weekly = Counter((record.visit_time.strftime("%Y-W%U")) for record in analytics if record.visit_time)
        monthly = Counter(record.visit_time.strftime("%Y-%m") for record in analytics if record.visit_time)

        attention_distribution = {
            "0-20": 0,
            "21-40": 0,
            "41-60": 0,
            "61-80": 0,
            "81-100": 0,
        }
        for record in analytics:
            if record.attention_score is None:
                continue
            score = float(record.attention_score)
            if score <= 20:
                attention_distribution["0-20"] += 1
            elif score <= 40:
                attention_distribution["21-40"] += 1
            elif score <= 60:
                attention_distribution["41-60"] += 1
            elif score <= 80:
                attention_distribution["61-80"] += 1
            else:
                attention_distribution["81-100"] += 1

        cameras = db.query(model.Camera).all()
        camera_series = [
            {"name": camera.camera_name or f"Camera {camera.id}", "status": camera.status, "fps": camera.fps or 0.0}
            for camera in cameras
        ]

        product_rows = []
        for product in db.query(model.Product).all():
            records = [record for record in analytics if record.viewed_product == product.name]
            product_rows.append({
                "name": product.name,
                "sku": product.sku,
                "views": len(records),
                "attention": round(sum(r.attention_score or 0 for r in records) / len(records), 2) if records else 0.0,
                "dwell_time": round(sum(float(r.dwell_time or 0) for r in records) / len(records), 2) if records else 0.0,
                "engagement": round(
                    sum(1 for r in records if r.looking_at_shelf or r.looking_at_product) * 100 / len(records), 2
                ) if records else 0.0,
            })

        shelf_rows = []
        for shelf in db.query(model.Shelf).all():
            records = [record for record in analytics if record.shelf_id == shelf.id]
            shelf_rows.append({
                "name": shelf.shelf_name,
                "visitors": len(records),
                "attention": round(sum(r.attention_score or 0 for r in records) / len(records), 2) if records else 0.0,
            })

        return {
            "hourly_visitors": [{"label": str(hour), "value": hourly.get(hour, 0)} for hour in sorted(hourly.keys())],
            "daily_visitors": [{"label": label, "value": value} for label, value in sorted(daily.items())],
            "weekly_visitors": [{"label": label, "value": value} for label, value in sorted(weekly.items())],
            "monthly_visitors": [{"label": label, "value": value} for label, value in sorted(monthly.items())],
            "attention_distribution": attention_distribution,
            "camera_performance": camera_series,
            "product_performance": sorted(product_rows, key=lambda item: item["views"], reverse=True)[:10],
            "shelf_performance": sorted(shelf_rows, key=lambda item: item["visitors"], reverse=True)[:10],
            "traffic_by_store": [
                {
                    "name": store.store_name,
                    "visitors": len([record for record in analytics if record.store_id == store.id]),
                }
                for store in db.query(model.Store).filter(model.Store.is_live_store.is_(True)).all()
            ],
        }

    def get_heatmap_payload(self, db: Session) -> List[Dict[str, Any]]:
        heatmaps = db.query(model.Heatmap).order_by(model.Heatmap.created_at.desc()).all()
        payload = []
        for heatmap in heatmaps:
            payload.append({
                "id": heatmap.id,
                "store_id": heatmap.store_id,
                "camera_id": heatmap.camera_id,
                "shelf_id": heatmap.shelf_id,
                "type": heatmap.heatmap_type,
                "coordinates": heatmap.coordinates or {},
            })
        return payload
