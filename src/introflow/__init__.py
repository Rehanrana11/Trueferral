"""IntroFlow - Trust-based referral platform"""

# Export errors for clean imports
from .errors import (
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    UnprocessableEntityError,
    RateLimitedError,
    InternalError,
    ErrorResponse,
    to_error_response,
    safe_error_payload,
)

__all__ = [
    # Errors
    "AppError",
    "BadRequestError",
    "UnauthorizedError",
    "ForbiddenError",
    "NotFoundError",
    "ConflictError",
    "UnprocessableEntityError",
    "RateLimitedError",
    "InternalError",
    "ErrorResponse",
    "to_error_response",
    "safe_error_payload",
]