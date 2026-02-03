# STEP 49: Observability Hooks

## Completed
- Correlation IDs
  - Accept inbound X-Correlation-Id if valid
  - Otherwise generate a new one
  - Echo back on response header X-Correlation-Id

- Request tracing hooks
  - Adds X-Request-Duration-Ms response header
  - Emits one structured completion log line:
    - method, path, status_code, correlation_id, duration_ms

## Determinism
- Correlation ID generator is overrideable in tests via set_correlation_id_provider(...).

## Files Created / Updated
- src/introflow/observability/__init__.py
- src/introflow/observability/context.py
- src/introflow/observability/ids.py
- src/introflow/observability/middleware.py
- src/introflow/observability/README.md
- src/introflow/app.py (install middleware)
- tests/test_observability.py

## Verification
- python scripts/doctor.py
- pytest -q