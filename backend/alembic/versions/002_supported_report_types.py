"""Replace legacy report types with the five supported reports."""

from alembic import op
import sqlalchemy as sa


revision = "002_supported_report_types"
down_revision = "001_initial_production_schema"
branch_labels = None
depends_on = None


_TYPES = "'consumer_attention', 'product_engagement', 'shelf_performance', 'conversion', 'marketing_effectiveness'"


def upgrade():
    op.execute(sa.text(f"DELETE FROM reports WHERE report_type NOT IN ({_TYPES})"))
    op.create_check_constraint(
        "ck_reports_supported_report_type", "reports",
        f"report_type IN ({_TYPES})",
    )


def downgrade():
    op.drop_constraint("ck_reports_supported_report_type", "reports", type_="check")
