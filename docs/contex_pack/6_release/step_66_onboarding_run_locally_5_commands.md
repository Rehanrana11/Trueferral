# STEP 66: Onboarding (Run Locally in 5 Commands)

**Project:** IntroFlow / Trueferral  
**Phase:** 6 — Release & Reliability  
**Step:** 66 of 72  
**Timestamp (local):** 2026-02-03 15:28:53  
**Branch:** main  
**Head:** c7af10e  

## Goal
A new developer (fresh machine) can run IntroFlow locally using **exactly 5 commands**.

**Deployment target is LOCAL-ONLY** (Step 59).  
**Config strategy is ENV VARS ONLY** (Step 61).  

---

## Preconditions (Assumed)
- Python 3.11+ installed
- Git installed
- (Optional) PostgreSQL installed only if you later enable DB-backed persistence
  - Current MVP tests must run without needing a live DB

---

## The 5 Commands (Copy/Paste)

> If you already cloned the repo, start at Command 2.

1) Clone:
\\\
git clone https://github.com/Rehanrana11/Trueferral.git introflow
\\\

2) Enter repo:
\\\
cd introflow
\\\

3) Create venv:
\\\
python -m venv .venv
\\\

4) Activate + install deps:
\\\
.\.venv\Scripts\Activate.ps1; pip install -r requirements.txt
\\\

5) Run server:
\\\
python -m introflow serve --host 127.0.0.1 --port 8000
\\\

---

## Verification (Not part of the 5 commands)
- In another terminal, confirm health:
  - \curl http://127.0.0.1:8000/health\
- Expected: HTTP 200 and a non-empty JSON response

---

## Troubleshooting (Minimal)
- If PowerShell blocks scripts:
  - Run PowerShell as Admin once:
    - \Set-ExecutionPolicy -Scope CurrentUser RemoteSigned\
- If dependency install fails:
  - Confirm venv is active: prompt shows \(.venv)\
- If port 8000 is busy:
  - Use: \--port 8001\

---

## Acceptance Gate (PASS/FAIL)
PASS if:
- Exactly 5 commands are listed
- A new machine can run the server locally after those commands
- Health verification is documented