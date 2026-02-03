from __future__ import annotations

"""
Step 45: Service-layer errors only.

Hard rules:
- No frameworks
- No IO
- Deterministic exceptions with stable messages
"""


class ServiceError(Exception):
    """Base class for service-layer errors."""


class UnauthorizedError(ServiceError):
    """Raised when an operation requires a subject but none is present."""


class ValidationError(ServiceError):
    """Raised when a command is invalid (missing/empty fields)."""