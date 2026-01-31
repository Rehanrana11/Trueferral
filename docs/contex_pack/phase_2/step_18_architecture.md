## PURPOSE
Lock irreversible system shape before API contracts. Implementation MUST follow these invariants.

---

## 1) ARCHITECTURE CHOICE (NON-NEGOTIABLE)
### 1.1 Model: EVENT SOURCING (OPTION A)
**Decision:** Event Log is the primary system of record.

**Hierarchy of truth:**  
Event Log > Snapshot Store > Read Models

Canonical flow:  
Event Log → Trust Engine → Snapshot Store + Read Models

---

## 2) SYSTEM VIEW (TEXT DIAGRAM)

CLIENTS
- Web (Human)
- Admin Console (v1)
- Target Confirm Link (signed one-time) (v1 minimal)

        |
        v

APP SERVICE (Monolith v1)
- Auth (Bearer tokens)
- Validation + idempotency
- Command handlers (write)
- Query handlers (read)

        |
        +------------------------------+
        |                              |
        v                              v

EVENT LOG (PRIMARY TRUTH)          READ MODELS (DERIVED)
- Append-only                      - Snapshot Read View
- Globally ordered                 - User Reputation Summary
- Hash-chained (tamper-evident)    - Minimal lists/admin queue

        |
        v

TRUST ENGINE (DETERMINISTIC)
- Enforces state machine
- Applies arbitration rules
- Emits derived updates (projections)

        |
        v

SNAPSHOT STORE (MATERIALIZED VIEW)
- Frozen snapshot payload (immutable after freeze)
- Current state (derived from events)
- Evidence references (files/metadata)

---

## 3) CORE COMPONENTS (RESPONSIBILITIES)

### 3.1 App Service (Monolith v1)
**Must:**
- Write via events ONLY (no direct state mutation)
- Enforce idempotency
- Read via projections/materialized views
- Emit structured logs + metrics

**Must NOT:**
- Mutate Snapshot Store directly
- Create side-state outside Event Log

### 3.2 Event Log (Single Source of Truth)
**Properties:**
- INSERT-only (no UPDATE/DELETE)
- Globally ordered sequence
- Hash-chained for tamper evidence

**Event schema (minimum):**
{
  event_id: UUID,
  snapshot_id: UUID|null,
  event_type: ENUM,
  actor_id: UUID,
  server_time: ISO8601,
  payload_hash: SHA256,
  prev_hash: SHA256,
  payload: JSON
}

**Minimum v1 event types:**
- SnapshotDeclared
- SnapshotFrozen
- ReferralTokenIssued
- ExecutionClaimed
- ExecutionConfirmed (role: TARGET|REQUESTER)
- OutcomeEvidenceSubmitted
- DisputeRaised
- DisputeResolved (rule_ref REQUIRED)
- OutcomeVerified (mode: MUTUAL|TIMEOUT|ADMIN)
- ReputationAdjusted
- SnapshotClosed (optional)

**Invariant:** If it’s not an event, it didn’t happen.

### 3.3 Snapshot Store (Materialized View)
- Stores frozen payload after SnapshotFrozen (immutable)
- Stores derived current state rebuilt from events
- Can be wiped and rebuilt from Event Log

### 3.4 Read Models (Projections)
- Disposable, rebuildable, query-optimized
- No unique truth stored here

### 3.5 Trust Engine (Deterministic)
- Same event stream → same state
- No randomness, no external calls during rule application
- Dispute resolutions MUST cite immutable rule_ref (AC-D3)

---

## 4) STATE MACHINE (TRUTH SNAPSHOT LIFECYCLE)

States (v1):
- FROZEN
- INTRO_CLAIMED
- INTRO_CONFIRMED
- OUTCOME_PENDING
- SUCCESS
- FAILURE
- TIMEOUT
- DISPUTED

Key transitions (event-driven):

FROZEN → INTRO_CLAIMED
- requires: ExecutionClaimed by Introducer

INTRO_CLAIMED → INTRO_CONFIRMED
- requires BOTH (2-party total, per Step 15):
  1) ExecutionClaimed by Introducer AND
  2) ExecutionConfirmed by TARGET (preferred) OR REQUESTER (fallback)
- guard: confirmer_id ≠ introducer_id

INTRO_CONFIRMED → OUTCOME_PENDING
- requires: OutcomeEvidenceSubmitted
- guard: evidence_timestamp > intro_confirmed_timestamp

OUTCOME_PENDING → SUCCESS/FAILURE/TIMEOUT
- requires: OutcomeVerified(mode in MUTUAL|TIMEOUT|ADMIN)

Any active state → DISPUTED
- via DisputeRaised

DISPUTED → SUCCESS/FAILURE
- via DisputeResolved(rule_ref) + OutcomeVerified(ADMIN)

---

## 5) RECOVERY & REBUILD (MANDATORY)

If Snapshot Store/Read Models corrupt:
1) Stop writes (maintenance mode)
2) Preserve Event Log (do not modify)
3) Replay Event Log through Trust Engine
4) Rebuild Snapshot Store + Read Models
5) Verify invariants:
   - hash chain integrity
   - legal state transitions
   - disputes have rule_ref in arbitration_rules.md
   - intro < evidence ordering
6) Re-enable writes

---

## 6) SECURITY BOUNDARY (V1 MINIMAL)
- Auth required for all user actions (Bearer token)
- Target confirmation uses signed one-time link bound to snapshot_id with expiry
- Admin arbitration is role-gated and rule-bound (rule_ref required, logged as events)

---

## 7) BINDING LOCKS (IMMUTABLE FOR V1)
1) Event sourcing
2) Event Log as primary truth
3) Monolith deployment (single service)
4) Hash-chained events (tamper-evident)
5) Deterministic Trust Engine
6) Rebuildable projections

Changing any = scope violation.

---

## NEXT STEP
→ Step 19: API Contracts (routes + commands + emitted events)