# STEP 59: Deployment Target Lock

**Project:** IntroFlow / Trueferral  
**Phase:** 6 — Release & Reliability  
**Step:** 59 of 72  
**Timestamp (local):** 2026-02-03 15:08:59  
**Branch:** main  
**Head:** f6ddf7e  

## Locked Deployment Target (v0/v1)

**TARGET: LOCAL-ONLY**

We will run the MVP locally on a developer machine for initial validation.

### What this means
- Run command: \python -m introflow serve --host 127.0.0.1 --port 8000\
- No Docker requirement for MVP validation
- No cloud deployment in Phase 6 unless a later step explicitly changes this lock

### Why this choice (risk-first)
- Minimizes operational complexity while learning MVP usage
- Keeps the system deterministic and debuggable
- Avoids introducing Docker/network/runtime drift before real user signals exist

### Explicit Non-Targets (for now)
- Docker / Compose: NOT REQUIRED
- Cloud deployment: NOT REQUIRED

## Acceptance Gate (PASS/FAIL)
PASS if:
- This document exists
- Exactly one target is chosen
- Docker/Cloud are explicitly declared non-targets for now
