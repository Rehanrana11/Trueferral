# STEP 67: New Machine Setup Script (PowerShell-safe, deterministic)

**Project:** IntroFlow / Trueferral  
**Phase:** 6 — Release & Reliability  
**Step:** 67 of 72  
**Timestamp (local):** 2026-02-03 15:31:44  
**Branch:** main  
**Head:** 2240413  

## Purpose
Provide a single deterministic PowerShell script that prepares a fresh Windows machine to run and verify the repo.

## Script
- Path: \scripts/setup_new_machine.ps1\

## What the script does
1) Validates it is running from repo root
2) Creates \.venv\ if missing
3) Activates \.venv\
4) Installs dependencies from \equirements.txt\
5) Blocks obvious secret-risk env files in repo root
6) Runs deterministic gates:
   - \python scripts/doctor.py\
   - \pytest -q\ (unless \-SkipTests\ provided)
7) Prints \git status --porcelain=v1\ at end for hygiene visibility

## Usage
- Full verification:
  - \powershell -ExecutionPolicy Bypass -File .\scripts\setup_new_machine.ps1\
- Skip tests (only if you must):
  - \powershell -ExecutionPolicy Bypass -File .\scripts\setup_new_machine.ps1 -SkipTests\

## Acceptance Gate (PASS/FAIL)
PASS if:
- Script runs successfully on a fresh machine
- It is idempotent (re-running is safe)
- It runs doctor.py and pytest deterministically
- It does not require editing repo files or committing artifacts