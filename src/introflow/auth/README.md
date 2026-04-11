# Auth Boundary (Step 47)

This package defines **Auth Boundary v0** (stub allowed, interface frozen).

## Frozen Interface
Must satisfy `introflow.domain.contracts.AuthContext`:
- `subject() -> Optional[str]`

## Deterministic Extraction (v0)
API adapter extracts subject in this order:
1) `X-IntroFlow-Subject` header
2) Optional: `Authorization: Bearer <token>` passthrough (no verification)

## Non-goals (v0)
- No JWT verification
- No OAuth
- No DB lookups
- No env reads
- No logging of subject values