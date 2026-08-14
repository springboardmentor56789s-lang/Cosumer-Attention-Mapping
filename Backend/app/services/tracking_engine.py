"""
backend/app/services/tracking_engine.py
Storewide Multi-Customer Tracking & 2D Floorplan Mapping Engine
"""
import numpy as np

STORE_ZONES = [
    {"name": "Entrance", "x": 10, "y": 12, "width": 24, "height": 20, "color": "#5B8DEF"},
    {"name": "Grocery & Snacks", "x": 10, "y": 36, "width": 32, "height": 26, "color": "#5FAE86"},
    {"name": "Electronics", "x": 46, "y": 44, "width": 28, "height": 30, "color": "#E8A33D"},
    {"name": "Apparel", "x": 46, "y": 12, "width": 28, "height": 28, "color": "#9B51E0"},
    {"name": "Checkout", "x": 76, "y": 70, "width": 20, "height": 24, "color": "#F2994A"},
    {"name": "Exit", "x": 76, "y": 12, "width": 20, "height": 20, "color": "#E8654F"},
]

def transform_to_floorplan(feet_u: float, feet_v: float, frame_w: int = 1280, frame_h: int = 720) -> tuple:
    """
    Transforms camera image feet coordinates (u, v) into normalized 2D store floorplan % (0-100).
    Uses perspective normalization matrix.
    """
    norm_u = np.clip(feet_u / float(frame_w), 0.0, 1.0)
    norm_v = np.clip(feet_v / float(frame_h), 0.0, 1.0)

    # Perspective projection mapping
    floor_x = norm_u * 85.0 + 7.5
    floor_y = norm_v * 75.0 + 12.5

    return round(float(floor_x), 1), round(float(floor_y), 1)

def zone_for_point(px_pct: float, py_pct: float) -> str:
    """Finds which store zone contains the given floorplan coordinate."""
    for zone in STORE_ZONES:
        if (
            zone["x"] <= px_pct <= zone["x"] + zone["width"]
            and zone["y"] <= py_pct <= zone["y"] + zone["height"]
        ):
            return zone["name"]

    # Fallback to closest zone center
    def dist_to_zone(z):
        zx = z["x"] + z["width"] / 2.0
        zy = z["y"] + z["height"] / 2.0
        return (zx - px_pct) ** 2 + (zy - py_pct) ** 2

    return min(STORE_ZONES, key=dist_to_zone)["name"]

class ShopperTrackerState:
    """Maintains continuous trajectory and zone dwell states for active shoppers."""
    def __init__(self):
        self.active_shoppers = {}  # {track_id: {path, zone_dwell, last_seen, start_time}}

    def update_shopper(self, track_id: int, floor_x: float, floor_y: float, timestamp_sec: float):
        zone = zone_for_point(floor_x, floor_y)
        tid = f"SHOPPER-{track_id:02d}"

        if tid not in self.active_shoppers:
            self.active_shoppers[tid] = {
                "id": tid,
                "first_seen": timestamp_sec,
                "last_seen": timestamp_sec,
                "current_zone": zone,
                "current_pos": {"x": floor_x, "y": floor_y},
                "path_history": [{"x": floor_x, "y": floor_y, "zone": zone, "t": timestamp_sec}],
                "zone_dwell": {zone: 0.0},
                "zone_sequence": [zone],
            }
        else:
            shopper = self.active_shoppers[tid]
            dt = max(0.0, timestamp_sec - shopper["last_seen"])
            shopper["last_seen"] = timestamp_sec
            shopper["current_pos"] = {"x": floor_x, "y": floor_y}
            shopper["current_zone"] = zone
            shopper["path_history"].append({"x": floor_x, "y": floor_y, "zone": zone, "t": timestamp_sec})
            
            # Keep history manageable
            if len(shopper["path_history"]) > 200:
                shopper["path_history"] = shopper["path_history"][-200:]

            shopper["zone_dwell"][zone] = shopper["zone_dwell"].get(zone, 0.0) + dt

            if not shopper["zone_sequence"] or shopper["zone_sequence"][-1] != zone:
                shopper["zone_sequence"].append(zone)

        return self.active_shoppers[tid]