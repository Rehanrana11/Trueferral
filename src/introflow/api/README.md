# API Layer (Step 46)

This package contains the **FastAPI skeleton** wired to the Step 45 service layer.

## Guarantees
- No DB imports (no `introflow.db`, no `sqlalchemy`, no `alembic`, no `psycopg`)
- No auth implementation yet (Step 47 will replace dependency provider)
- Deterministic behavior in tests via dependency overrides

## Endpoint (v0)
- `POST /v1/intro-receipts`