# STEP 61: Production Configuration Strategy

**Project:** IntroFlow / Trueferral  
**Phase:** 6 — Release & Reliability  
**Step:** 61 of 72  
**Timestamp (local):** 2026-02-03 15:12:42  
**Branch:** main  
**Head:** 04093d3  

## Configuration Rule (HARD LOCK)

**ALL runtime configuration is provided via environment variables only.**

### Explicit Rules
- ❌ No config files (yaml/json/toml) in production
- ❌ No secrets committed to repo
- ❌ No defaults for required production values
- ✅ Validation happens at startup (fail fast)
- ✅ One source of truth: environment variables

## Current Environment Variables (v0)

Required:
- INTROFLOW_DATABASE_URL
  - Type: URL
  - Required at startup (validated)
  - Not required in CI test runs

Optional (validated):
- INTROFLOW_APP_ENV = dev | test | prod (default: dev)
- INTROFLOW_LOG_LEVEL = DEBUG | INFO | WARNING | ERROR | CRITICAL
- INTROFLOW_LOG_JSON = true | false

## Secrets Handling
- .env.example contains **keys only**, no values
- .env files must never be committed
- CI and local dev inject env vars externally

## Acceptance Gate (PASS/FAIL)

PASS if:
- No config files are used for runtime behavior
- All required config is env-driven
- Startup fails fast on missing required env vars
- This document exists and is committed
