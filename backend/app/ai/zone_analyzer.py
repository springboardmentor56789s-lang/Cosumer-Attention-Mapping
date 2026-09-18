# app/ai/zone_analyzer.py


class ZoneAnalyzer:

    def __init__(
        self,
        rows=2,
        columns=3
    ):

        self.rows = max(
            1,
            int(rows)
        )

        self.columns = max(
            1,
            int(columns)
        )

    # =========================================================
    # GET ZONE
    # =========================================================

    def get_zone(
        self,
        x,
        y,
        width,
        height
    ):

        if width <= 0 or height <= 0:
            return "UNKNOWN"

        column_width = (
            width /
            self.columns
        )

        row_height = (
            height /
            self.rows
        )

        column = int(
            x /
            column_width
        )

        row = int(
            y /
            row_height
        )

        column = max(
            0,
            min(
                self.columns - 1,
                column
            )
        )

        row = max(
            0,
            min(
                self.rows - 1,
                row
            )
        )

        zone_number = (
            row *
            self.columns
            +
            column
            +
            1
        )

        return f"Zone {zone_number}"

    # =========================================================
    # ANALYZE PEOPLE
    # =========================================================

    def analyze_people(
        self,
        people,
        width,
        height
    ):

        zones = {}

        if not isinstance(
            people,
            dict
        ):
            return zones

        for shopper_id, person in people.items():

            if not isinstance(
                person,
                dict
            ):
                continue

            path = person.get(
                "path",
                []
            )

            if not isinstance(
                path,
                list
            ):
                continue

            zone_counts = {}

            for point in path:

                if not isinstance(
                    point,
                    dict
                ):
                    continue

                try:

                    x = float(
                        point.get(
                            "x",
                            0
                        )
                    )

                    y = float(
                        point.get(
                            "y",
                            0
                        )
                    )

                except (
                    TypeError,
                    ValueError
                ):

                    continue

                zone = self.get_zone(
                    x,
                    y,
                    width,
                    height
                )

                zone_counts[zone] = (
                    zone_counts.get(
                        zone,
                        0
                    )
                    +
                    1
                )

            if not zone_counts:
                continue

            primary_zone = max(
                zone_counts,
                key=zone_counts.get
            )

            zones[str(shopper_id)] = {

                "primary_zone":
                    primary_zone,

                "zones_visited":
                    list(
                        zone_counts.keys()
                    ),

                "zone_visit_points":
                    zone_counts,

                "total_zone_points":
                    sum(
                        zone_counts.values()
                    )
            }

        return zones

    # =========================================================
    # SUMMARY
    # =========================================================

    def summarize_zones(
        self,
        people,
        width,
        height
    ):

        person_zones = (
            self.analyze_people(
                people,
                width,
                height
            )
        )

        zone_summary = {}

        # Create all configured zones.
        for row in range(
            self.rows
        ):

            for column in range(
                self.columns
            ):

                zone_number = (
                    row *
                    self.columns
                    +
                    column
                    +
                    1
                )

                zone_name = (
                    f"Zone {zone_number}"
                )

                zone_summary[
                    zone_name
                ] = {

                    "unique_shoppers":
                        0,

                    "visit_points":
                        0,

                    "shoppers":
                        []
                }

        # Add shopper information.
        for (
            shopper_id,
            data
        ) in person_zones.items():

            primary_zone = data.get(
                "primary_zone"
            )

            if not primary_zone:
                continue

            if primary_zone not in zone_summary:
                zone_summary[
                    primary_zone
                ] = {

                    "unique_shoppers":
                        0,

                    "visit_points":
                        0,

                    "shoppers":
                        []
                }

            zone_summary[
                primary_zone
            ][
                "unique_shoppers"
            ] += 1

            zone_summary[
                primary_zone
            ][
                "visit_points"
            ] += data.get(
                "total_zone_points",
                0
            )

            zone_summary[
                primary_zone
            ][
                "shoppers"
            ].append(
                str(shopper_id)
            )

        # -----------------------------------------------------
        # Find most visited zone.
        # -----------------------------------------------------

        most_visited_zone = None
        highest_visit_points = 0

        for (
            zone_name,
            data
        ) in zone_summary.items():

            visit_points = data.get(
                "visit_points",
                0
            )

            if visit_points > highest_visit_points:

                highest_visit_points = (
                    visit_points
                )

                most_visited_zone = (
                    zone_name
                )

        return {

            "status":
                "available",

            "zone_count":
                self.rows *
                self.columns,

            "configured_rows":
                self.rows,

            "configured_columns":
                self.columns,

            "most_visited_zone":
                most_visited_zone,

            "highest_zone_visit_points":
                highest_visit_points,

            "zones":
                zone_summary,

            "shopper_zone_details":
                person_zones
        }