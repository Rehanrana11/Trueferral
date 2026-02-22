
from __future__ import annotations

from alembic import op
import sqlalchemy as sa  # noqa: F401

# revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Step 43: empty migration scaffold (no schema changes yet)
    pass


def downgrade() -> None:
    # Step 43: empty migration scaffold (no schema changes yet)
    pass