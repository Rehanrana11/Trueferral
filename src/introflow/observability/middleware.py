from __future__ import annotations

from time import perf_counter
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from introflow.logging.logger import get_logger

from .context import clear_correlation_id, set_correlation_id
from .ids import get_provider, is_valid_correlation_id

_LOG = get_logger("introflow.observability")

CORR_HEADER = "X-Correlation-Id"
DUR_HEADER = "X-Request-Duration-Ms"

class ObservabilityMiddleware(BaseHTTPMiddleware):
    """
    Step 49:
    - Correlation id: accept X-Correlation-Id if valid, else generate.
    - Echo correlation id back on response header.
    - Add duration header (ms).
    - Emit one completion log line.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start = perf_counter()

        inbound = request.headers.get(CORR_HEADER)
        if is_valid_correlation_id(inbound):
            cid = inbound.strip()
        else:
            cid = get_provider().new()

        set_correlation_id(cid)

        try:
            response: Response = await call_next(request)
        finally:
            # Ensure we always compute duration even if call_next raises.
            duration_ms = int((perf_counter() - start) * 1000)

        # Response headers
        response.headers[CORR_HEADER] = cid
        response.headers[DUR_HEADER] = str(duration_ms)

        # Completion log (do not log secrets; correlation id is OK)
        _LOG.info(
            "request_complete",
            method=request.method,
            path=str(request.url.path),
            status_code=getattr(response, "status_code", None),
            correlation_id=cid,
            duration_ms=duration_ms,
        )

        clear_correlation_id()
        return response