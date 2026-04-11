# Step 52: Error-Path Tests

## Coverage
- 422 errors: Missing field, unknown field, type mismatch, whitespace-only
- 401 error: Missing auth header, verifies no side effects
- Config error: Missing DATABASE_URL fails fast
- Observability: All errors include correlation ID + duration headers
- Import purity: Test file doesn't pull DB/ORM modules

## Tests
- 7 error-path tests + 1 import purity test

## Files
- tests/test_error_paths.py
- docs/contex_pack/5_core_build/step_52_error_path_tests.md