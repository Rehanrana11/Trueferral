# STEP 65: Data Retention Policy (Minimal & Legal-Safe)

**Project:** IntroFlow / Trueferral  
**Phase:** 6 — Release & Reliability  
**Step:** 65 of 72  
**Timestamp (local):** 2026-02-03 15:26:45  
**Branch:** main  
**Head:** bcb5b74  

## Purpose
Define how long data is retained, why it exists, and when it must be deleted.
This policy is **data-minimization first** and suitable for audit review.

Scope: **LOCAL-ONLY MVP** (Step 59)

---

## Core Principles (Hard Rules)
- Collect only what is required to execute the Trust Engine
- Never retain data “just in case”
- Prefer automatic expiry via timestamps
- Immutable records are retained only as long as justified
- No user behavioral analytics in MVP

---

## Data Categories & Retention

### 1) Intent Records
**Contains:** purpose, value_range, success_condition, participants  
**Retention:** Until snapshot terminal + 30 days  
**Rationale:** Allows dispute window + short audit buffer

---

### 2) Truth Snapshots (Immutable)
**Contains:** frozen intent terms, verification rules  
**Retention:** Until terminal + 90 days  
**Rationale:** Required for deterministic dispute resolution

---

### 3) Event Log (Domain Events)
**Contains:** intent declared, accepted, snapshot frozen, confirmations, outcomes  
**Retention:** Until snapshot terminal + 90 days  
**Rationale:** Source of truth for auditability

---

### 4) Verification Evidence
**Types:** FILE, LINK, TEXT_ATTESTATION  
**Retention:** Until outcome verified + 30 days  
**Rationale:** Proof window only; no long-term storage justification

---

### 5) Tokens (Confirmation / Outcome)
**Retention:** Until expiration (minutes to days)  
**Rationale:** Single-use security boundary  
**Post-expiry:** Must be invalid and non-reusable

---

### 6) Logs
**Contains:** request metadata (no secrets)  
**Retention:** Operator discretion (local terminal history)  
**Rationale:** Debugging only; no persistent log store in MVP

---

## Explicit Non-Retention
The system must NOT store:
- Passwords
- Raw authorization tokens
- Full request bodies with sensitive content
- User behavior analytics
- IP address history (beyond transient request handling)

---

## Deletion & Expiry Model (v0)
- Expiry is **time-based**, not manual
- Terminal snapshot state is the anchor for cleanup timers
- Actual deletion may be manual in MVP, but rules are fixed

---

## User Data Requests (v0)
Because this is a local MVP:
- No automated data export
- No self-service deletion
- Requests handled manually by operator if needed

---

## Acceptance Gate (PASS/FAIL)
PASS if:
- This document exists and is committed
- Retention periods are explicit per data type
- Non-retained data is explicitly listed
- Policy favors minimization over convenience