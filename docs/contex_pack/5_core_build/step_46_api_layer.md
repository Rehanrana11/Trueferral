# STEP 46: API Layer Skeleton (FastAPI)

## Completed
- √ Added `src/introflow/api/` package (schemas, deps, routes)
- √ Implemented `POST /v1/intro-receipts` wired to Step 45 service layer
- √ Local error mapping (service -> HTTP):
  - UnauthorizedError -> 401
  - ValidationError -> 400
  - Other ServiceError -> 400
- √ Tests:
  - 200 deterministic success with dependency overrides
  - 401 when subject missing
  - 422 on invalid request
  - Import purity: API import does not load DB/SQLAlchemy/Alembic

## Hard Rules Preserved
- No DB connectivity required for tests/CI
- No SQLAlchemy/Alembic/DB imports in API layer
- Auth is a stub dependency provider (Step 47 will replace)

## Files Created / Updated
- `src/introflow/api/__init__.py`
- `src/introflow/api/schemas.py`
- `src/introflow/api/deps.py`
- `src/introflow/api/routes.py`
- `src/introflow/api/README.md`
- `tests/test_api_skeleton.py`
- `src/introflow/app.py` (include router)
- `docs/contex_pack/5_core_build/step_46_api_layer.md`

## Verification
- `python scripts/doctor.py`: PASS
- `pytest -q`: PASS

## Next Step
Step 47: Auth boundary v0 (replace auth dependency provider)