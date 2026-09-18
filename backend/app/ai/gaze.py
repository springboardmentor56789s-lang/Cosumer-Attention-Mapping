import cv2
import math
import os
from collections import deque

import mediapipe as mp


class GazeEstimator:

    """
    MediaPipe-based gaze estimator.

    Returns:
        [
            {
                "gaze": "LEFT",
                "x": face_center_x,
                "y": face_center_y,
                "gaze_x": 0.32,
                "gaze_y": 0.50,
                "confidence": 0.82
            }
        ]

    If a face/iris cannot be reliably detected:

        [
            {
                "gaze": "UNKNOWN",
                "x": ...,
                "y": ...,
                "gaze_x": None,
                "gaze_y": None,
                "confidence": 0.0
            }
        ]
    """

    DIRECTIONS = (
        "LEFT",
        "RIGHT",
        "CENTER",
        "UP",
        "DOWN",
        "UNKNOWN"
    )

    def __init__(self):

        # =====================================================
        # MEDIA PIPE
        # =====================================================

        self.mp = mp

        self.face_landmarker = None

        # =====================================================
        # MODEL PATH
        # =====================================================

        model_path = os.path.join(
            os.path.dirname(__file__),
            "face_landmarker.task"
        )

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                "MediaPipe face model not found: "
                f"{model_path}"
            )

        # =====================================================
        # FACE LANDMARKER
        # =====================================================

        base_options = mp.tasks.BaseOptions(
            model_asset_path=model_path
        )

        options = mp.tasks.vision.FaceLandmarkerOptions(
            base_options=base_options,
            running_mode=mp.tasks.vision.RunningMode.IMAGE,
            num_faces=5,
            min_face_detection_confidence=0.35,
            min_face_presence_confidence=0.35,
            min_tracking_confidence=0.35,
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=False
        )

        self.face_landmarker = (
            mp.tasks.vision.FaceLandmarker.create_from_options(
                options
            )
        )

        # =====================================================
        # LANDMARKS
        # =====================================================

        # Left eye
        self.LEFT_EYE_LEFT = 33
        self.LEFT_EYE_RIGHT = 133
        self.LEFT_EYE_TOP = 159
        self.LEFT_EYE_BOTTOM = 145
        self.LEFT_IRIS = 468

        # Right eye
        self.RIGHT_EYE_LEFT = 362
        self.RIGHT_EYE_RIGHT = 263
        self.RIGHT_EYE_TOP = 386
        self.RIGHT_EYE_BOTTOM = 374
        self.RIGHT_IRIS = 473

        # =====================================================
        # CLASSIFICATION THRESHOLDS
        # =====================================================

        # Less strict than the previous version.
        self.left_threshold = 0.44
        self.right_threshold = 0.56

        self.up_threshold = 0.42
        self.down_threshold = 0.58

        # =====================================================
        # MINIMUM EYE SIZE
        # =====================================================

        self.min_eye_width = 2.0
        self.min_eye_height = 1.0

        print(
            "GazeEstimator initialized successfully."
        )

    # =========================================================
    # POINT
    # =========================================================

    def _point(
        self,
        landmark,
        width,
        height
    ):

        return (
            int(
                max(
                    0.0,
                    min(
                        1.0,
                        landmark.x
                    )
                ) * width
            ),
            int(
                max(
                    0.0,
                    min(
                        1.0,
                        landmark.y
                    )
                ) * height
            )
        )

    # =========================================================
    # DISTANCE
    # =========================================================

    def _distance(
        self,
        p1,
        p2
    ):

        return math.sqrt(
            (p1[0] - p2[0]) ** 2 +
            (p1[1] - p2[1]) ** 2
        )

    # =========================================================
    # CLAMP
    # =========================================================

    def _clamp(
        self,
        value,
        minimum,
        maximum
    ):

        return max(
            minimum,
            min(
                maximum,
                value
            )
        )

    # =========================================================
    # CLASSIFY GAZE
    # =========================================================

    def _classify_gaze(
        self,
        gaze_x,
        gaze_y
    ):

        horizontal = "CENTER"
        vertical = "CENTER"

        # -----------------------------------------------------
        # HORIZONTAL
        # -----------------------------------------------------

        if gaze_x < self.left_threshold:

            horizontal = "LEFT"

        elif gaze_x > self.right_threshold:

            horizontal = "RIGHT"

        # -----------------------------------------------------
        # VERTICAL
        # -----------------------------------------------------

        if gaze_y < self.up_threshold:

            vertical = "UP"

        elif gaze_y > self.down_threshold:

            vertical = "DOWN"

        # -----------------------------------------------------
        # PRIORITIZE HORIZONTAL
        # -----------------------------------------------------

        if horizontal != "CENTER":

            return horizontal

        if vertical != "CENTER":

            return vertical

        return "CENTER"

    # =========================================================
    # FACE CENTER
    # =========================================================

    def _face_center(
        self,
        landmarks,
        width,
        height
    ):

        if not landmarks:
            return width // 2, height // 2

        xs = [
            landmark.x
            for landmark in landmarks
        ]

        ys = [
            landmark.y
            for landmark in landmarks
        ]

        return (
            int(
                sum(xs) /
                len(xs) *
                width
            ),
            int(
                sum(ys) /
                len(ys) *
                height
            )
        )

    # =========================================================
    # ESTIMATE
    # =========================================================

    def estimate(
        self,
        frame
    ):

        if frame is None:
            return []

        if frame.size == 0:
            return []

        height, width = frame.shape[:2]

        if width < 20 or height < 20:
            return []

        # =====================================================
        # RGB
        # =====================================================

        try:

            rgb = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )

        except Exception:

            return []

        # =====================================================
        # MEDIAPIPE IMAGE
        # =====================================================

        try:

            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=rgb
            )

        except Exception:

            return []

        # =====================================================
        # DETECT
        # =====================================================

        try:

            result = self.face_landmarker.detect(
                mp_image
            )

        except Exception:

            return []

        # =====================================================
        # NO FACE
        # =====================================================

        if (
            result is None
            or not result.face_landmarks
        ):

            return []

        gaze_results = []

        # =====================================================
        # PROCESS FACES
        # =====================================================

        for landmarks in result.face_landmarks:

            try:

                if len(landmarks) <= 473:
                    continue

                # =================================================
                # LEFT EYE
                # =================================================

                left_corner = self._point(
                    landmarks[self.LEFT_EYE_LEFT],
                    width,
                    height
                )

                left_corner_right = self._point(
                    landmarks[self.LEFT_EYE_RIGHT],
                    width,
                    height
                )

                left_top = self._point(
                    landmarks[self.LEFT_EYE_TOP],
                    width,
                    height
                )

                left_bottom = self._point(
                    landmarks[self.LEFT_EYE_BOTTOM],
                    width,
                    height
                )

                left_iris = self._point(
                    landmarks[self.LEFT_IRIS],
                    width,
                    height
                )

                # =================================================
                # RIGHT EYE
                # =================================================

                right_corner = self._point(
                    landmarks[self.RIGHT_EYE_LEFT],
                    width,
                    height
                )

                right_corner_right = self._point(
                    landmarks[self.RIGHT_EYE_RIGHT],
                    width,
                    height
                )

                right_top = self._point(
                    landmarks[self.RIGHT_EYE_TOP],
                    width,
                    height
                )

                right_bottom = self._point(
                    landmarks[self.RIGHT_EYE_BOTTOM],
                    width,
                    height
                )

                right_iris = self._point(
                    landmarks[self.RIGHT_IRIS],
                    width,
                    height
                )

                # =================================================
                # EYE DIMENSIONS
                # =================================================

                left_eye_width = self._distance(
                    left_corner,
                    left_corner_right
                )

                left_eye_height = self._distance(
                    left_top,
                    left_bottom
                )

                right_eye_width = self._distance(
                    right_corner,
                    right_corner_right
                )

                right_eye_height = self._distance(
                    right_top,
                    right_bottom
                )

                # =================================================
                # INVALID EYES
                # =================================================

                if (
                    left_eye_width < self.min_eye_width
                    or right_eye_width < self.min_eye_width
                    or left_eye_height < self.min_eye_height
                    or right_eye_height < self.min_eye_height
                ):

                    continue

                # =================================================
                # LEFT EYE RATIOS
                # =================================================

                left_x_ratio = (
                    left_iris[0] -
                    left_corner[0]
                ) / left_eye_width

                left_y_ratio = (
                    left_iris[1] -
                    left_top[1]
                ) / left_eye_height

                # =================================================
                # RIGHT EYE RATIOS
                # =================================================

                right_x_ratio = (
                    right_iris[0] -
                    right_corner[0]
                ) / right_eye_width

                right_y_ratio = (
                    right_iris[1] -
                    right_top[1]
                ) / right_eye_height

                # =================================================
                # NORMALIZE
                # =================================================

                left_x_ratio = self._clamp(
                    left_x_ratio,
                    0.0,
                    1.0
                )

                right_x_ratio = self._clamp(
                    right_x_ratio,
                    0.0,
                    1.0
                )

                left_y_ratio = self._clamp(
                    left_y_ratio,
                    0.0,
                    1.0
                )

                right_y_ratio = self._clamp(
                    right_y_ratio,
                    0.0,
                    1.0
                )

                # =================================================
                # BOTH EYES
                # =================================================

                gaze_x = (
                    left_x_ratio +
                    right_x_ratio
                ) / 2.0

                gaze_y = (
                    left_y_ratio +
                    right_y_ratio
                ) / 2.0

                # =================================================
                # CLASSIFY
                # =================================================

                gaze_direction = self._classify_gaze(
                    gaze_x,
                    gaze_y
                )

                # =================================================
                # FACE CENTER
                # =================================================

                face_x, face_y = self._face_center(
                    landmarks,
                    width,
                    height
                )

                # =================================================
                # SIMPLE CONFIDENCE
                # =================================================

                eye_quality = min(
                    1.0,
                    (
                        left_eye_width +
                        right_eye_width
                    ) / max(
                        1.0,
                        width * 0.15
                    )
                )

                confidence = round(
                    self._clamp(
                        eye_quality,
                        0.0,
                        1.0
                    ),
                    3
                )

                # =================================================
                # RESULT
                # =================================================

                gaze_results.append({

                    "gaze":
                        gaze_direction,

                    "x":
                        face_x,

                    "y":
                        face_y,

                    "gaze_x":
                        round(
                            gaze_x,
                            3
                        ),

                    "gaze_y":
                        round(
                            gaze_y,
                            3
                        ),

                    "confidence":
                        confidence

                })

            except Exception:
                continue

        return gaze_results