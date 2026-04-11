from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional
import uuid

# Import our logger for error logging
from introflow.logging import get_logger

logger = get_logger(__name__)

# Stable, non-leaky error codes (machine-readable)
@dataclass(frozen=True)
class ErrorResponse:
    code: str
    message: str
    request_id: str
    status: int
    details: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "error": {
                "code": self.code,
                "message": self.message,
            },
            "request_id": self.request_id,
        }
        if self.details:
            payload["error"]["details"] = self.details
        return payload


class AppError(Exception):
    """Base application error.
    - Safe message for clients (no stack traces / secrets)
    - Stable machine code
    - HTTP-ish status integer (used later by API layer)
    """

    code: str = "app_error"
    status: int = 500
    safe_message: str = "An unexpected error occurred."

    def __init__(self, safe_message: Optional[str] = None, *, details: Optional[Dict[str, Any]] = None):
        super().__init__(safe_message or self.safe_message)
        self._details = details

    @property
    def details(self) -> Optional[Dict[str, Any]]:
        return self._details


# Concrete errors (extend as needed; keep stable)
class BadRequestError(AppError):
    code = "bad_request"
    status = 400
    safe_message = "Bad request."

class UnauthorizedError(AppError):
    code = "unauthorized"
    status = 401
    safe_message = "Unauthorized."

class ForbiddenError(AppError):
    code = "forbidden"
    status = 403
    safe_message = "Forbidden."

class NotFoundError(AppError):
    code = "not_found"
    status = 404
    safe_message = "Not found."

class ConflictError(AppError):
    code = "conflict"
    status = 409
    safe_message = "Conflict."

class UnprocessableEntityError(AppError):
    code = "unprocessable_entity"
    status = 422
    safe_message = "Unprocessable entity."

class RateLimitedError(AppError):
    code = "rate_limited"
    status = 429
    safe_message = "Too many requests."

class InternalError(AppError):
    code = "internal_error"
    status = 500
    safe_message = "Internal server error."


def _new_request_id() -> str:
    return str(uuid.uuid4())


def to_error_response(exc: Exception, *, request_id: Optional[str] = None) -> ErrorResponse:
    """Central exception mapping. NEVER leaks raw exception strings for unknown errors.
    
    Automatically logs all errors with correlation IDs for audit trail.
    """
    rid = request_id or _new_request_id()

    if isinstance(exc, AppError):
        # AppError message is considered safe by design.
        # Log with correlation ID
        logger.error(
            "application_error",
            error_code=exc.code,
            error_type=type(exc).__name__,
            status=exc.status,
            request_id=rid,
            details=exc.details,
        )
        return ErrorResponse(
            code=exc.code,
            message=str(exc),
            request_id=rid,
            status=exc.status,
            details=exc.details,
        )

    # Known built-in exceptions that should not leak specifics:
    if isinstance(exc, ValueError):
        logger.warning(
            "validation_error",
            error_type="ValueError",
            request_id=rid,
        )
        return ErrorResponse(code="bad_request", message="Bad request.", request_id=rid, status=400)

    # Default: generic internal error (no raw details)
    # Log with full traceback for debugging (but don't expose to client)
    logger.error(
        "unexpected_error",
        error_type=type(exc).__name__,
        request_id=rid,
        exc_info=True,  # Include full traceback in logs
    )
    return ErrorResponse(code="internal_error", message="Internal server error.", request_id=rid, status=500)


def safe_error_payload(exc: Exception, *, request_id: Optional[str] = None) -> Dict[str, Any]:
    """Convenience: returns dict for APIs/CLI without leaking internals."""
    return to_error_response(exc, request_id=request_id).to_dict()