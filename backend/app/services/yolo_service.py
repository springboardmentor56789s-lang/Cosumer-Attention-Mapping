import os
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import cv2
except ImportError:  # pragma: no cover - optional dependency
    cv2 = None

try:
    from ultralytics import YOLO
except ImportError:  # pragma: no cover - optional dependency
    YOLO = None

try:
    import torch
except ImportError:  # pragma: no cover - optional dependency
    torch = None


class YOLOService:
    def __init__(self, model_name: Optional[str] = None, device: str = "cpu"):
        deployment_weights = Path(__file__).resolve().parents[2] / "models" / "product_detector" / "best.pt"
        active_run_weights = (
            Path(__file__).resolve().parents[2]
            / "runs"
            / "sku110k_yolov8n"
            / "weights"
            / "best.pt"
        )
        # An explicit model/environment override wins. Otherwise use the SKU-110K
        # checkpoint once training has installed it, retaining the stock model as
        # a development fallback before the first training run completes.
        self.model_name = model_name or os.getenv("YOLO_MODEL") or (
            str(deployment_weights)
            if deployment_weights.is_file()
            else str(active_run_weights)
            if active_run_weights.is_file()
            else "yolov8n.pt"
        )
        self.device = self._resolve_device(device)
        self.model = None

    def _resolve_device(self, requested_device: str) -> str:
        if requested_device and requested_device.lower() not in {"auto", "cpu"}:
            return requested_device

        if torch is not None and torch.cuda.is_available():
            return "cuda:0"
        return "cpu"

    def _load_model(self):
        if self.model is not None:
            return self.model

        if cv2 is None:
            raise RuntimeError("opencv-python is not installed. Install it with: pip install opencv-python")

        if YOLO is None:
            raise RuntimeError("ultralytics is not installed. Install it with: pip install ultralytics")

        model_path = os.getenv("YOLO_MODEL_PATH")
        selected_model = model_path if model_path and os.path.exists(model_path) else self.model_name
        self.model = YOLO(selected_model)

        try:
            self.model.to(self.device)
        except Exception:
            # Fall back to CPU if CUDA is unavailable/misconfigured at runtime.
            self.device = "cpu"
            self.model.to(self.device)
        return self.model

    def predict_frame(self, frame, conf_threshold: float = 0.25) -> List[Dict[str, Any]]:
        model = self._load_model()
        results = model(frame, conf=conf_threshold, stream=False, verbose=False)

        detections: List[Dict[str, Any]] = []
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue

            for box in boxes:
                cls_id = int(box.cls[0].item()) if hasattr(box.cls[0], "item") else int(box.cls[0])
                class_name = result.names.get(cls_id, str(cls_id))
                confidence = float(box.conf[0].item()) if hasattr(box.conf[0], "item") else float(box.conf[0])
                x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]

                detections.append(
                    {
                        "class_name": class_name,
                        "confidence": round(confidence, 4),
                        "x1": int(x1),
                        "y1": int(y1),
                        "x2": int(x2),
                        "y2": int(y2),
                    }
                )

        return detections

    def process_rtsp_url(self, rtsp_url: str, conf_threshold: float = 0.25) -> List[Dict[str, Any]]:
        if cv2 is None:
            raise RuntimeError("opencv-python is not installed. Install it with: pip install opencv-python")

        cap = cv2.VideoCapture(rtsp_url)
        if not cap.isOpened():
            raise RuntimeError(f"Unable to open RTSP stream: {rtsp_url}")

        success, frame = cap.read()
        cap.release()

        if not success or frame is None:
            raise RuntimeError("Unable to read a frame from the RTSP stream")

        return self.predict_frame(frame, conf_threshold=conf_threshold)
