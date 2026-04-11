"""Create video call tables

Revision ID: 001_create_video_calls
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_create_video_calls'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Upgrade database schema - Create video call related tables
    """
    
    # Create VideoCall table
    op.create_table(
        'video_calls',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('caller_id', sa.Integer(), nullable=False),
        sa.Column('recipient_id', sa.Integer(), nullable=False),
        sa.Column('scheduled_time', sa.DateTime(), nullable=False),
        sa.Column('duration', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('room_id', sa.String(length=255), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['caller_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indices for VideoCall table
    op.create_index('ix_video_calls_caller_id', 'video_calls', ['caller_id'], unique=False)
    op.create_index('ix_video_calls_recipient_id', 'video_calls', ['recipient_id'], unique=False)
    op.create_index('ix_video_calls_scheduled_time', 'video_calls', ['scheduled_time'], unique=False)
    op.create_index('ix_video_calls_status', 'video_calls', ['status'], unique=False)
    op.create_index('ix_video_calls_room_id', 'video_calls', ['room_id'], unique=True)

    # Create UserAvailability table
    op.create_table(
        'user_availability',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('timezone', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indices for UserAvailability table
    op.create_index('ix_user_availability_user_id', 'user_availability', ['user_id'], unique=False)

    # Create CallRating table
    op.create_table(
        'call_ratings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('call_id', sa.Integer(), nullable=False),
        sa.Column('rater_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('is_professional', sa.Boolean(), nullable=False),
        sa.Column('would_recommend', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['call_id'], ['video_calls.id'], ),
        sa.ForeignKeyConstraint(['rater_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indices for CallRating table
    op.create_index('ix_call_ratings_call_id', 'call_ratings', ['call_id'], unique=False)
    op.create_index('ix_call_ratings_rater_id', 'call_ratings', ['rater_id'], unique=False)

    # Add new columns to users table (if they don't exist)
    # These columns track video call settings for users
    try:
        op.add_column('users', sa.Column('is_available_for_calls', sa.Boolean(), nullable=False, server_default='0'))
    except:
        pass  # Column might already exist
    
    try:
        op.add_column('users', sa.Column('timezone', sa.String(length=50), nullable=True, server_default='UTC'))
    except:
        pass  # Column might already exist


def downgrade() -> None:
    """
    Downgrade database schema - Drop video call related tables
    """
    
    # Drop indices
    op.drop_index('ix_call_ratings_rater_id', table_name='call_ratings')
    op.drop_index('ix_call_ratings_call_id', table_name='call_ratings')
    
    op.drop_index('ix_user_availability_user_id', table_name='user_availability')
    
    op.drop_index('ix_video_calls_room_id', table_name='video_calls')
    op.drop_index('ix_video_calls_status', table_name='video_calls')
    op.drop_index('ix_video_calls_scheduled_time', table_name='video_calls')
    op.drop_index('ix_video_calls_recipient_id', table_name='video_calls')
    op.drop_index('ix_video_calls_caller_id', table_name='video_calls')
    
    # Drop tables
    op.drop_table('call_ratings')
    op.drop_table('user_availability')
    op.drop_table('video_calls')
    
    # Remove columns from users table (optional - comment out if you want to keep them)
    # op.drop_column('users', 'is_available_for_calls')
    # op.drop_column('users', 'timezone')
