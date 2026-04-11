# STEP 63: Monitoring Plan (Logs / Health / Uptime)

**Project:** IntroFlow / Trueferral  
**Phase:** 6 — Release & Reliability  
**Step:** 63 of 72  
**Timestamp (local):** 2026-02-03 15:21:17  
**Branch:** main  
**Head:** be66d48  

## Monitoring Scope (v0)
This MVP is **LOCAL-ONLY** (Step 59). Monitoring is intentionally minimal:
- Logs (structured)
- Health endpoint checks
- Simple uptime expectations (developer-run)

No external monitoring vendors/tools required in v0.

---

## A) Logs (Required)

### Log Format
- Logger: structlog (already in repo)
- Default: key/value logs
- Optional: JSON logs when INTROFLOW_LOG_JSON=true

### What we must log (sanity)
- One request completion line per request (already implemented in Observability middleware):
  - method, path, status_code, correlation_id, duration_ms

### What we must NEVER log
- Authorization header contents
- Tokens / secrets / passwords
- Full request bodies containing sensitive data (future-proof rule)

### How to enable JSON logs (optional)
PowerShell:
- $env:INTROFLOW_LOG_JSON="true"
- Run server normally

### Log Review Procedure (manual)
PASS if you can observe:
- equest_complete lines during API calls
- correlation_id present
- duration_ms present

---

## B) Health Monitoring (Required)

### Health Endpoint
- Endpoint: GET /health
- Must return:
  - status: healthy
  - version
  - timestamp/check payload (as implemented)

### Local Health Check Command
PowerShell (example):
- python -m introflow serve --host 127.0.0.1 --port 8000
- In another terminal:
  - curl http://127.0.0.1:8000/health

PASS if:
- HTTP 200
- Response body returned (non-empty)
- Version matches repo version

---

## C) Uptime Plan (Required but minimal)

### Definition (v0)
Uptime is "server stays running while operator is validating MVP usage locally."

### Minimal Uptime Checks
- Start server
- Wait 5 minutes
- Hit /health 3 times over that window

PASS if:
- No crashes
- /health returns 200 each time

---

## D) Alerting / Escalation (v0)
No automated paging in v0.

If a failure occurs:
1) Capture last 50 log lines from terminal
2) Capture python scripts/doctor.py output
3) Capture pytest -q output
4) Record issue in docs/contex_pack/06_validation/ or an Issue tracker

---

## Acceptance Gate (PASS/FAIL)
PASS if:
- This document exists and is committed
- Logs requirements + forbidden logging rules are explicit
- Health endpoint check procedure is explicit
- Minimal uptime procedure is explicit