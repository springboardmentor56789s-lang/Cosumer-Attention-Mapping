from ultralytics import YOLO

import cv2
import os
import subprocess
import time
import shutil

from app.ai.heatmap import HeatmapGenerator
from app.ai.gaze import GazeEstimator


class PersonTracker:

    def __init__(self):

        # =====================================================
        # BASE BACKEND DIRECTORY
        # =====================================================

        self.base_dir = os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )

        # =====================================================
        # TRACKING VIDEO DIRECTORY
        # =====================================================

        self.tracking_output_dir = os.path.join(
            self.base_dir,
            "runs",
            "detect",
            "tracked_video"
        )

        os.makedirs(
            self.tracking_output_dir,
            exist_ok=True
        )

        # =====================================================
        # HEATMAP DIRECTORY
        # =====================================================

        self.heatmap_output_dir = os.path.join(
            self.base_dir,
            "heatmap-output"
        )

        os.makedirs(
            self.heatmap_output_dir,
            exist_ok=True
        )
                # =====================================================
        # FFMPEG PATH
        # =====================================================

        self.ffmpeg_path = shutil.which("ffmpeg")
        # =====================================================
        # LOAD YOLOv8 NANO
        # =====================================================

        self.model = YOLO(
            "yolov8n.pt"
        )

        # =====================================================
        # HEATMAP GENERATOR
        # =====================================================

        self.heatmap_generator = HeatmapGenerator()

        # =====================================================
        # GAZE ESTIMATOR
        # =====================================================

        self.gaze_estimator = GazeEstimator()

        print("\n========================================")
        print("PERSON TRACKER INITIALIZED")
        print("========================================")

        print(
            "Tracking directory:",
            self.tracking_output_dir
        )

        print(
            "Heatmap directory:",
            self.heatmap_output_dir
        )

        print(
            "FFmpeg:",
            self.ffmpeg_path
        )

        print("Gaze estimation: ENABLED")
        print("Path tracking: ENABLED")

        print("========================================\n")

    # =========================================================
    # TRACK VIDEO
    # =========================================================

    def track_video(
        self,
        video_path,
        output_path=None
    ):

        print("\n========================================")
        print("STARTING VIDEO ANALYSIS")
        print("========================================")

        print(
            "Input video:",
            video_path
        )

        # =====================================================
        # CHECK INPUT VIDEO
        # =====================================================

        if not os.path.exists(video_path):

            raise Exception(
                f"Input video does not exist: {video_path}"
            )

        # =====================================================
        # OPEN VIDEO
        # =====================================================

        cap = cv2.VideoCapture(
            video_path
        )

        if not cap.isOpened():

            raise Exception(
                f"Could not open video: {video_path}"
            )

        # =====================================================
        # VIDEO INFORMATION
        # =====================================================

        fps = cap.get(
            cv2.CAP_PROP_FPS
        )

        if fps <= 0:
            fps = 25

        width = int(
            cap.get(
                cv2.CAP_PROP_FRAME_WIDTH
            )
        )

        height = int(
            cap.get(
                cv2.CAP_PROP_FRAME_HEIGHT
            )
        )

        total_video_frames = int(
            cap.get(
                cv2.CAP_PROP_FRAME_COUNT
            )
        )

        duration_seconds = (
            total_video_frames / fps
            if fps > 0
            else 0
        )

        print(
            "FPS:",
            fps
        )

        print(
            "Width:",
            width
        )

        print(
            "Height:",
            height
        )

        print(
            "Total video frames:",
            total_video_frames
        )

        print(
            "Duration:",
            round(duration_seconds, 2)
        )

        # =====================================================
        # READ FIRST FRAME
        # =====================================================

        ret, background_frame = cap.read()

        if not ret:

            cap.release()

            raise Exception(
                "Could not read first video frame."
            )

        background_frame = cv2.resize(
            background_frame,
            (width, height)
        )

        cap.release()

        # =====================================================
        # VIDEO NAME
        # =====================================================

        video_name = os.path.splitext(
            os.path.basename(video_path)
        )[0]

        # =====================================================
        # UNIQUE ANALYSIS ID
        # =====================================================

        analysis_timestamp = int(
            time.time() * 1000
        )

        output_video_name = (
            f"{video_name}_{analysis_timestamp}"
        )

        # =====================================================
        # IF OUTPUT PATH WAS PROVIDED
        # =====================================================

        if output_path:

            final_video = output_path

            output_video_name = os.path.splitext(
                os.path.basename(output_path)
            )[0]

        else:

            final_video = os.path.join(
                self.tracking_output_dir,
                f"{output_video_name}.mp4"
            )

        # =====================================================
        # TEMPORARY AVI
        # =====================================================

        temp_video = os.path.join(
            self.tracking_output_dir,
            f"{output_video_name}_temp.avi"
        )

        # =====================================================
        # HEATMAP FILE
        # =====================================================

        heatmap_file = os.path.join(
            self.heatmap_output_dir,
            f"{output_video_name}_heatmap.jpg"
        )

        # =====================================================
        # REMOVE EXISTING OUTPUTS
        # =====================================================

        for file_path in [
            temp_video,
            final_video,
            heatmap_file
        ]:

            if os.path.exists(file_path):

                try:
                    os.remove(file_path)

                except Exception:
                    pass

        # =====================================================
        # CREATE VIDEO WRITER
        # =====================================================

        fourcc = cv2.VideoWriter_fourcc(
            *"XVID"
        )

        writer = cv2.VideoWriter(
            temp_video,
            fourcc,
            fps,
            (width, height)
        )

        if not writer.isOpened():

            raise Exception(
                "Could not create temporary tracking video."
            )

        # =====================================================
        # TRACKING DATA
        # =====================================================

        person_frames = {}

        # =====================================================
        # ENTRY / EXIT MONITORING
        # =====================================================

        entry_count = 0
        exit_count = 0

        previous_positions = {}

        entry_exit_line_y = int(
            height * 0.5
        )

        # =====================================================
        # ALL PERSON POSITIONS
        # =====================================================

        person_positions = []

        # =====================================================
        # INDIVIDUAL SHOPPER PATHS
        # =====================================================

        person_paths = {}

        path_interval = 2

        # =====================================================
        # GAZE ANALYSIS DATA
        # =====================================================

        gaze_counts = {

            "LEFT": 0,
            "RIGHT": 0,
            "CENTER": 0,
            "UP": 0,
            "DOWN": 0,
            "UNKNOWN": 0

        }

        person_gaze = {}

        gaze_interval = 3

        frame_count = 0

        # =====================================================
        # YOLO + BYTE TRACK
        # =====================================================

        results = self.model.track(

            source=video_path,

            tracker="bytetrack.yaml",

            conf=0.5,

            persist=True,

            stream=True,

            verbose=False,

            classes=[0]

        )

        # =====================================================
        # PROCESS VIDEO FRAMES
        # =====================================================

        try:

            for result in results:

                frame_count += 1

                # =================================================
                # ORIGINAL FRAME
                # =================================================

                original_frame = result.orig_img.copy()

                original_frame = cv2.resize(
                    original_frame,
                    (width, height)
                )

                # =================================================
                # YOLO ANNOTATED FRAME
                # =================================================

                annotated_frame = result.plot()

                annotated_frame = cv2.resize(
                    annotated_frame,
                    (width, height)
                )

                # =================================================
                # NO TRACKED PEOPLE
                # =================================================

                if (
                    result.boxes is None
                    or result.boxes.id is None
                ):

                    writer.write(
                        annotated_frame
                    )

                    continue

                # =================================================
                # TRACKING IDS
                # =================================================

                track_ids = (
                    result.boxes.id
                    .int()
                    .cpu()
                    .tolist()
                )

                # =================================================
                # BOUNDING BOXES
                # =================================================

                boxes = (
                    result.boxes.xyxy
                    .cpu()
                    .numpy()
                )

                # =================================================
                # PROCESS EACH PERSON
                # =================================================

                for index, track_id in enumerate(track_ids):

                    if index >= len(boxes):
                        continue

                    # =================================================
                    # PERSON FRAME COUNT
                    # =================================================

                    if track_id not in person_frames:

                        person_frames[
                            track_id
                        ] = 0

                    person_frames[
                        track_id
                    ] += 1

                    # =================================================
                    # PERSON BOUNDING BOX
                    # =================================================

                    x1, y1, x2, y2 = boxes[index]

                    x1 = max(
                        0,
                        min(
                            width - 1,
                            int(x1)
                        )
                    )

                    y1 = max(
                        0,
                        min(
                            height - 1,
                            int(y1)
                        )
                    )

                    x2 = max(
                        0,
                        min(
                            width,
                            int(x2)
                        )
                    )

                    y2 = max(
                        0,
                        min(
                            height,
                            int(y2)
                        )
                    )

                    if (
                        x2 <= x1
                        or y2 <= y1
                    ):
                        continue

                    # =================================================
                    # PERSON CENTER
                    # =================================================

                    center_x = int(
                        (x1 + x2) / 2
                    )

                    center_y = int(
                        (y1 + y2) / 2
                    )

                    # =================================================
                    # ENTRY / EXIT DETECTION
                    # =================================================

                    if track_id in previous_positions:

                        previous_y = (
                            previous_positions[
                                track_id
                            ]
                        )

                        if (
                            previous_y >
                            entry_exit_line_y
                            and
                            center_y <=
                            entry_exit_line_y
                        ):

                            entry_count += 1

                        elif (
                            previous_y <
                            entry_exit_line_y
                            and
                            center_y >=
                            entry_exit_line_y
                        ):

                            exit_count += 1

                    previous_positions[
                        track_id
                    ] = center_y

                    # =================================================
                    # HEATMAP POSITION
                    # =================================================

                    person_positions.append(
                        (
                            center_x,
                            center_y
                        )
                    )

                    # =================================================
                    # INDIVIDUAL SHOPPER PATH
                    # =================================================

                    if track_id not in person_paths:

                        person_paths[
                            track_id
                        ] = []

                    if (
                        frame_count %
                        path_interval
                        == 0
                    ):

                        person_paths[
                            track_id
                        ].append(

                            {

                                "frame":
                                    frame_count,

                                "time_seconds":
                                    round(
                                        frame_count / fps,
                                        3
                                    ),

                                "x":
                                    center_x,

                                "y":
                                    center_y

                            }

                        )

                    # =================================================
                    # GAZE ESTIMATION
                    # =================================================

                    if (
                        frame_count %
                        gaze_interval
                        == 0
                    ):

                        person_crop = original_frame[
                            y1:y2,
                            x1:x2
                        ]

                        if person_crop.size > 0:

                            try:

                                gaze_results = (
                                    self.gaze_estimator.estimate(
                                        person_crop
                                    )
                                )

                                if gaze_results:

                                    crop_center_x = (
                                        x2 - x1
                                    ) / 2

                                    crop_center_y = (
                                        y2 - y1
                                    ) / 2

                                    best_gaze = min(

                                        gaze_results,

                                        key=lambda item:
                                        (

                                            (
                                                item["x"]
                                                -
                                                crop_center_x
                                            ) ** 2

                                            +

                                            (
                                                item["y"]
                                                -
                                                crop_center_y
                                            ) ** 2

                                        )

                                    )

                                    direction = (
                                        best_gaze.get(
                                            "gaze",
                                            "UNKNOWN"
                                        )
                                    )

                                    if direction not in gaze_counts:

                                        direction = "UNKNOWN"

                                    gaze_x = best_gaze.get(
                                        "gaze_x"
                                    )

                                    gaze_y = best_gaze.get(
                                        "gaze_y"
                                    )

                                    person_gaze[
                                        track_id
                                    ] = {

                                        "gaze":
                                            direction,

                                        "gaze_x":
                                            (
                                                round(
                                                    float(gaze_x),
                                                    3
                                                )
                                                if gaze_x is not None
                                                else None
                                            ),

                                        "gaze_y":
                                            (
                                                round(
                                                    float(gaze_y),
                                                    3
                                                )
                                                if gaze_y is not None
                                                else None
                                            )

                                    }

                                    gaze_counts[
                                        direction
                                    ] += 1

                                else:

                                    if track_id not in person_gaze:

                                        person_gaze[
                                            track_id
                                        ] = {

                                            "gaze":
                                                "UNKNOWN",

                                            "gaze_x":
                                                None,

                                            "gaze_y":
                                                None

                                        }

                            except Exception as gaze_error:

                                print(
                                    f"Gaze estimation failed "
                                    f"for person {track_id}: "
                                    f"{gaze_error}"
                                )

                                if track_id not in person_gaze:

                                    person_gaze[
                                        track_id
                                    ] = {

                                        "gaze":
                                            "UNKNOWN",

                                        "gaze_x":
                                            None,

                                        "gaze_y":
                                            None

                                    }

                    # =================================================
                    # GET CURRENT GAZE
                    # =================================================

                    gaze_info = person_gaze.get(

                        track_id,

                        {

                            "gaze":
                                "ANALYZING",

                            "gaze_x":
                                None,

                            "gaze_y":
                                None

                        }

                    )

                    gaze_direction = (
                        gaze_info.get(
                            "gaze",
                            "ANALYZING"
                        )
                    )

                    # =================================================
                    # GAZE LABEL
                    # =================================================

                    label = (
                        f"ID {track_id} | "
                        f"Gaze: {gaze_direction}"
                    )

                    label_y = max(
                        25,
                        y1 - 10
                    )

                    cv2.putText(

                        annotated_frame,

                        label,

                        (
                            x1,
                            label_y
                        ),

                        cv2.FONT_HERSHEY_SIMPLEX,

                        0.55,

                        (0, 255, 255),

                        2,

                        cv2.LINE_AA

                    )

                    # =================================================
                    # GAZE COORDINATES
                    # =================================================

                    gaze_x_normalized = (
                        gaze_info.get(
                            "gaze_x"
                        )
                    )

                    gaze_y_normalized = (
                        gaze_info.get(
                            "gaze_y"
                        )
                    )

                    # =================================================
                    # FACE POINT
                    # =================================================

                    if (
                        gaze_x_normalized is not None
                        and
                        gaze_y_normalized is not None
                    ):

                        face_point_x = int(

                            x1
                            +
                            gaze_x_normalized
                            *
                            (x2 - x1)

                        )

                        face_point_y = int(

                            y1
                            +
                            gaze_y_normalized
                            *
                            (y2 - y1)

                        )

                    else:

                        face_point_x = int(
                            (x1 + x2) / 2
                        )

                        face_point_y = int(

                            y1
                            +
                            (y2 - y1)
                            *
                            0.25

                        )

                    # =================================================
                    # KEEP POINT INSIDE VIDEO
                    # =================================================

                    face_point_x = max(

                        0,

                        min(
                            width - 1,
                            face_point_x
                        )

                    )

                    face_point_y = max(

                        0,

                        min(
                            height - 1,
                            face_point_y
                        )

                    )

                    # =================================================
                    # ARROW LENGTH
                    # =================================================

                    arrow_length = max(

                        35,

                        int(

                            min(
                                x2 - x1,
                                y2 - y1
                            )
                            *
                            0.35

                        )

                    )

                    # =================================================
                    # GAZE DIRECTIONS
                    # =================================================

                    direction_offsets = {

                        "LEFT":
                            (
                                -arrow_length,
                                0
                            ),

                        "RIGHT":
                            (
                                arrow_length,
                                0
                            ),

                        "UP":
                            (
                                0,
                                -arrow_length
                            ),

                        "DOWN":
                            (
                                0,
                                arrow_length
                            )

                    }

                    # =================================================
                    # DRAW FACE POINT
                    # =================================================

                    if gaze_direction != "ANALYZING":

                        cv2.circle(

                            annotated_frame,

                            (
                                face_point_x,
                                face_point_y
                            ),

                            6,

                            (0, 255, 255),

                            -1

                        )

                    # =================================================
                    # DRAW GAZE ARROW
                    # =================================================

                    if gaze_direction in direction_offsets:

                        dx, dy = (
                            direction_offsets[
                                gaze_direction
                            ]
                        )

                        arrow_end = (

                            face_point_x + dx,

                            face_point_y + dy

                        )

                        arrow_end = (

                            max(
                                0,
                                min(
                                    width - 1,
                                    arrow_end[0]
                                )
                            ),

                            max(
                                0,
                                min(
                                    height - 1,
                                    arrow_end[1]
                                )
                            )

                        )

                        cv2.arrowedLine(

                            annotated_frame,

                            (
                                face_point_x,
                                face_point_y
                            ),

                            arrow_end,

                            (0, 255, 255),

                            4,

                            cv2.LINE_AA,

                            tipLength=0.30

                        )

                    elif gaze_direction == "CENTER":

                        cv2.circle(

                            annotated_frame,

                            (
                                face_point_x,
                                face_point_y
                            ),

                            14,

                            (0, 255, 255),

                            3

                        )

                    elif gaze_direction == "UNKNOWN":

                        cv2.circle(

                            annotated_frame,

                            (
                                face_point_x,
                                face_point_y
                            ),

                            9,

                            (0, 165, 255),

                            2

                        )

                # =====================================================
                # ENTRY / EXIT LINE
                # =====================================================

                cv2.line(

                    annotated_frame,

                    (
                        0,
                        entry_exit_line_y
                    ),

                    (
                        width,
                        entry_exit_line_y
                    ),

                    (0, 255, 0),

                    3

                )

                cv2.putText(

                    annotated_frame,

                    "ENTRY / EXIT LINE",

                    (
                        20,
                        max(
                            25,
                            entry_exit_line_y - 10
                        )
                    ),

                    cv2.FONT_HERSHEY_SIMPLEX,

                    0.6,

                    (0, 255, 0),

                    2,

                    cv2.LINE_AA

                )

                # =====================================================
                # CURRENT SHOPPERS
                # =====================================================

                current_shoppers = max(

                    0,

                    entry_count - exit_count

                )

                cv2.putText(

                    annotated_frame,

                    f"ENTRY: {entry_count}",

                    (20, 115),

                    cv2.FONT_HERSHEY_SIMPLEX,

                    0.65,

                    (0, 255, 0),

                    2,

                    cv2.LINE_AA

                )

                cv2.putText(

                    annotated_frame,

                    f"EXIT: {exit_count}",

                    (20, 145),

                    cv2.FONT_HERSHEY_SIMPLEX,

                    0.65,

                    (0, 0, 255),

                    2,

                    cv2.LINE_AA

                )

                cv2.putText(

                    annotated_frame,

                    f"CURRENT SHOPPERS: {current_shoppers}",

                    (20, 175),

                    cv2.FONT_HERSHEY_SIMPLEX,

                    0.65,

                    (255, 255, 255),

                    2,

                    cv2.LINE_AA

                )

                # =====================================================
                # VIDEO INFORMATION
                # =====================================================

                cv2.putText(

                    annotated_frame,

                    "GAZE ESTIMATION: ON",

                    (20, 30),

                    cv2.FONT_HERSHEY_SIMPLEX,

                    0.65,

                    (0, 255, 255),

                    2,

                    cv2.LINE_AA

                )

                cv2.putText(

                    annotated_frame,

                    "PATH TRACKING: ON",

                    (20, 58),

                    cv2.FONT_HERSHEY_SIMPLEX,

                    0.55,

                    (0, 255, 255),

                    2,

                    cv2.LINE_AA

                )

                cv2.putText(

                    annotated_frame,

                    f"Frame: {frame_count}",

                    (20, 84),

                    cv2.FONT_HERSHEY_SIMPLEX,

                    0.55,

                    (255, 255, 255),

                    2,

                    cv2.LINE_AA

                )

                # =====================================================
                # WRITE FRAME
                # =====================================================

                writer.write(
                    annotated_frame
                )

        finally:

            writer.release()

        # =====================================================
        # FRAMES PROCESSED
        # =====================================================

        print(
            "Frames processed:",
            frame_count
        )

        # =====================================================
        # CHECK TEMPORARY VIDEO
        # =====================================================

        if not os.path.exists(temp_video):

            raise Exception(
                "Temporary tracking video was not created."
            )

        # =====================================================
        # CHECK FFMPEG
        # =====================================================
        if not self.ffmpeg_path:

            raise Exception(
                "FFmpeg was not found on the system."
            )
        # =====================================================
        # AVI -> MP4
        # =====================================================

        try:

            subprocess.run(

                [

                    self.ffmpeg_path,

                    "-y",

                    "-i",

                    temp_video,

                    "-c:v",

                    "libx264",

                    "-pix_fmt",

                    "yuv420p",

                    "-movflags",

                    "+faststart",

                    final_video

                ],

                check=True

            )

            print(
                "FFmpeg conversion successful."
            )

        except subprocess.CalledProcessError as e:

            print(
                "FFmpeg conversion failed:",
                e
            )

            raise Exception(
                "FFmpeg could not convert "
                "tracking video to MP4."
            )

        except Exception as e:

            print(
                "FFmpeg error:",
                str(e)
            )

            raise Exception(
                f"FFmpeg conversion error: {str(e)}"
            )

        # =====================================================
        # REMOVE TEMPORARY AVI
        # =====================================================

        if os.path.exists(temp_video):

            try:
                os.remove(temp_video)

            except Exception:
                pass

        # =====================================================
        # VERIFY FINAL MP4
        # =====================================================

        if not os.path.exists(final_video):

            raise Exception(
                "Final MP4 tracking video was not created."
            )

        # =====================================================
        # GENERATE HEATMAP
        # =====================================================

        try:

            self.heatmap_generator.generate_from_positions(

                width=width,

                height=height,

                positions=person_positions,

                background_frame=background_frame,

                output_path=heatmap_file

            )

            print(
                "Heatmap generated:",
                heatmap_file
            )

        except Exception as e:

            print(
                "Heatmap generation failed:",
                str(e)
            )

            heatmap_file = None

        # =====================================================
        # PER-PERSON DWELL TIME + PATH
        # =====================================================

        summary = {}

        for (
            track_id,
            frame_count_for_person
        ) in person_frames.items():

            dwell_time = (
                frame_count_for_person /
                fps
            )

            shopper_path = person_paths.get(
                track_id,
                []
            )

            summary[
                str(track_id)
            ] = {

                "frames_seen":
                    frame_count_for_person,

                "dwell_time_seconds":
                    round(
                        dwell_time,
                        2
                    ),

                "path":
                    shopper_path,

                "path_point_count":
                    len(shopper_path)

            }

        # =====================================================
        # PATH TRACKING SUMMARY
        # =====================================================

        total_path_points = sum(

            len(path)

            for path in person_paths.values()

        )

        # =====================================================
        # DWELL STATISTICS
        # =====================================================

        dwell_times = [

            data[
                "dwell_time_seconds"
            ]

            for data in summary.values()

        ]

        average_dwell_time = 0
        max_dwell_time = 0
        min_dwell_time = 0

        if dwell_times:

            average_dwell_time = round(

                sum(dwell_times)
                /
                len(dwell_times),

                2

            )

            max_dwell_time = round(

                max(dwell_times),

                2

            )

            min_dwell_time = round(

                min(dwell_times),

                2

            )

        # =====================================================
        # FILENAMES
        # =====================================================

        output_filename = os.path.basename(
            final_video
        )

        heatmap_filename = None

        if heatmap_file:

            heatmap_filename = os.path.basename(
                heatmap_file
            )

        # =====================================================
        # FINAL VERIFICATION
        # =====================================================

        print("\n========================================")
        print("ANALYSIS COMPLETE")
        print("========================================")

        print(
            "Tracking video exists:",
            os.path.exists(final_video)
        )

        print(
            "Unique people:",
            len(person_frames)
        )

        print(
            "Gaze counts:",
            gaze_counts
        )

        print(
            "Path points:",
            total_path_points
        )

        print(
            "Entry count:",
            entry_count
        )

        print(
            "Exit count:",
            exit_count
        )

        print(
            "Current shoppers:",
            max(
                0,
                entry_count - exit_count
            )
        )

        print("========================================\n")

        # =====================================================
        # FINAL RESULT
        #
        # IMPORTANT:
        # These wrapper sections make this tracker compatible
        # with analytics.py.
        # =====================================================

        return {

            # =================================================
            # VIDEO ANALYSIS
            # =================================================

            "video_analysis": {

                "video_width":
                    width,

                "video_height":
                    height,

                "fps":
                    round(
                        fps,
                        2
                    ),

                "total_frames":
                    total_video_frames,

                "frames_processed":
                    frame_count,

                "duration_seconds":
                    round(
                        duration_seconds,
                        2
                    )

            },

            # =================================================
            # DWELL ANALYSIS
            # =================================================

            "dwell_analysis": {

                "average_dwell_time_seconds":
                    average_dwell_time,

                "max_dwell_time_seconds":
                    max_dwell_time,

                "min_dwell_time_seconds":
                    min_dwell_time,

                "unique_people_tracked":
                    len(person_frames)

            },

            # =================================================
            # ENTRY / EXIT
            # =================================================

            "entry_exit": {

                "enabled":
                    True,

                "entry_count":
                    entry_count,

                "exit_count":
                    exit_count,

                "current_shoppers":
                    max(
                        0,
                        entry_count - exit_count
                    )

            },

            # =================================================
            # PATH TRACKING
            # =================================================

            "path_tracking": {

                "enabled":
                    True,

                "path_interval_frames":
                    path_interval,

                "total_path_points":
                    total_path_points,

                "people_with_paths":
                    len(person_paths)

            },

            # =================================================
            # GAZE ANALYSIS
            # =================================================

            "gaze_analysis": {

                "gaze_directions":
                    gaze_counts,

                "people_gaze": {

                    str(track_id): data

                    for (
                        track_id,
                        data
                    )
                    in person_gaze.items()

                }

            },

            # =================================================
            # PEOPLE
            # =================================================

            "people":
                summary,

            # =================================================
            # TRACKING VIDEO
            # =================================================

            "tracking_video":

                f"/tracking-output/"
                f"{output_filename}"
                f"?v={analysis_timestamp}",

            # =================================================
            # HEATMAP
            # =================================================

            "heatmap":

                (
                    f"/heatmap-output/"
                    f"{heatmap_filename}"
                    if heatmap_filename
                    else None
                ),

            # =================================================
            # ANALYSIS METADATA
            # =================================================

            "analysis_id":
                analysis_timestamp

        }

