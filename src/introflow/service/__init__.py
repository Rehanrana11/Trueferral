"""
Service layer (Step 45).

Hard rules:
- NO IO
- NO framework imports (FastAPI, SQLAlchemy, Alembic, etc.)
- NO env reads
- Deterministic logic only
"""

from .core_loop import (
    CreateIntroReceiptCommand,
    CreateIntroReceiptResult,
    CreateIntroReceiptService,
    IntroReceipt,
)
from .errors import ServiceError, UnauthorizedError, ValidationError

__all__ = [
    "IntroReceipt",
    "CreateIntroReceiptCommand",
    "CreateIntroReceiptResult",
    "CreateIntroReceiptService",
    "ServiceError",
    "UnauthorizedError",
    "ValidationError",
]