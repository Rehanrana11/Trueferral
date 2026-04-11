# STEP 23: THREAT MODEL (ATTACK SURFACE)

**Project:** IntroFlow (Trueferral)  
**Phase:** 2 — Decisions & System Shape  
**Step:** 23 of 72  
**Status:** ✅ COMPLETE & CRYPTOGRAPHICALLY LOCKED  
**Date Created:** January 20, 2026  
**Quality:** v1 · Trust Engine · Event-Sourced · Cryptographically Sound

---

## 23.1 PURPOSE

Identify, classify, and mitigate credible threats to Truferral's Trust Engine so that:
- ✅ Truth cannot be forged
- ✅ Outcomes cannot be retroactively altered
- ✅ Introducers cannot be exploited
- ✅ The system remains reliable under attack

**Principle:** Protect invariants first (immutability, causality, auditability), then availability.

---

## 23.2 ASSETS (WHAT WE MUST PROTECT)

### Primary (Highest Priority)

1. **Event Log** (append-only, hash-chained)
   - Single source of truth
   - Must never be corrupted

2. **Truth Snapshots** (frozen state + lineage)
   - Immutable after freeze
   - Contains commitment terms

3. **Reputation & Capacity Ledger** (derived but sensitive)
   - Determines user trust
   - Controls access

4. **Dispute Ruleset** (immutable, deterministic)
   - Defines arbitration logic
   - Must be tamper-proof

---

### Secondary

5. **Evidence Artifacts** (PII-bearing, integrity-critical)
   - Proof of outcomes
   - Contains sensitive data

6. **Tokens** (intro confirmation, admin access)
   - One-time use
   - Short-lived

7. **Operational Logs & Metrics**
   - Debugging data
   - Performance insights

---

## 23.3 TRUST BOUNDARIES

| Boundary | Description |
|----------|-------------|
| Client → API | Untrusted network boundary |
| API → Trust Engine | AuthZ + invariant enforcement |
| Trust Engine → Event Log | Append-only, integrity-critical |
| Event Log → Projections | Derived, rebuildable |
| Admin Access | Elevated, tightly controlled |
| Background Jobs | SYSTEM actor, scoped permissions |

---

## 23.4 THREAT ACTORS

1. **Malicious User** (Requester / Introducer / Target)
   - Motivated to fake outcomes
   - May attempt replay attacks

2. **Colluding Parties** (any two of R/I/T)
   - Coordinated false confirmations
   - Gaming reputation system

3. **Bot / Scripted Abuse**
   - Automated attacks
   - Volume-based exploitation

4. **External Attacker** (replay, injection, DoS)
   - Network-level attacks
   - Protocol exploitation

5. **Compromised Admin Account**
   - Elevated privileges abused
   - Arbitrary decisions

6. **Insider / Operator Error**
   - Accidental corruption
   - Misconfiguration

7. **Supply-Chain Attacker**
   - Compromised dependencies
   - Backdoored libraries

---

## 23.5 THREAT CATEGORIES & MITIGATIONS

### T1 — FORGED OUTCOMES / EVIDENCE TAMPERING

**Risk:** Fake success, altered evidence

---

**Mitigations:**

✅ **Event sourcing (no state mutation)**
- All state changes via events
- No direct database updates

✅ **Evidence hashing: SHA-256 over full content**
- Computed on upload
- Verified on access

✅ **Evidence size/type validation**
- Max 10MB for files
- Only PDF/PNG/JPG allowed

✅ **Independent verification (≥2 parties)**
- Introducer + Target/Requester
- Cannot self-verify

✅ **Temporal constraints (causality enforced)**
- outcome_occurred_at > intro_confirmed_at
- Server-side timestamps only

✅ **CRITICAL alerts on integrity violations**
- Immediate P1 page
- Automatic investigation triggered

---

### T2 — COLLUSION (INTRODUCER + TARGET / REQUESTER)

**Risk:** Coordinated false confirmations

---

**Mitigations:**

✅ **Independent confirmation requirement**
- Different actors must confirm
- Cannot self-validate

✅ **Time-bound confirmations**
- 7-day window for intro confirmation
- 90-day window for outcome

✅ **Immutable dispute ruleset**
- Rules defined before disputes
- Cannot be invented ad-hoc

✅ **Non-linear reputation penalties**
- Multiple failures compound
- Prevents reputation farming

✅ **Capacity throttling**
- Max 3 active snapshots per user
- Prevents spam attacks

---

### T3 — REPLAY / DOUBLE-SPEND / IDEMPOTENCY ABUSE

**Risk:** Duplicate writes, repeated confirmations

---

**Mitigations:**

✅ **Mandatory Idempotency-Key**
- Required header for all writes
- 400 error if missing

✅ **24h idempotency window**
- Key reuse returns cached result
- After 24h, treated as new request

✅ **Event append deduplication**
- Event ID uniqueness enforced
- Sequence numbers per snapshot

✅ **202 Accepted on uncertain append**
- Prevents double-write on retry
- Recovery token provided

✅ **Replay detection metrics + alerts**
- `idempotency_replay_total` counter
- Alert on sustained high replay rate

---

### T4 — TOKEN THEFT / ABUSE

**Risk:** Intro confirmation hijack

---

**Mitigations:**

✅ **One-time, short-lived tokens**
- Single use only
- Expires in 72 hours (configurable)

✅ **Token hash storage (never raw)**
- SHA-256 hash stored in database
- Raw token never logged

✅ **Purpose-bound tokens**
- INTRO_CONFIRM_TARGET vs OUTCOME_SUBMIT
- Cannot be reused for different purpose

✅ **410 Gone on reuse/expiry**
- Clear error messages
- Anti-enumeration (404 for invalid)

✅ **Gateway-level rate limits**
- Token confirmation endpoint throttled
- Prevents brute force

---

### T5 — ADMIN ABUSE / ARBITRARY DECISIONS

**Risk:** Non-deterministic dispute outcomes

---

**Mitigations:**

✅ **Admin actions must reference immutable rule_id**
- Every dispute resolution cites rule
- Validation enforced server-side

✅ **Separate admin auth tokens**
- Different from user tokens
- Tighter rate limits

✅ **Two-person review for production data actions**
- Manual data changes require approval
- Logged with both actors

✅ **All admin actions logged + audited**
- Every action has log entry
- Access reviewed weekly

✅ **P1 alerts on unknown rule usage**
- `RULE_ID_UNKNOWN_USED` → immediate page
- Manual review required

---

### T6 — EVENT LOG INTEGRITY COMPROMISE (CRITICAL)

**Risk:** Deletion, reordering, tampering

---

**Mitigations:**

✅ **Append-only storage**
- No UPDATE or DELETE allowed
- Database constraints enforced

✅ **Hash-chained events**
- Each event references prev_hash
- Tampering breaks chain

✅ **Sequence enforcement per snapshot**
- seq values: [1, 2, 3, ..., N]
- Gaps detected immediately

✅ **Integrity checker background job**
- Runs every 10 minutes
- Validates hash chain

✅ **WORM backups + offsite replication**
- Write-Once-Read-Many storage
- Geographic redundancy

✅ **Immediate P1 alert on chain violation**
- `EVENT_HASH_CHAIN_INVALID` → page
- Automatic snapshot freeze

---

#### Cryptographic Specification (Required):

**Hash algorithm:** SHA-256

**Serialization:** RFC 8785 (JSON Canonicalization Scheme)

**Hash input (deterministic JSON):**

```json
{
  "event_id": "evt_123",
  "seq": 5,
  "prev_hash": "a1b2c3...",
  "snapshot_id": "snp_456",
  "event_type": "IntroConfirmed",
  "occurred_at": "2026-01-11T23:00:00Z",
  "actor_type": "TARGET",
  "actor_id": "token_hash_789",
  "payload": { ... }
}


Hash computation:

hash(n) = SHA256(canonical_json(event_n))
hash(n) MUST include prev_hash = hash(n-1)


Genesis event:

prev_hash = "0000000000000000000000000000000000000000000000000000000000000000"


(64 zero bytes in hex)

Implementation example:

import hashlib
import json
from jcs import canonicalize  # RFC 8785

def compute_event_hash(event):
  # Build canonical structure
  canonical_event = {
    "event_id": event.event_id,
    "seq": event.seq,
    "prev_hash": event.prev_hash,
    "snapshot_id": event.snapshot_id,
    "event_type": event.event_type,
    "occurred_at": event.occurred_at,
    "actor_type": event.actor_type,
    "actor_id": event.actor_id,
    "payload": event.payload
  }
  
  # Canonicalize JSON (RFC 8785)
  canonical_bytes = canonicalize(canonical_event)
  
  # Compute SHA-256
  return hashlib.sha256(canonical_bytes).hexdigest()

def verify_event_chain(event, prev_event):
  # Compute hash of previous event
  expected_prev_hash = compute_event_hash(prev_event)
  
  # Verify current event references correct prev_hash
  if event.prev_hash != expected_prev_hash:
    raise IntegrityViolation(
      event_id=event.event_id,
      expected=expected_prev_hash,
      actual=event.prev_hash
    )
  
  return True


T7 — PROJECTION CORRUPTION / DRIFT
Risk: UI shows incorrect state

Mitigations:
✅ Projections are disposable
	∙	Can be deleted and rebuilt
	∙	No unique data stored
✅ Rebuild from Event Log
	∙	Deterministic replay
	∙	Same events → same state
✅ Projection rebuild job with observability
	∙	JOB_STARTED, JOB_COMPLETED logs
	∙	Duration and success metrics
✅ Compare last_event_id / seq_max
	∙	Projection tracks last processed event
	∙	Detects drift
✅ No direct writes to projections
	∙	Only updated via event replay
	∙	Application code cannot mutate

T8 — DENIAL OF SERVICE (DoS / ABUSE)
Risk: Resource exhaustion

Mitigations:
✅ Rate limiting at API gateway
	∙	Per-user limits
	∙	Per-IP limits
	∙	Burst allowance
✅ Capacity ledger (max active snapshots)
	∙	3 active snapshots per user
	∙	Prevents spam
✅ Background job pacing
	∙	Batch size limits
	∙	Sleep between iterations
✅ INFO log sampling
	∙	10% sampling during normal operation
	∙	100% during incidents
✅ Circuit breakers on heavy endpoints
	∙	Automatic throttling
	∙	Error responses when overloaded

T9 — PII LEAKAGE
Risk: Sensitive data exposure

Mitigations:
✅ Log redaction rules
	∙	Emails masked: u***@example.com
	∙	Tokens hashed before logging
✅ Evidence content never logged
	∙	File bytes not in logs
	∙	URLs may be sensitive
✅ Encrypted storage at rest
	∙	Database encryption
	∙	Object storage encryption
✅ Access-controlled exports
	∙	SRE/Security roles only
	∙	Access logged
✅ Log access logging
	∙	LOG_ACCESS_GRANTED events
	∙	Audit trail for compliance

T10 — CAUSALITY VIOLATIONS / TIME TRAVEL
Risk: Outcome before intro

Mitigations:
✅ Server-side timestamp authority
	∙	Client timestamps ignored
	∙	Server generates occurred_at
✅ Temporal validation rules
	∙	outcome_occurred_at > intro_confirmed_at
	∙	Evidence timestamp > intro timestamp
✅ State machine enforcement
	∙	Cannot skip states
	∙	Transitions validated
✅ Reject out-of-order transitions
	∙	INVALID_STATE_TRANSITION error
	∙	Request blocked
✅ Deterministic error codes
	∙	TIMESTAMP_ORDERING_VIOLATION
	∙	Clear reason for rejection

23.6 STRIDE MAPPING



|Threat                    |Covered                  |
|--------------------------|-------------------------|
|**S**poofing              |AuthN/AuthZ, tokens      |
|**T**ampering             |Hash chains, immutability|
|**R**epudiation           |Event Log + audit        |
|**I**nformation Disclosure|Redaction, PII rules     |
|**D**enial of Service     |Rate limits, capacity    |
|**E**levation of Privilege|Admin isolation          |

23.7 NON-GOALS (EXPLICIT)
v1 does NOT protect against:
❌ Anonymous writes
	∙	All actions require authentication
	∙	Not supporting anonymous users
❌ Soft deletes
	∙	No “mark as deleted” feature
	∙	Events are immutable forever
❌ Admin discretion without rule reference
	∙	Every admin decision cites rule_id
	∙	No freeform judgment
❌ Trust decisions in Growth Engine
	∙	Growth Engine (v2+) separate
	∙	Trust Engine only in v1
❌ AI adjudication in v1
	∙	Human actors only
	∙	AI integration deferred to v2

23.8 DETECTION & RESPONSE
Detection
CRITICAL integrity logs:
	∙	EVENT_HASH_CHAIN_INVALID
	∙	EVENT_SEQ_GAP_DETECTED
	∙	SNAPSHOT_IMMUTABILITY_VIOLATION_ATTEMPT
Integrity checker job:
	∙	Runs every 10 minutes
	∙	Validates hash chains
	∙	Checks sequence gaps
Funnel anomaly metrics:
	∙	Freeze rate drop
	∙	Confirm rate drop
	∙	Dispute rate spike

Response
P1 paging for integrity failures:
	∙	Immediate on-call alert
	∙	Runbook provided
	∙	15-minute SLA
Snapshot freeze on suspected corruption:
	∙	Disable writes to affected snapshots
	∙	Prevent further damage
Projection rebuild from Event Log:
	∙	Automated job triggered
	∙	Verify hash chain first
	∙	Rebuild all projections
Forensic export (hash-verified):
	∙	Export Event Log with hashes
	∙	Verify export integrity
	∙	Store for investigation

23.9 RESIDUAL RISK (ACCEPTED FOR V1)
Risks we accept:
✅ Low-volume human collusion (mitigated, not eliminated)
	∙	Independent verification helps
	∙	Non-linear penalties deter
	∙	Cannot eliminate completely
✅ Manual admin arbitration (rule-bound, logged)
	∙	Admin must cite rules
	∙	But human in the loop
	∙	Risk of inconsistent interpretation
✅ No hardware enclave guarantees
	∙	No TPM/HSM in v1
	∙	Software-only integrity
	∙	Sufficient for v1 scale

23.10 COMPLETION CRITERIA (PASS / FAIL)
PASS if:
✅ Every threat has ≥1 concrete mitigation
	∙	All 10 threats addressed
	∙	Mitigations specified
✅ Event Log integrity has P1 alert + recovery path
	∙	Hash chain validation
	∙	Automatic alerts
	∙	Rebuild procedure
✅ Admin actions are rule-bound and auditable
	∙	rule_id required
	∙	All actions logged
	∙	Access reviewed
✅ No contradiction with Steps 18–22
	∙	Architecture aligned
	∙	APIs support security
	∙	Data model enforces integrity
	∙	Errors handle threats
	∙	Logging detects attacks

FAIL if:
❌ Any invariant can be violated silently
	∙	Immutability must be enforced
	∙	Causality must be validated
	∙	Alerts must fire
❌ Admin can act without immutable rule
	∙	Every decision needs rule_id
	∙	Validation enforced
❌ Projections can diverge without detection
	∙	Must have integrity checks
	∙	Must be rebuildable

VALIDATION CHECKLIST



|Criterion                    |Status|Evidence             |
|-----------------------------|------|---------------------|
|Assets identified            |✅     |Section 23.2         |
|Trust boundaries defined     |✅     |Section 23.3         |
|Threat actors listed         |✅     |Section 23.4         |
|All threat categories covered|✅     |Section 23.5 (T1-T10)|
|Cryptographic spec complete  |✅     |T6 subsection        |
|STRIDE mapped                |✅     |Section 23.6         |
|Non-goals explicit           |✅     |Section 23.7         |
|Detection & response defined |✅     |Section 23.8         |
|Residual risk acknowledged   |✅     |Section 23.9         |

LOCK STATUS
🔒 LOCKED - Threat model is binding for v1
Revision Criteria:
	∙	Only if Step 24 (Contradiction Check) reveals security gaps
	∙	Only if penetration testing reveals new threats
	∙	Only with founder approval + decision_log.md entry
Until then: This threat model is frozen.

NEXT STEP
→ Step 24: Run Contradiction Check
Purpose: Final validation across Steps 17-23 before execution
Instruction: Say “GO — Step 24” when ready

METADATA
Created By: Project Owner (Rehan)Reviewed By: Expert Council + ClaudeSSOT Status: ✅ COMPLETE & CRYPTOGRAPHICALLY LOCKEDDependencies: Steps 18-22 (Architecture, APIs, Data, Errors, Logging)Referenced By: All implementation + security testing phases
STATUS: STEP 23 COMPLETE & CRYPTOGRAPHICALLY LOCKED ✅

END OF STEP 23