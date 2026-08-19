"""Move zone/shelf ROI polygons out of camera_zones/shelves into dedicated
camera_zone_rois and camera_shelf_rois tables keyed by camera_id.
"""

from alembic import op
import sqlalchemy as sa


revision = "003_camera_zone_shelf_rois"
down_revision = "002_supported_report_types"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "camera_zone_rois",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("camera_id", sa.Integer(), nullable=False),
        sa.Column("zone_id", sa.Integer(), nullable=False),
        sa.Column("polygon_coordinates", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["camera_id"], ["cameras.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["zone_id"], ["camera_zones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("zone_id"),
    )
    op.create_table(
        "camera_shelf_rois",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("camera_id", sa.Integer(), nullable=False),
        sa.Column("shelf_id", sa.Integer(), nullable=False),
        sa.Column("polygon_coordinates", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["camera_id"], ["cameras.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["shelf_id"], ["shelves.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("shelf_id"),
    )

    # Backfill from the legacy inline roi columns, then drop them.
    op.execute(sa.text("""
        INSERT INTO camera_zone_rois (camera_id, zone_id, polygon_coordinates)
        SELECT camera_id, id, roi FROM camera_zones WHERE roi IS NOT NULL
    """))
    op.execute(sa.text("""
        INSERT INTO camera_shelf_rois (camera_id, shelf_id, polygon_coordinates)
        SELECT cz.camera_id, s.id, s.roi
        FROM shelves s JOIN camera_zones cz ON cz.id = s.zone_id
        WHERE s.roi IS NOT NULL
    """))
    op.alter_column("camera_zones", "roi", nullable=True)
    op.drop_column("camera_zones", "roi")
    op.drop_column("shelves", "roi")


def downgrade():
    op.add_column("camera_zones", sa.Column("roi", sa.JSON(), nullable=True))
    op.add_column("shelves", sa.Column("roi", sa.JSON(), nullable=True))
    op.execute(sa.text("""
        UPDATE camera_zones SET roi = r.polygon_coordinates
        FROM camera_zone_rois r WHERE r.zone_id = camera_zones.id
    """))
    op.execute(sa.text("""
        UPDATE shelves SET roi = r.polygon_coordinates
        FROM camera_shelf_rois r WHERE r.shelf_id = shelves.id
    """))
    op.drop_table("camera_shelf_rois")
    op.drop_table("camera_zone_rois")
