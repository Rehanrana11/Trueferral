# STEP 68: Acceptance Tests

**Project:** IntroFlow / Trueferral  
**Step:** 68 of 72  
**Timestamp:** 2026-02-03 15:50:41

## Purpose
Black-box acceptance (HTTP).

## User Stories
1) GET /health → 200
2) POST with subject → 200
3) POST without subject → 401
4) Unknown field → 422
5) Normalization works
6) Correlation echo

## Run
powershell -ExecutionPolicy Bypass -File .\scripts\acceptance.ps1