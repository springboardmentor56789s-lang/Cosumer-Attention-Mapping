from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        'stores',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('store_name', sa.String(length=100), nullable=False),
        sa.Column('location', sa.String(length=150), nullable=True),
        sa.Column('manager_name', sa.String(length=100), nullable=True),
        sa.Column('logo_url', sa.String(length=255), nullable=True),
        sa.Column('theme', sa.String(length=50), nullable=True),
        sa.Column('total_shelves', sa.Integer(), nullable=True),
        sa.Column('total_cameras', sa.Integer(), nullable=True),
        sa.Column('is_live_store', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=True),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_table(
        'shelves',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('shelf_name', sa.String(length=100), nullable=False),
        sa.Column('shelf_number', sa.String(length=20), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('aisle', sa.String(length=50), nullable=True),
        sa.Column('capacity', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('shelf_number')
    )
    op.create_table(
        'products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('sku', sa.String(), nullable=False),
        sa.Column('shelf_id', sa.Integer(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['shelf_id'], ['shelves.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sku')
    )
    op.create_table(
        'cameras',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('camera_name', sa.String(length=100), nullable=True),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('rtsp_url', sa.String(), nullable=True),
        sa.Column('location', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('camera_type', sa.String(length=20), nullable=True),
        sa.Column('fps', sa.Float(), nullable=True),
        sa.Column('processing_status', sa.String(length=30), nullable=True),
        sa.Column('current_detection_status', sa.String(length=30), nullable=True),
        sa.Column('video_path', sa.String(length=255), nullable=True),
        sa.Column('last_active_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('installed_on', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('camera_id', sa.Integer(), nullable=False),
        sa.Column('shelf_id', sa.Integer(), nullable=True),
        sa.Column('viewed_product', sa.String(length=100), nullable=True),
        sa.Column('dwell_time', sa.Float(), nullable=True),
        sa.Column('attention_score', sa.Float(), nullable=True),
        sa.Column('distance_to_shelf', sa.Float(), nullable=True),
        sa.Column('face_direction', sa.String(length=50), nullable=True),
        sa.Column('head_angle', sa.Float(), nullable=True),
        sa.Column('looking_at_shelf', sa.Boolean(), nullable=True),
        sa.Column('looking_at_product', sa.Boolean(), nullable=True),
        sa.Column('walking_speed', sa.Float(), nullable=True),
        sa.Column('customer_path', sa.String(length=500), nullable=True),
        sa.Column('visit_time', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['camera_id'], ['cameras.id']),
        sa.ForeignKeyConstraint(['shelf_id'], ['shelves.id']),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'customer_tracks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('camera_id', sa.Integer(), nullable=False),
        sa.Column('shelf_id', sa.Integer(), nullable=True),
        sa.Column('product_viewed', sa.String(length=100), nullable=True),
        sa.Column('entry_time', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('exit_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('dwell_time', sa.Float(), nullable=True),
        sa.Column('distance_to_shelf', sa.Float(), nullable=True),
        sa.Column('face_direction', sa.String(length=50), nullable=True),
        sa.Column('head_angle', sa.Float(), nullable=True),
        sa.Column('looking_at_shelf', sa.Boolean(), nullable=True),
        sa.Column('looking_at_product', sa.Boolean(), nullable=True),
        sa.Column('walking_speed', sa.Float(), nullable=True),
        sa.Column('customer_path', sa.String(length=500), nullable=True),
        sa.Column('attention_score', sa.Float(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['camera_id'], ['cameras.id']),
        sa.ForeignKeyConstraint(['shelf_id'], ['shelves.id']),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'heatmaps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('camera_id', sa.Integer(), nullable=False),
        sa.Column('shelf_id', sa.Integer(), nullable=True),
        sa.Column('coordinates', sa.JSON(), nullable=True),
        sa.Column('heatmap_type', sa.String(length=30), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['camera_id'], ['cameras.id']),
        sa.ForeignKeyConstraint(['shelf_id'], ['shelves.id']),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=True),
        sa.Column('report_name', sa.String(length=100), nullable=False),
        sa.Column('report_type', sa.String(length=50), nullable=False),
        sa.Column('filters', sa.JSON(), nullable=True),
        sa.Column('file_path', sa.String(length=255), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('store_name', sa.String(length=100), nullable=True),
        sa.Column('logo_url', sa.String(length=255), nullable=True),
        sa.Column('theme', sa.String(length=50), nullable=True),
        sa.Column('jwt_expiry_minutes', sa.Integer(), nullable=True),
        sa.Column('notification_enabled', sa.Boolean(), nullable=True),
        sa.Column('camera_detection_threshold', sa.Float(), nullable=True),
        sa.Column('yolo_confidence', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id']),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('settings')
    op.drop_table('reports')
    op.drop_table('heatmaps')
    op.drop_table('customer_tracks')
    op.drop_table('analytics')
    op.drop_table('cameras')
    op.drop_table('products')
    op.drop_table('shelves')
    op.drop_table('users')
    op.drop_table('stores')
