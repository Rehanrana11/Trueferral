# STEP 69: Regression Gate (Doctor + Pytest Must Pass)

**Project:** IntroFlow / Trueferral  
**Phase:** 6 — Release & Reliability  
**Step:** 69 of 72  
**Timestamp:** 2026-02-03 16:30:25  
**Branch:** main  
**Head:** 5df47f6  

## Purpose
Binary PASS/FAIL gate that must succeed before any release.

## Gate Commands
1. python scripts/doctor.py (exit 0 required)
2. pytest -q (exit 0 required)

## How to Run
powershell -ExecutionPolicy Bypass -File scripts/regression_gate.ps1

## Acceptance
PASS if:
- regression_gate.ps1 exists
- Runs doctor.py + pytest
- Exits 0 on success, nonzero on failure