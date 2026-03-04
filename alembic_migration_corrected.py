"""Add video call feature tables

Revision ID: 002_add_video_calls
Revises: [PREVIOUS_REVISION_ID]
Create Date: 2024-02-24 00:00:00.000000

IMPORTANT: Update 'down_revision' below with your latest migration ID
Example: If your latest migration is '001_initial_setup.py', 
         set down_revision = '001_initial_setup'
"""
from alembic import op
import sqlalchemy as sa


# ============================================
# INSTRUCTIONS:
# 1. Check alembic/versions/ for your latest migration file
# 2. Copy the revision ID from that file (e.g., '001_initial_setup')
# 3. Replace the down_revision value below with that ID
# 4. Remove this comment block after updating
# ============================================

revision = '002_add_video_calls'
down_revision = None  # ← UPDATE THIS: Replace with your latest migration ID
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Upgrade: Add video call feature tables
    Creates three new tables for video call management:
    - video_calls: Stores scheduled video calls
    - user_availability: Stores user availability slots
    - call_ratings: Stores call ratings and feedback
    """
    
    # ===== Create video_calls table =====
    op.create_table(
        'video_calls',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('caller_id', sa.Integer(), nullable=False),
        sa.Column('recipient_id', sa.Integer(), nullable=False),
        sa.Column('scheduled_time', sa.DateTime(), nullable=False),
        sa.Column('duration', sa.Integer(), nullable=False),  # in minutes
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('room_id', sa.String(length=255), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['caller_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        comment='Video call records between users'
    )
    
    # Create indices for video_calls table (for query performance)
    op.create_index('ix_video_calls_caller_id', 'video_calls', ['caller_id'], unique=False)
    op.create_index('ix_video_calls_recipient_id', 'video_calls', ['recipient_id'], unique=False)
    op.create_index('ix_video_calls_scheduled_time', 'video_calls', ['scheduled_time'], unique=False)
    op.create_index('ix_video_calls_status', 'video_calls', ['status'], unique=False)
    op.create_index('ix_video_calls_room_id', 'video_calls', ['room_id'], unique=True)

    # ===== Create user_availability table =====
    op.create_table(
        'user_availability',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),  # 0=Monday, 6=Sunday
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('timezone', sa.String(length=50), nullable=False, server_default='UTC'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        comment='User availability slots for video calls'
    )
    
    # Create index for user_availability table
    op.create_index('ix_user_availability_user_id', 'user_availability', ['user_id'], unique=False)

    # ===== Create call_ratings table =====
    op.create_table(
        'call_ratings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('call_id', sa.Integer(), nullable=False),
        sa.Column('rater_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),  # 1-5 stars
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('is_professional', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('would_recommend', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['call_id'], ['video_calls.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['rater_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        comment='Ratings and reviews for video calls'
    )
    
    # Create indices for call_ratings table
    op.create_index('ix_call_ratings_call_id', 'call_ratings', ['call_id'], unique=False)
    op.create_index('ix_call_ratings_rater_id', 'call_ratings', ['rater_id'], unique=False)

    # ===== Add columns to existing users table =====
    # These columns are needed for video call features
    # Using try/except to handle if columns already exist
    
    try:
        op.add_column('users', 
            sa.Column('timezone', sa.String(length=50), nullable=True, server_default='UTC'),
            schema=None
        )
    except Exception as e:
        # Column might already exist or syntax error
        pass
    
    try:
        op.add_column('users', 
            sa.Column('is_available_for_calls', sa.Boolean(), nullable=False, server_default='0'),
            schema=None
        )
    except Exception as e:
        # Column might already exist
        pass


def downgrade() -> None:
    """
    Downgrade: Remove video call feature tables
    Safely removes all video call related tables and reverts user model changes
    """
    
    # Drop indices (in reverse order of creation)
    try:
        op.drop_index('ix_call_ratings_rater_id', table_name='call_ratings')
    except:
        pass
    
    try:
        op.drop_index('ix_call_ratings_call_id', table_name='call_ratings')
    except:
        pass
    
    try:
        op.drop_index('ix_user_availability_user_id', table_name='user_availability')
    except:
        pass
    
    try:
        op.drop_index('ix_video_calls_room_id', table_name='video_calls')
    except:
        pass
    
    try:
        op.drop_index('ix_video_calls_status', table_name='video_calls')
    except:
        pass
    
    try:
        op.drop_index('ix_video_calls_scheduled_time', table_name='video_calls')
    except:
        pass
    
    try:
        op.drop_index('ix_video_calls_recipient_id', table_name='video_calls')
    except:
        pass
    
    try:
        op.drop_index('ix_video_calls_caller_id', table_name='video_calls')
    except:
        pass
    
    # Drop tables (in reverse order of creation)
    try:
        op.drop_table('call_ratings')
    except:
        pass
    
    try:
        op.drop_table('user_availability')
    except:
        pass
    
    try:
        op.drop_table('video_calls')
    except:
        pass
    
    # Optional: Remove columns from users table (commented out by default)
    # Uncomment if you want to remove these columns during downgrade
    # try:
    #     op.drop_column('users', 'is_available_for_calls')
    # except:
    #     pass
    # 
    # try:
    #     op.drop_column('users', 'timezone')
    # except:
    #     pass
