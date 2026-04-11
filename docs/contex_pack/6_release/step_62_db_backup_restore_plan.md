# STEP 62: DB Backup / Restore Plan (Postgres)

**Project:** IntroFlow / Trueferral  
**Phase:** 6 - Release & Reliability  
**Step:** 62 of 72  
**Timestamp:** 2026-02-03 15:18:23  
**Branch:** main  
**Head:** e15740a  

## Scope
Minimal, operator-safe backup/restore procedure for MVP database.

- DB: **PostgreSQL** (INTROFLOW_DATABASE_URL)
- Target: **LOCAL-ONLY** (Step 59)
- Config: **ENV VARS ONLY** (Step 61)

## Tools Required
- pg_dump and psql (PostgreSQL client tools)
- Access to INTROFLOW_DATABASE_URL

## Backup Location & Naming
- Directory: ./backups/ (not committed)
- Naming: introflow_pg_YYYYMMDD_HHMMSS.dump
- Format: custom (-Fc) for safer restores

> IMPORTANT: backups/ must be in .gitignore

## Backup Command
PowerShell:
1) New-Item -ItemType Directory -Force .\backups | Out-Null
2) \ = Get-Date -Format "yyyyMMdd_HHmmss"
3) pg_dump "\" -Fc -f ".\backups\introflow_pg_\.dump"

## Restore Command
WARNING: Restore will overwrite objects. Use with care.

1) Create target DB if needed
2) pg_restore --no-owner --no-privileges -d "\" ".\backups\introflow_pg_<timestamp>.dump"

## Verification After Restore
- psql "\" -c "\dt"
- python .\scripts\doctor.py
- pytest -q

## Manual Test Checklist (Required Once)
- [ ] Created backups/ directory
- [ ] Ran pg_dump successfully
- [ ] Restored into fresh DB
- [ ] Verified tables exist
- [ ] doctor.py PASS
- [ ] pytest PASS

## Acceptance
PASS if:
- Doc exists and committed
- Commands are PowerShell-friendly
- Backup location not committed
- Manual test checklist present