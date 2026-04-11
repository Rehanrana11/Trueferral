# STEP 64: Incident Playbook v0 (Stop Damage First)

**Project:** IntroFlow / Trueferral  
**Phase:** 6 — Release & Reliability  
**Step:** 64 of 72  
**Timestamp (local):** 2026-02-03 15:24:23  
**Branch:** main  
**Head:** 81f93ea  

## Purpose (v0)
This playbook exists to make incident response **fast, calm, and repeatable**.
Priority order:
1) Stop damage  
2) Preserve evidence  
3) Restore service  
4) Learn + prevent recurrence

Scope: **LOCAL-ONLY MVP** (Step 59). No production paging/tools required.

---

## A) Roles (WHO)
Even in MVP, assign roles so nobody panics.

- **Incident Lead (IL):** runs the checklist, makes final calls
- **Responder (R):** executes commands (stop/restart/verify)
- **Scribe (S):** records timeline, outputs, what changed

v0 default (single-operator):
- IL = You
- R = You
- S = You (write notes into the doc)

---

## B) Severity Levels (WHAT)
Use simple categories (binary-ish).

- **SEV-1 (Stop now):** data exposure suspected, auth bypass, secrets leak, or anything unsafe
- **SEV-2 (Degraded):** service crash / cannot serve requests / repeated 500s
- **SEV-3 (Minor):** non-blocking bug, cosmetic, intermittent

---

## C) Immediate Containment (HOW TO STOP DAMAGE)

### C1) If data exposure / secrets leak suspected (SEV-1)
1) **STOP server immediately**
   - Press Ctrl+C in server terminal
2) **Do NOT post logs publicly**
3) **Check git status for secret files**
   - git status --porcelain=v1
4) **Search for common secret patterns (tracked files only)**
   - git ls-files | % { Select-String -Path  -Pattern "BEGIN PRIVATE KEY|AWS_SECRET_ACCESS_KEY|SECRET_KEY=|API_KEY=|PASSWORD=|DATABASE_URL=" -SimpleMatch -ErrorAction SilentlyContinue }
5) **If any secret found**
   - Treat as compromised
   - Rotate credentials outside repo (manual)
   - Document exactly what was exposed

### C2) If service is down (SEV-2)
1) Stop the process (Ctrl+C)
2) Restart clean:
   - python -m introflow serve --host 127.0.0.1 --port 8000
3) Verify health:
   - curl http://127.0.0.1:8000/health

### C3) If runaway errors or weird behavior (SEV-2/3)
1) Capture last visible terminal output (copy/paste into incident notes)
2) Run local gates:
   - python scripts/doctor.py
   - pytest -q

---

## D) Evidence Collection (PRESERVE PROOF)
Collect these in order (do not skip):

1) Timestamp + branch + commit hash
2) git status --porcelain=v1
3) Last 50 log lines from server terminal (if safe; redact secrets)
4) python scripts/doctor.py output
5) pytest -q output
6) If HTTP issue:
   - curl -i http://127.0.0.1:8000/health
   - curl -i -X POST http://127.0.0.1:8000/v1/intro-receipts -H "Content-Type: application/json" -H "X-IntroFlow-Subject: test" -d "{\"counterparty\":\"Alice\"}"

---

## E) Recovery Checklist (RESTORE SERVICE)
PASS if:
- Server starts
- /health returns 200
- Minimal POST works (if applicable)
- doctor.py PASS
- pytest PASS

---

## F) Post-Incident Review (LEARN)
Within 24 hours, write:

- What happened (2–5 lines)
- What was the impact
- Root cause (best known)
- Fix (what changed)
- Prevention (guardrail/test/doc)

---

## Incident Log Template (copy/paste)
**Incident ID:** INC_YYYYMMDD_HHMM  
**Severity:** SEV-1 / SEV-2 / SEV-3  
**Start time:**  
**End time:**  
**Symptom:**  
**Containment action:**  
**Evidence captured:**  
**Root cause:**  
**Fix applied:**  
**Prevention:**  

---

## Acceptance Gate (PASS/FAIL)
PASS if:
- This document exists and is committed
- Contains: who/what/how + stop-damage-first + evidence steps + recovery + postmortem template