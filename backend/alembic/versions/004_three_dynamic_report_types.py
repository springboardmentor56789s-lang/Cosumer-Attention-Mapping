"""Restrict report definitions to the three pipeline-supported report types."""

from alembic import op
import sqlalchemy as sa


revision = "004_three_dynamic_report_types"
down_revision = "003_camera_zone_shelf_rois"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint("ck_reports_supported_report_type", "reports", type_="check")
    op.execute(sa.text("DELETE FROM reports WHERE report_type NOT IN ('consumer_attention', 'product_engagement', 'shelf_performance')"))
    op.create_check_constraint(
        "ck_reports_supported_report_type",
        "reports",
        "report_type IN ('consumer_attention', 'product_engagement', 'shelf_performance')",
    )


def downgrade():
    op.drop_constraint("ck_reports_supported_report_type", "reports", type_="check")
    op.create_check_constraint(
        "ck_reports_supported_report_type",
        "reports",
        "report_type IN ('consumer_attention', 'product_engagement', 'shelf_performance', 'conversion', 'marketing_effectiveness')",
    )