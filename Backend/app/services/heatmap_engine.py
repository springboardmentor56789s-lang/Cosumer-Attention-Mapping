"""
backend/app/services/heatmap_engine.py
2D Floorplan Traffic Density & Shelf Gaze Heatmap Generator
"""
import numpy as np

def generate_floorplan_heatmap(positions: list, grid_w: int = 40, grid_h: int = 30) -> list:
    """Generates a 2D intensity heatmap matrix across the store floorplan."""
    grid = np.zeros((grid_h, grid_w), dtype=float)

    for pos in positions:
        x_pct = pos.get("x", 50)
        y_pct = pos.get("y", 50)
        gx = int(np.clip(x_pct / 100.0 * (grid_w - 1), 0, grid_w - 1))
        gy = int(np.clip(y_pct / 100.0 * (grid_h - 1), 0, grid_h - 1))

        # Gaussian kernel stamp
        for dy in range(-2, 3):
            for dx in range(-2, 3):
                ny, nx = gy + dy, gx + dx
                if 0 <= ny < grid_h and 0 <= nx < grid_w:
                    dist_sq = dx * dx + dy * dy
                    weight = np.exp(-dist_sq / 2.0)
                    grid[ny, nx] += weight

    # Normalize 0 - 100
    max_val = np.max(grid)
    if max_val > 0:
        grid = (grid / max_val) * 100.0

    return grid.round(1).tolist()

def generate_shelf_gaze_matrix(gaze_events: list) -> dict:
    """Aggregates gaze fixations across vertical shelf tiers."""
    counts = {
        "Top Shelf": 0,
        "Eye-Level (Golden Zone)": 0,
        "Reach Level": 0,
        "Bottom Shelf": 0,
    }
    for ev in gaze_events:
        tgt = ev.get("gaze_target", "")
        for k in counts.keys():
            if k in tgt:
                counts[k] += 1
                break

    total = sum(counts.values()) or 1
    percentages = {k: round((v / total) * 100, 1) for k, v in counts.items()}
    return {
        "counts": counts,
        "percentages": percentages,
        "total_fixations": sum(counts.values()),
        "golden_zone_dominance": percentages["Eye-Level (Golden Zone)"] >= 45.0,
    }
