# STEP 54: Security Checklist v1 (OWASP Sanity)

**Project:** IntroFlow / Trueferral  
**Phase:** 5 — Core Build  
**Step:** 54 of 72  
**Scope:** OWASP sanity only (no deep pentest)

---

## Purpose

Establish a **baseline security posture** for the current API + test harness:
- Clear, copy-ready checklist
- Minimal automated, deterministic gates in CI
- No business logic changes

---

## Current Attack Surface (Sanity)

1) HTTP API (FastAPI)
- Endpoint: POST /v1/intro-receipts
- Headers: auth subject header, correlation-id
- JSON payload: counterparty, 
ote

2) Logs (structlog)
- Must avoid leaking secrets/tokens/authorization headers

3) Config
- .env.example keys exist, values must be empty
- CI must not require DB connectivity

---

## OWASP Sanity Checklist (IntroFlow-tailored)

### A) Input Validation & Schema Strictness (OWASP: Injection / Mass Assignment)
- [x] API schemas use extra="forbid" (reject unknown fields)
- [x] Strict typing (no silent coercion)
- [x] Deterministic normalization (strip whitespace)
- [x] Bound lengths enforced (counterparty <= 200, note <= 1000)

### B) Authentication / Authorization (OWASP: Broken Access Control)
- [x] Auth boundary is framework-adapter only (uth/api.py) and returns AuthContext
- [x] Requests without subject are unauthorized (401)
- [ ] Real token verification (NOT YET — explicitly out of scope for v0)

### C) Secrets Management (OWASP: Cryptographic Failures / Sensitive Data Exposure)
- [x] .env.example contains keys, **no values**
- [x] No .env or key material tracked by git
- [x] CI does not require secrets to run tests

### D) Logging & Observability (OWASP: Sensitive Data Exposure)
- [x] Redaction keys include: password, secret, token, api_key, authorization
- [x] Auth adapter must not log subjects/tokens
- [x] Correlation id allowed, but no secrets in logs

### E) Error Handling (OWASP: Security Misconfiguration)
- [x] No stack traces returned in API responses (FastAPI default behavior in prod)
- [x] Errors return controlled JSON with status code (401/400/422)

### F) CORS / HTTP Security Headers (Sanity)
- [ ] CORS policy explicitly defined (NOT YET)
- [ ] Security headers hardening (NOT YET; do later with middleware)
  - X-Content-Type-Options, Referrer-Policy, etc.

### G) Rate Limiting / Abuse Prevention (Sanity)
- [ ] Rate limiting (NOT YET; explicitly out of scope in v0)

### H) Dependency Hygiene (Sanity)
- [x] Keep dependencies minimal
- [x] Avoid adding scanners/tools until needed
- [ ] Periodic dependency review (manual for now)

---

## Mini Threat Model (Sanity Level)

**Top risks now:**
1) Parameter pollution / mass assignment → mitigated by extra="forbid"
2) Auth bypass (missing subject) → mitigated by 401 requirement
3) Sensitive log leakage → mitigated by redaction + “auth adapter has no logging”
4) Accidental secret commits → mitigated by secrets rail + security sanity tests

---

## Step 54 Acceptance Gates ("DONE" Criteria)

1) docs/contex_pack/5_core_build/step_54_security_checklist_v1.md exists and is copy-ready.
2) 	ests/test_security_sanity.py exists and passes on clean CI.
3) Automated gates are deterministic and **avoid false positives**.
4) No new dependencies.
5) No business logic changes.
