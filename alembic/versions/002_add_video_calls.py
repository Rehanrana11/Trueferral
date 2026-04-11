"""Add video call feature tables

Revision ID: 002_add_video_calls
Revises: 0001
Create Date: 2026-02-01 00:00:00.000000
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "002_add_video_calls"
down_revision = "0001"        # fixed: was None
branch_labels = None
depends_on = None


def upgrade() -> None:
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
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "video_calls",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("caller_id", sa.Integer(), nullable=False),
        sa.Column("recipient_id", sa.Integer(), nullable=False),
        sa.Column("scheduled_time", sa.DateTime(), nullable=False),
        sa.Column("duration", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("room_id", sa.String(255), nullable=True, unique=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["caller_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["recipient_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_video_calls_caller_id", "video_calls", ["caller_id"])
    op.create_index("ix_video_calls_recipient_id", "video_calls", ["recipient_id"])
    op.create_index("ix_video_calls_scheduled_time", "video_calls", ["scheduled_time"])
    op.create_index("ix_video_calls_status", "video_calls", ["status"])
    op.create_index("ix_video_calls_room_id", "video_calls", ["room_id"], unique=True)

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
    op.create_index("ix_user_availability_user_id", "user_availability", ["user_id"])

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
    op.create_index("ix_call_ratings_call_id", "call_ratings", ["call_id"])
    op.create_index("ix_call_ratings_rater_id", "call_ratings", ["rater_id"])


def downgrade() -> None:
    op.drop_table("call_ratings")
    op.drop_table("user_availability")
    op.drop_table("video_calls")
    op.drop_table("users")