"""
Observability hooks (Step 49).

Hard rules:
- No DB/ORM imports
- No Alembic imports
- No network/IO
- Middleware + contextvars only
"""
from .context import get_correlation_id, set_correlation_id, clear_correlation_id
from .ids import CorrelationIdProvider, DefaultCorrelationIdProvider, set_correlation_id_provider, reset_correlation_id_provider
from .middleware import ObservabilityMiddleware

_all_ = [
    "get_correlation_id",
    "set_correlation_id",
    "clear_correlation_id",
    "CorrelationIdProvider",
    "DefaultCorrelationIdProvider",
    "set_correlation_id_provider",
    "reset_correlation_id_provider",
    "ObservabilityMiddleware",
]