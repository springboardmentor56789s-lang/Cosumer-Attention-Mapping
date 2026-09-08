from database import SessionLocal
import models
from scoring_engine import calculate_shelf_scores
import cv2
from database import engine, Base


def check_shelf_performance_alerts(db):
    """1. Shelf performance alerts - flag shelves with very low scores"""
    scores = calculate_shelf_scores()
    alerts = []

    for shelf, data in scores.items():
        if data["attractiveness_score"] < 10:
            alerts.append({
                "alert_type": "Shelf Performance",
                "severity": "High",
                "message": f"'{shelf}' has critically low attractiveness score ({data['attractiveness_score']}). Immediate review recommended.",
                "related_shelf": shelf
            })
        elif data["attractiveness_score"] < 20:
            alerts.append({
                "alert_type": "Shelf Performance",
                "severity": "Medium",
                "message": f"'{shelf}' is underperforming (score: {data['attractiveness_score']}). Consider monitoring.",
                "related_shelf": shelf
            })

    return alerts


def check_product_visibility_alerts(db):
    """2. Product visibility alerts - flag shelves with very low attention/visibility"""
    scores = calculate_shelf_scores()
    alerts = []

    for shelf, data in scores.items():
        if data["shelf_visibility_score"] < 15:
            alerts.append({
                "alert_type": "Product Visibility",
                "severity": "Medium",
                "message": f"'{shelf}' has very low visibility ({data['shelf_visibility_score']}). Product may be poorly positioned or lit.",
                "related_shelf": shelf
            })

    return alerts


def check_traffic_anomaly_alerts(db):
    """3. Traffic anomaly notifications - flag shelves with zero interactions despite being tracked"""
    scores = calculate_shelf_scores()
    alerts = []

    for shelf, data in scores.items():
        if data["attention_duration_seconds"] > 0 and data["total_interactions"] == 0:
            alerts.append({
                "alert_type": "Traffic Anomaly",
                "severity": "Low",
                "message": f"'{shelf}' has foot traffic ({data['attention_duration_seconds']}s attention) but zero product interactions - possible display issue.",
                "related_shelf": shelf
            })

    return alerts


def check_camera_health_alerts(db):
    """4. Camera health alerts - check if webcam is accessible"""
    alerts = []
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        alerts.append({
            "alert_type": "Camera Health",
            "severity": "Critical",
            "message": "Primary camera (webcam index 0) is not accessible. Check camera connection.",
            "related_shelf": None
        })
    else:
        cap.release()

    return alerts


def check_platform_notifications(db):
    """5. Platform notifications - general system status messages"""
    alerts = []

    total_users = db.query(models.User).count()
    total_stores = db.query(models.Store).count()
    total_shelves = db.query(models.Shelf).count()

    alerts.append({
        "alert_type": "Platform Notification",
        "severity": "Low",
        "message": f"System status: {total_users} users, {total_stores} stores, {total_shelves} shelves currently registered.",
        "related_shelf": None
    })

    return alerts


def run_all_checks_and_save():
    db = SessionLocal()
    db.query(models.Alert).delete()  # clear old alerts before generating fresh ones
    db.commit()
    all_alerts = []
    all_alerts.extend(check_shelf_performance_alerts(db))
    all_alerts.extend(check_product_visibility_alerts(db))
    all_alerts.extend(check_traffic_anomaly_alerts(db))
    all_alerts.extend(check_camera_health_alerts(db))
    all_alerts.extend(check_platform_notifications(db))

    for alert_data in all_alerts:
        alert = models.Alert(
            alert_type=alert_data["alert_type"],
            severity=alert_data["severity"],
            message=alert_data["message"],
            related_shelf=alert_data["related_shelf"]
        )
        db.add(alert)

    db.commit()
    db.close()

    return all_alerts


if __name__ == "__main__":
    alerts = run_all_checks_and_save()
    print(f"--- Generated {len(alerts)} Alerts ---\n")
    for a in alerts:
        print(f"[{a['severity']}] {a['alert_type']}: {a['message']}")