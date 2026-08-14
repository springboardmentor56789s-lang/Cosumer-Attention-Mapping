"""
backend/app/routers/video_analysis.py
Frame-by-Frame Video Detection, People Counting & Excel Export Router
"""
import os
import tempfile
import uuid
import base64
import io
import cv2
import pandas as pd
import numpy as np
from datetime import datetime
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse, JSONResponse
from ultralytics import YOLO

from ..services.gaze_engine import analyze_frame_gaze
from ..services.tracking_engine import transform_to_floorplan, zone_for_point

router = APIRouter(prefix="/api/video", tags=["Video Analysis"])

# Person tracking model
person_model = YOLO("yolov8n.pt")
GENERATED_REPORTS = {}  # {analysis_id: file_path}

@router.post("/analyze-video-full")
async def analyze_uploaded_video(
    file: UploadFile = File(...),
    store_name: str = Form("Downtown Flagship"),
    sample_rate: int = Form(3)
):
    """
    Processes an uploaded surveillance video frame-by-frame:
    1. Detects all persons in every sampled frame.
    2. Draws bounding box frames around each person with Shopper ID and Gaze Direction.
    3. Calculates real-time people counts, peak occupancy, and dwell times.
    4. Generates an Excel (.xlsx) file with frame-by-frame logs and summary sheets.
    5. Returns annotated preview frames and a direct download link for the Excel file.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No video file uploaded")

    analysis_id = str(uuid.uuid4())[:8]
    suffix = os.path.splitext(file.filename)[1] or ".mp4"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_video:
        content = await file.read()
        temp_video.write(content)
        temp_file_path = temp_video.name

    try:
        cap = cv2.VideoCapture(temp_file_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not read uploaded video")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
        frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1280
        frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 720
        sec_per_sample = sample_rate / fps if fps else 0.1

        frame_idx = 0
        analyzed_frames = 0
        peak_people = 0
        frame_logs = []
        annotated_preview_frames = []

        track_frame_counts = {}
        track_zones = {}
        track_gaze = {}
        gaze_tier_counts = {"Top Shelf": 0, "Eye-Level (Golden Zone)": 0, "Reach Level": 0, "Bottom Shelf": 0}

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1
            if frame_idx % sample_rate != 0:
                continue

            analyzed_frames += 1
            timestamp_sec = round(frame_idx / fps, 2)
            time_str = f"{int(timestamp_sec // 60):02d}:{int(timestamp_sec % 60):02d}.{int((timestamp_sec % 1) * 10)}"

            # Run person detection & tracking
            results = person_model.track(
                frame,
                tracker="bytetrack.yaml",
                persist=True,
                classes=[0],  # Person
                conf=0.25,
                verbose=False
            )

            # Run Gaze & Pose Detection for rich head pose
            gaze_people = analyze_frame_gaze(frame, conf=0.25)

            annotated_frame = frame.copy()
            people_in_frame = 0
            shopper_ids_in_frame = []
            zones_in_frame = []
            gaze_targets_in_frame = []

            if results[0].boxes is not None:
                boxes = results[0].boxes.xyxy.cpu().numpy()
                track_ids = results[0].boxes.id.cpu().numpy().astype(int) if results[0].boxes.id is not None else range(len(boxes))

                people_in_frame = len(boxes)
                peak_people = max(peak_people, people_in_frame)

                for box, tid in zip(boxes, track_ids):
                    bx1, by1, bx2, by2 = map(int, box)
                    shopper_id = f"SHOPPER-{tid:02d}"
                    shopper_ids_in_frame.append(shopper_id)

                    # Compute 2D Floorplan & Zone
                    feet_u = (bx1 + bx2) / 2.0
                    feet_v = by2
                    fx, fy = transform_to_floorplan(feet_u, feet_v, frame_w, frame_h)
                    zone = zone_for_point(fx, fy)
                    zones_in_frame.append(zone)

                    # Find corresponding gaze if available
                    matched_gaze = "Eye-Level (Golden Zone)"
                    is_reach = False
                    for g in gaze_people:
                        gx1, gy1, gx2, gy2 = g["bbox"]
                        if abs(bx1 - gx1) < 50 and abs(by1 - gy1) < 50:
                            matched_gaze = g["gaze_target"]
                            is_reach = g.get("is_reaching", False)
                            break

                    gaze_targets_in_frame.append(matched_gaze)
                    for k in gaze_tier_counts.keys():
                        if k in matched_gaze:
                            gaze_tier_counts[k] += 1
                            break

                    # Update per-shopper stats
                    track_frame_counts[shopper_id] = track_frame_counts.get(shopper_id, 0) + 1
                    track_zones.setdefault(shopper_id, []).append(zone)
                    track_gaze.setdefault(shopper_id, []).append(matched_gaze)

                    # Draw Bounding Box around Person
                    is_golden = "Golden Zone" in matched_gaze
                    box_color = (63, 191, 127) if is_golden else ((232, 101, 79) if is_reach else (232, 163, 61))
                    cv2.rectangle(annotated_frame, (bx1, by1), (bx2, by2), box_color, 2)

                    # Draw Badge Label
                    badge_text = f"{shopper_id} | {matched_gaze}"
                    if is_reach:
                        badge_text += " [TOUCH]"
                    
                    label_size = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)[0]
                    cv2.rectangle(annotated_frame, (bx1, max(0, by1 - 22)), (bx1 + label_size[0] + 8, by1), (19, 26, 39), -1)
                    cv2.putText(annotated_frame, badge_text, (bx1 + 4, max(14, by1 - 6)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (237, 239, 243), 1, cv2.LINE_AA)

            # Top HUD Header
            cv2.rectangle(annotated_frame, (0, 0), (frame_w, 40), (19, 26, 39), -1)
            hud_text = f"FRAME #{frame_idx} | TIME: {time_str} | PEOPLE DETECTED: {people_in_frame} | PEAK: {peak_people}"
            cv2.putText(annotated_frame, hud_text, (16, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (232, 163, 61), 2, cv2.LINE_AA)

            # Record frame log
            frame_logs.append({
                "Frame_Number": frame_idx,
                "Timestamp": time_str,
                "People_Count": people_in_frame,
                "Active_Shoppers": ", ".join(shopper_ids_in_frame) if shopper_ids_in_frame else "None",
                "Occupied_Zones": ", ".join(set(zones_in_frame)) if zones_in_frame else "None",
                "Primary_Gaze_Target": gaze_targets_in_frame[0] if gaze_targets_in_frame else "N/A",
            })

            # Save sample keyframes for preview (up to 8 frames)
            if analyzed_frames % max(1, (total_frames // (sample_rate * 8) or 1)) == 0 and len(annotated_preview_frames) < 8:
                _, buf = cv2.imencode(".jpg", annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                b64 = base64.b64encode(buf).decode("utf-8")
                annotated_preview_frames.append({
                    "frame": frame_idx,
                    "time": time_str,
                    "people": people_in_frame,
                    "image": f"data:image/jpeg;base64,{b64}"
                })

        cap.release()

        # Compute Unique Shoppers Summary
        total_unique_shoppers = len(track_frame_counts)
        avg_people_per_frame = round(sum(f["People_Count"] for f in frame_logs) / max(1, len(frame_logs)), 1)
        total_gaze_events = sum(gaze_tier_counts.values()) or 1
        golden_zone_pct = round((gaze_tier_counts["Eye-Level (Golden Zone)"] / total_gaze_events) * 100, 1)

        shopper_summary = []
        for sid, count in track_frame_counts.items():
            zones = track_zones.get(sid, ["Entrance"])
            unique_zones = list(dict.fromkeys(zones))
            dwell_sec = round(count * sec_per_sample, 1)
            shopper_summary.append({
                "Shopper_ID": sid,
                "Dwell_Time_Seconds": dwell_sec,
                "Dwell_Time_Minutes": round(dwell_sec / 60, 2),
                "Zones_Visited_Count": len(unique_zones),
                "Pathway": " -> ".join(unique_zones),
                "Primary_Zone": max(set(zones), key=zones.count),
            })

        # ==========================================
        # GENERATE EXCEL SPREADSHEET (.XLSX)
        # ==========================================
        excel_filename = f"Retail_AI_Video_Analysis_{analysis_id}.xlsx"
        excel_path = os.path.join(tempfile.gettempdir(), excel_filename)

        df_summary = pd.DataFrame([
            {"Metric": "Store Name", "Value": store_name},
            {"Metric": "Source Video Filename", "Value": file.filename},
            {"Metric": "Analysis Date", "Value": datetime.now().strftime("%Y-%m-%d %H:%M:%S")},
            {"Metric": "Total Frames Analyzed", "Value": analyzed_frames},
            {"Metric": "Video Duration (Seconds)", "Value": round(total_frames / fps, 1) if fps else 0},
            {"Metric": "Total Unique Shoppers Detected", "Value": total_unique_shoppers},
            {"Metric": "Peak Customer Occupancy", "Value": f"{peak_people} persons"},
            {"Metric": "Average Occupancy Per Frame", "Value": f"{avg_people_per_frame} persons"},
            {"Metric": "Golden Zone Eye-Level Attention Share", "Value": f"{golden_zone_pct}%"},
        ])

        df_frames = pd.DataFrame(frame_logs)
        df_shoppers = pd.DataFrame(shopper_summary)
        df_gaze = pd.DataFrame([
            {"Shelf_Tier": k, "Gaze_Fixation_Count": v, "Percentage": f"{round((v/total_gaze_events)*100, 1)}%"}
            for k, v in gaze_tier_counts.items()
        ])

        with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
            df_summary.to_excel(writer, sheet_name="Executive Summary", index=False)
            df_frames.to_excel(writer, sheet_name="Frame by Frame Log", index=False)
            df_shoppers.to_excel(writer, sheet_name="Shopper Pathways & Dwell", index=False)
            df_gaze.to_excel(writer, sheet_name="Shelf Gaze Attention", index=False)

        GENERATED_REPORTS[analysis_id] = excel_path

        # Read Excel bytes for direct download
        with open(excel_path, "rb") as f:
            excel_bytes = f.read()
        excel_b64 = base64.b64encode(excel_bytes).decode("utf-8")

        return JSONResponse({
            "success": True,
            "analysis_id": analysis_id,
            "filename": file.filename,
            "metrics": {
                "total_unique_shoppers": total_unique_shoppers,
                "peak_people_count": peak_people,
                "avg_people_per_frame": avg_people_per_frame,
                "total_frames_analyzed": analyzed_frames,
                "golden_zone_share_pct": golden_zone_pct,
            },
            "preview_frames": annotated_preview_frames,
            "frame_logs": frame_logs[:50],  # sample preview
            "shoppers": shopper_summary,
            "gaze_tiers": gaze_tier_counts,
            "excel_download_url": f"http://127.0.0.1:8000/api/video/download-excel/{analysis_id}",
            "excel_base64": f"data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,{excel_b64}",
        })

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.get("/download-excel/{analysis_id}")
def download_excel_report(analysis_id: str):
    """Serves the generated Excel (.xlsx) file for direct browser download."""
    file_path = GENERATED_REPORTS.get(analysis_id)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Excel report not found or expired")

    return FileResponse(
        path=file_path,
        filename=f"Retail_AI_Analytics_{analysis_id}.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
