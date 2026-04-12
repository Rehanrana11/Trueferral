"""Create all tables

Revision ID: 001_initial
Revises: 0001
Create Date: 2026-04-12
"""
from alembic import op
import sqlalchemy as sa

revision = "001_initial"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("username", sa.String(255), nullable=False, unique=True),
        sa.Column("first_name", sa.String(255), nullable=True),
        sa.Column("last_name", sa.String(255), nullable=True),
        sa.Column("timezone", sa.String(50), nullable=False, server_default="UTC"),
        sa.Column("is_available_for_calls", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_table(
        "video_calls",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("caller_id", sa.Integer(), nullable=False),
        sa.Column("recipient_id", sa.Integer(), nullable=False),
        sa.Column("scheduled_time", sa.DateTime(), nullable=False),
        sa.Column("duration", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("room_id", sa.String(255), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["caller_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["recipient_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_table(
        "user_availability",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("day_of_week", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("timezone", sa.String(50), nullable=False, server_default="UTC"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_table(
        "call_ratings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("call_id", sa.Integer(), nullable=False),
        sa.Column("rater_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("feedback", sa.Text(), nullable=True),
        sa.Column("is_professional", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("would_recommend", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["call_id"], ["video_calls.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["rater_id"], ["users.id"], ondelete="CASCADE"),
    )


def downgrade():
    op.drop_table("call_ratings")
    op.drop_table("user_availability")
    op.drop_table("video_calls")
    op.drop_table("users")