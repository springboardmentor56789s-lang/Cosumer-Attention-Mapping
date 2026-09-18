# app/ai/product_detector.py

from ultralytics import YOLO
import os


class ProductDetector:

    def __init__(self, model_path="yolov8n.pt"):

        self.model_path = model_path
        self.model = None

        # COCO classes that are useful as retail-like objects.
        # This does NOT mean they are actual SKU/product names.
        self.allowed_classes = {
            "bottle",
            "cup",
            "bowl",
            "banana",
            "apple",
            "orange",
            "sandwich",
            "pizza",
            "donut",
            "cake",
            "book",
            "backpack",
            "handbag",
            "suitcase",
        }

        try:

            if os.path.exists(model_path):

                self.model = YOLO(model_path)

                print(
                    "\n========================================"
                )
                print(
                    "PRODUCT DETECTOR INITIALIZED"
                )
                print(
                    "Model:",
                    model_path
                )
                print(
                    "========================================\n"
                )

            else:

                print(
                    "Product model not found:",
                    model_path
                )

        except Exception as e:

            print(
                "Product detector initialization failed:",
                e
            )

    # =========================================================
    # DETECT FROM FRAME
    # =========================================================

    def detect_from_frame(
        self,
        frame,
        confidence=0.30
    ):

        if self.model is None:
            return []

        detections = []

        try:

            results = self.model.predict(
                source=frame,
                conf=confidence,
                verbose=False
            )

            if not results:
                return []

            result = results[0]

            if result.boxes is None:
                return []

            names = result.names
            boxes = result.boxes

            for index in range(len(boxes)):

                class_id = int(
                    boxes.cls[index]
                    .cpu()
                    .item()
                )

                class_name = str(
                    names.get(
                        class_id,
                        class_id
                    )
                )

                # -------------------------------------------------
                # Ignore irrelevant COCO classes.
                # -------------------------------------------------

                if (
                    self.allowed_classes
                    and
                    class_name.lower()
                    not in self.allowed_classes
                ):
                    continue

                confidence_value = float(
                    boxes.conf[index]
                    .cpu()
                    .item()
                )

                xyxy = (
                    boxes.xyxy[index]
                    .cpu()
                    .numpy()
                    .tolist()
                )

                x1 = float(xyxy[0])
                y1 = float(xyxy[1])
                x2 = float(xyxy[2])
                y2 = float(xyxy[3])

                center_x = (
                    x1 + x2
                ) / 2

                center_y = (
                    y1 + y2
                ) / 2

                detections.append({

                    "class_id":
                        class_id,

                    "class_name":
                        class_name,

                    "confidence":
                        round(
                            confidence_value,
                            3
                        ),

                    "bbox": {

                        "x1":
                            round(
                                x1,
                                2
                            ),

                        "y1":
                            round(
                                y1,
                                2
                            ),

                        "x2":
                            round(
                                x2,
                                2
                            ),

                        "y2":
                            round(
                                y2,
                                2
                            )
                    },

                    "center": {

                        "x":
                            round(
                                center_x,
                                2
                            ),

                        "y":
                            round(
                                center_y,
                                2
                            )
                    }
                })

        except Exception as e:

            print(
                "Product detection error:",
                e
            )

        return detections