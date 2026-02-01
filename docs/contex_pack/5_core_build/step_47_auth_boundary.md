# STEP 47: Auth Boundary v0 (Stub Allowed, Interface Frozen)

## Completed
- √ Created `src/introflow/auth/` package (frozen auth boundary)
- √ Implemented `HeaderAuthContext` satisfying `AuthContext.subject() -> Optional[str]`
- √ Added deterministic API adapter extracting subject from:
  1) `X-IntroFlow-Subject`
  2) `Authorization: Bearer <token>` passthrough (no verification)
- √ Updated API deps to use auth boundary (replacing `_NullAuth` stub)
- √ Updated API tests to prove route behavior via header/no-header
- √ Added auth boundary unit tests + import purity test

## Hard Rules Preserved
- No DB required
- No env reads
- No JWT verification / external calls
- Domain remains framework-free (FastAPI import only in auth/api.py)

## Files Created / Updated
- `src/introflow/auth/__init__.py`
- `src/introflow/auth/boundary.py`
- `src/introflow/auth/api.py`
- `src/introflow/auth/README.md`
- `src/introflow/api/deps.py` (uses boundary)
- `tests/test_api_skeleton.py` (header-based auth)
- `tests/test_auth_boundary.py`

## Verification
- `python scripts/doctor.py`: PASS
- `pytest -q`: PASS

## Next Step
Step 48+: Real auth integration (when chosen), without changing service layer contracts.