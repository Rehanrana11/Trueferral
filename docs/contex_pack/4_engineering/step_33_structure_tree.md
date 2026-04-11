# Step 33 - Structure Tree Locked

**Phase:** 4 - Engineering Rails
**Status:** Complete
**Date:** 2026-01-31

## Purpose

Locks the canonical source tree layout for introflow before any
application logic is built. Every subsequent step in Phase 4 writes
into paths defined here.

## Locked Tree

```
introflow/
â”œâ”€â”€ .env.example                 # Secret template (Step 39)
â”œâ”€â”€ .github/
â”‚   â””â”€â”€ workflows/
â”‚       â””â”€â”€ ci.yml               # CI pipeline (Step 38)
â”œâ”€â”€ docs/
â”‚   â””â”€â”€ contex_pack/
â”‚       â””â”€â”€ 4_engineering/       # This directory
â”œâ”€â”€ scripts/
â”‚   â”œâ”€â”€ doctor.py                # Pre-flight health check
â”‚   â””â”€â”€ encoding_check.ps1       # UTF-8 BOM gate
â”œâ”€â”€ src/
â”‚   â””â”€â”€ introflow/
â”‚       â”œâ”€â”€ __init__.py
â”‚       â”œâ”€â”€ app.py               # FastAPI application entry
â”‚       â”œâ”€â”€ config/
â”‚       â”‚   â””â”€â”€ settings.py      # Pydantic settings (Step 34)
â”‚       â”œâ”€â”€ errors.py            # Error hierarchy (Step 36)
â”‚       â”œâ”€â”€ health.py            # Health endpoint (Step 37)
â”‚       â”œâ”€â”€ logging/
â”‚       â”‚   â””â”€â”€ logger.py        # Structlog rail (Step 35)
â”‚       â””â”€â”€ version.py           # Single-source version
â”œâ”€â”€ tests/
â”‚   â”œâ”€â”€ test_errors.py
â”‚   â”œâ”€â”€ test_health.py
â”‚   â”œâ”€â”€ test_logging.py
â”‚   â””â”€â”€ test_settings.py
â”œâ”€â”€ pyproject.toml
â””â”€â”€ pytest.ini
```

## Constraints

- No module may be added to src/introflow/ without a corresponding
  entry here.
- Test files mirror module names with a 	est_ prefix.
- All source files must be UTF-8 without BOM.

## References

- Step 34: Config Validation
- Step 35: Logging Rail
- Step 36: Error Handling
- Step 37: Health Endpoint
- Step 38: CI Pipeline
- Step 39: Secrets Management