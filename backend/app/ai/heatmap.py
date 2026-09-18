# app/ai/heatmap.py

import cv2
import numpy as np
import os


class HeatmapGenerator:

    # =========================================================
    # INITIALIZATION
    # =========================================================

    def __init__(self):

        # Size of each shopper activity point
        self.point_radius = 35

        # Gaussian blur strength
        self.blur_sigma = 30

        # Heatmap transparency
        self.overlay_alpha = 0.55

        # Minimum heat value before showing overlay
        self.heat_threshold = 0.03

        print("========================================")
        print("HEATMAP GENERATOR INITIALIZED")
        print("========================================")
        print("Point radius:", self.point_radius)
        print("Blur sigma:", self.blur_sigma)
        print("Overlay alpha:", self.overlay_alpha)
        print("========================================")

    # =========================================================
    # SAFE VALUE
    # =========================================================

    def _safe_int(self, value, default=0):

        try:
            return int(value)

        except (
            TypeError,
            ValueError
        ):

            return default

    # =========================================================
    # GENERATE HEATMAP
    # =========================================================

    def generate_from_positions(
        self,
        width,
        height,
        positions,
        background_frame=None,
        output_path=None
    ):

        # -----------------------------------------------------
        # VALID DIMENSIONS
        # -----------------------------------------------------

        width = self._safe_int(width)
        height = self._safe_int(height)

        if width <= 0 or height <= 0:

            raise ValueError(
                "Invalid heatmap dimensions."
            )

        # -----------------------------------------------------
        # CHECK POSITIONS
        # -----------------------------------------------------

        if not positions:

            print(
                "No shopper positions available "
                "for heatmap."
            )

            return None

        print(
            "Generating heatmap from",
            len(positions),
            "shopper positions..."
        )

        # =====================================================
        # CREATE EMPTY HEAT MAP
        # =====================================================

        heat = np.zeros(
            (
                height,
                width
            ),
            dtype=np.float32
        )

        # =====================================================
        # ADD SHOPPER POSITIONS
        # =====================================================

        valid_positions = 0

        for position in positions:

            if position is None:
                continue

            # -------------------------------------------------
            # SUPPORT:
            #
            # (x, y)
            #
            # [x, y]
            #
            # {"x": x, "y": y}
            # -------------------------------------------------

            try:

                if isinstance(
                    position,
                    dict
                ):

                    x = int(
                        position.get(
                            "x",
                            0
                        )
                    )

                    y = int(
                        position.get(
                            "y",
                            0
                        )
                    )

                else:

                    x = int(
                        position[0]
                    )

                    y = int(
                        position[1]
                    )

            except (
                TypeError,
                ValueError,
                IndexError,
                KeyError
            ):

                continue

            # -------------------------------------------------
            # KEEP INSIDE FRAME
            # -------------------------------------------------

            x = max(
                0,
                min(
                    width - 1,
                    x
                )
            )

            y = max(
                0,
                min(
                    height - 1,
                    y
                )
            )

            # -------------------------------------------------
            # ADD ACTIVITY POINT
            # -------------------------------------------------

            cv2.circle(

                heat,

                (
                    x,
                    y
                ),

                self.point_radius,

                1.0,

                -1
            )

            valid_positions += 1

        # =====================================================
        # CHECK VALID POSITIONS
        # =====================================================

        if valid_positions == 0:

            print(
                "No valid shopper positions "
                "were found."
            )

            return None

        print(
            "Valid heatmap positions:",
            valid_positions
        )

        # =====================================================
        # BLUR HEAT
        # =====================================================

        heat = cv2.GaussianBlur(

            heat,

            (
                0,
                0
            ),

            self.blur_sigma
        )

        # =====================================================
        # NORMALIZE
        # =====================================================

        maximum = float(
            heat.max()
        )

        if maximum > 0:

            heat = (
                heat /
                maximum
            )

        # =====================================================
        # CONVERT TO 8 BIT
        # =====================================================

        heat_uint8 = np.uint8(
            np.clip(
                heat * 255,
                0,
                255
            )
        )

        # =====================================================
        # APPLY COLOR MAP
        # =====================================================

        colored_heatmap = cv2.applyColorMap(

            heat_uint8,

            cv2.COLORMAP_JET
        )

        # =====================================================
        # BACKGROUND OVERLAY
        # =====================================================

        if background_frame is not None:

            background = cv2.resize(

                background_frame,

                (
                    width,
                    height
                )
            )

            # -----------------------------------------------
            # CREATE HEAT MASK
            # -----------------------------------------------

            mask = (
                heat >
                self.heat_threshold
            )

            mask_uint8 = np.uint8(
                mask * 255
            )

            # -----------------------------------------------
            # SMOOTH MASK
            # -----------------------------------------------

            mask_uint8 = cv2.GaussianBlur(

                mask_uint8,

                (
                    0,
                    0
                ),

                3
            )

            # -----------------------------------------------
            # ALPHA MAP
            # -----------------------------------------------

            alpha_map = (

                mask_uint8.astype(
                    np.float32
                )

                /

                255.0
            )

            alpha_map *= (
                self.overlay_alpha
            )

            alpha_map = alpha_map[
                ...,
                np.newaxis
            ]

            # -----------------------------------------------
            # FLOAT CONVERSION
            # -----------------------------------------------

            background_float = (
                background.astype(
                    np.float32
                )
            )

            heat_float = (
                colored_heatmap.astype(
                    np.float32
                )
            )

            # -----------------------------------------------
            # BLEND
            # -----------------------------------------------

            result = (

                background_float *
                (
                    1.0 -
                    alpha_map
                )

                +

                heat_float *
                alpha_map
            )

            result = np.uint8(

                np.clip(

                    result,

                    0,

                    255
                )
            )

        else:

            result = colored_heatmap

        # =====================================================
        # TITLE BAR
        # =====================================================

        title_height = 70

        cv2.rectangle(

            result,

            (
                0,
                0
            ),

            (
                width,
                title_height
            ),

            (
                0,
                0,
                0
            ),

            -1
        )

        # =====================================================
        # TITLE
        # =====================================================

        cv2.putText(

            result,

            "CUSTOMER MOVEMENT HEATMAP",

            (
                25,
                43
            ),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.9,

            (
                255,
                255,
                255
            ),

            2,

            cv2.LINE_AA
        )

        # =====================================================
        # HEATMAP LEGEND
        # =====================================================

        legend_width = min(
            260,
            max(
                100,
                width - 60
            )
        )

        legend_height = 22

        legend_x = max(
            10,
            width -
            legend_width -
            25
        )

        legend_y = 20

        # -----------------------------------------------------
        # CREATE GRADIENT
        # -----------------------------------------------------

        gradient = np.linspace(

            255,

            0,

            legend_width

        ).astype(
            np.uint8
        )

        gradient = np.tile(

            gradient,

            (
                legend_height,
                1
            )
        )

        gradient_color = cv2.applyColorMap(

            gradient,

            cv2.COLORMAP_JET
        )

        # -----------------------------------------------------
        # DRAW LEGEND
        # -----------------------------------------------------

        if (
            legend_y +
            legend_height
            <= height
            and
            legend_x +
            legend_width
            <= width
        ):

            result[
                legend_y:
                legend_y +
                legend_height,

                legend_x:
                legend_x +
                legend_width
            ] = gradient_color

        # =====================================================
        # LEGEND LABELS
        # =====================================================

        cv2.putText(

            result,

            "LOW",

            (
                legend_x,
                legend_y + 48
            ),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.55,

            (
                255,
                255,
                255
            ),

            2,

            cv2.LINE_AA
        )

        cv2.putText(

            result,

            "HIGH",

            (
                legend_x +
                legend_width -
                55,

                legend_y + 48
            ),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.55,

            (
                255,
                255,
                255
            ),

            2,

            cv2.LINE_AA
        )

        # =====================================================
        # ACTIVITY INFORMATION
        # =====================================================

        cv2.putText(

            result,

            f"SHOPPER POSITIONS: {valid_positions}",

            (
                25,
                height - 25
            ),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.60,

            (
                255,
                255,
                255
            ),

            2,

            cv2.LINE_AA
        )

        # =====================================================
        # SAVE IMAGE
        # =====================================================

        if output_path:

            output_directory = os.path.dirname(
                output_path
            )

            if output_directory:

                os.makedirs(

                    output_directory,

                    exist_ok=True
                )

            success = cv2.imwrite(

                output_path,

                result
            )

            if not success:

                raise Exception(

                    "Failed to save heatmap: "

                    f"{output_path}"
                )

            print(
                "Heatmap saved:",
                output_path
            )

        # =====================================================
        # RETURN IMAGE
        # =====================================================

        return result

    # =========================================================
    # COMPATIBILITY METHOD
    # =========================================================
    #
    # Some versions of analytics.py / PersonTracker may call:
    #
    #     generate_heatmap(...)
    #
    # Your current implementation uses:
    #
    #     generate_from_positions(...)
    #
    # This wrapper supports BOTH.
    # =========================================================

    def generate_heatmap(
        self,
        width,
        height,
        positions,
        background_frame=None,
        output_path=None
    ):

        return self.generate_from_positions(

            width=width,

            height=height,

            positions=positions,

            background_frame=background_frame,

            output_path=output_path
        )