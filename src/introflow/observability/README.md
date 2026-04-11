# Observability (Step 49)

## What this adds
- Request-scoped *Correlation ID*
  - Accepts inbound X-Correlation-Id if valid
  - Otherwise generates a new one
  - Echoes back on response header X-Correlation-Id

- Request tracing hooks
  - Adds X-Request-Duration-Ms response header
  - Emits one structured log line on completion:
    - method, path, status_code, correlation_id, duration_ms

## Determinism
Tests override the correlation id generator via set_correlation_id_provider(...).

## Hard rules
- No DB/ORM imports
- No Alembic imports
- No external tracing vendors