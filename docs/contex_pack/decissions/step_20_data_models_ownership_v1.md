## PURPOSE

Define canonical data models, who owns them, and the source-of-truth rules so implementation cannot drift.

**This step is written for the Step 18 architecture:**
- Event Log is primary
- Everything else is derived

---

## 20.0 NON-NEGOTIABLE RULES

1. ✅ **Event Log is the only primary system of record**

2. ✅ **Snapshot Store is a materialized view derived from events**
   - Immutable after freeze (except derived fields rebuilt from events)

3. ✅ **Read Models are projections (query-optimized)**
   - Can be deleted/rebuilt at any time

4. ✅ **No direct state mutation of Snapshot Store or projections from API handlers**
   - API handlers only append events
   - Projections update via event replay

5. ✅ **Every record that matters must include:**
   - `id` (stable, unique)
   - `created_at`, `updated_at`
   - `created_by` (actor)
   - `snapshot_id` (if applicable)
   - `version` or `sequence` (if applicable)

6. ✅ **PII minimization**
   - Store only what is required to execute the trust loop
   - Minimize target email exposure
   - Redact where possible

---

## 20.1 CORE ENTITIES (WHAT EXISTS IN V1)

### A) User (Human Account)

**Owned by:** Identity/Auth module

**Primary truth:** Auth provider + User table (non-event-sourced is acceptable for identity)

**Used by:** Snapshot participants, authorization

---

#### Fields (Minimum):



user_id: String (usr_*)
email: String (unique)
display_name: String
role_flags: Set<String> (e.g., can_introduce)
domain_tags: Array<String> (manual, v1)
status: Enum (active|suspended)
created_at: ISO8601
updated_at: ISO8601


---

#### Notes:

**v1 can keep identity in normal relational tables (not event-sourced)** as long as trust state is event-sourced.

**Rationale:**
- Identity is simpler with traditional auth
- Trust state requires event sourcing
- Separation is clean

---

### B) Snapshot (Truth Snapshot)

**Owned by:** Trust Engine

**Primary truth:** Event Log

**Materialized view:** Snapshot Store

**Purpose:** Atomic "contract object" that binds:
- Intent
- Participants
- Time window
- Verification mode
- Stakes (v1: optional/none)

---

#### Canonical Snapshot Fields (Materialized View):



snapshot_id: String (snp_*)
state: Enum (derived from events)
// Intent (immutable after SnapshotFrozen)
domain_tags: Array<String>
intent_objective: Enum (PARTNER|HIRE|INVEST|BUY|SELL)
value_min_usd: Integer
value_max_usd: Integer
success_condition: Enum (INTRO_OCCURRED|CONTRACT_SIGNED|PAYMENT_RECEIVED)
time_window_days: Integer
// Participants (immutable after SnapshotFrozen)
participants: {
requester_user_id: String (usr_)
introducer_user_id: String (usr_)
target_email: String (PII - store minimal)
target_display_name: String (optional)
}
// Key timestamps (all derived from events)
frozen_at: ISO8601 (nullable)
intro_claimed_at: ISO8601 (nullable)
intro_confirmed_at: ISO8601 (nullable)
outcome_submitted_at: ISO8601 (nullable)
outcome_verified_at: ISO8601 (nullable)
timed_out_at: ISO8601 (nullable)
disputed_at: ISO8601 (nullable)
resolved_at: ISO8601 (nullable)
// Integrity
last_event_id: String (evt_*)
event_seq_max: Integer (latest sequence number)
// Metadata
created_at: ISO8601
updated_at: ISO8601


---

#### Immutability Rule:

**The definition of the snapshot (participants + intent) is immutable after `SnapshotFrozen`.**

**Derived fields can be rebuilt from events.**

**What's immutable:**
- `participants`
- `intent_objective`
- `value_min_usd`, `value_max_usd`
- `success_condition`
- `time_window_days`
- `domain_tags`

**What's derived (rebuildable):**
- `state`
- All timestamps
- `last_event_id`, `event_seq_max`

---

### C) Event Log (Primary System of Record)

**Owned by:** Event Store module

**Primary truth:** THIS TABLE ONLY

**Table:** `events`

---

#### Fields:



event_id: String (evt_*) - globally unique
snapshot_id: String (nullable for system/global events)
event_type: Enum (see 20.3 for list)
seq: Integer (monotonic per snapshot: 1..N) - REQUIRED
occurred_at: ISO8601 (server time)
actor_type: Enum (USER|TARGET_TOKEN|SYSTEM|ADMIN)
actor_id: String (usr_* | admin_* | token_hash | system)
payload: JSON (schema per event_type)
// Hash chain (tamper-evident)
prev_hash: String (SHA256 hex)
hash: String (SHA256 over canonical serialized event)
// Metadata
created_at: ISO8601


---

#### Hard Invariants:

✅ **Append-only**
- No UPDATE allowed
- No DELETE allowed
- Only INSERT operations

✅ **seq unique per snapshot_id**


for each snapshot_id:
seq values = [1, 2, 3, …, N]
no gaps, no duplicates


✅ **Hash chain must validate end-to-end**


for each event (after first):
assert event.prev_hash == hash(previous_event)


---

#### Hash Computation:



canonical_event_string =
event_id + “|” +
snapshot_id + “|” +
event_type + “|” +
seq + “|” +
occurred_at + “|” +
actor_type + “|” +
actor_id + “|” +
JSON.stringify(payload, sort_keys=true) + “|” +
prev_hash
event.hash = SHA256(canonical_event_string)


---

### D) Evidence

**Owned by:** Trust Engine

**Primary truth:** Event Log (evidence exists via events)

**Storage:** Object storage for files + evidence metadata in events and/or evidence index table

---

#### Evidence Types (V1):

- `FILE` - PDF/PNG/JPG ≤10MB
- `LINK` - HTTPS only
- `TEXT_ATTESTATION` - ≤1000 chars

---

#### Evidence Metadata (Minimum):



evidence_id: String (evd_)
snapshot_id: String (snp_)
submitted_by: String (actor_id)
submitted_at: ISO8601
type: Enum (FILE|LINK|TEXT_ATTESTATION)
ref: String (object key or URL or text)
sha256: String (hex)
description: String (max 500 chars)
// Metadata
created_at: ISO8601


---

#### PII Note:

**Links/text may contain PII:**
- Keep minimal
- Redact where possible
- Log access

---

### E) Confirmation Tokens (Target / Requester Fallback / Outcome Submit)

**Owned by:** Auth/Token service

**Primary truth:** Token store (not event-sourced) + `TokenIssued` events (audit)

---

#### Fields:



token_id: String (tok_)
snapshot_id: String (snp_)
token_type: Enum (
INTRO_CONFIRM_TARGET |
INTRO_CONFIRM_REQUESTER_FALLBACK |
OUTCOME_SUBMIT_TARGET
)
token_hash: String (store hash, NOT raw token)
expires_at: ISO8601
used_at: ISO8601 (nullable)
issued_by: String (usr_* or system)
created_at: ISO8601


---

#### Rule:

**Token usage emits corresponding events** (e.g., `IntroConfirmed`).

**Security:**
- Store hash only (SHA256 of token)
- Token is single-use (enforce via `used_at`)
- Expiration enforced server-side

---

### F) Dispute

**Owned by:** Trust Engine

**Primary truth:** Event Log

**Materialized view:** Dispute view for admin UI

---

#### Fields (Derived/Materialized):



dispute_id: String (dsp_)
snapshot_id: String (snp_)
status: Enum (OPEN|RESOLVED)
reason_code: Enum (
EVIDENCE_INVALID |
COUNTERPARTY_DENIES |
OUTCOME_AMBIGUOUS |
FRAUD_SUSPECTED
)
opened_by: String (actor_id)
opened_at: ISO8601
resolved_by: String (admin_* or system)
resolved_at: ISO8601 (nullable)
rule_id: String (immutable reference to arbitration rule)
verdict: Enum (SUCCESS|FAIL|TIMEOUT) (nullable until resolved)
// Metadata
created_at: ISO8601
updated_at: ISO8601


---

#### Rule:

**Dispute resolution must reference immutable arbitration rules.**

**Validation:**


if dispute is resolved:
assert rule_id exists in arbitration_rules.md
assert verdict is not null


---

### G) Trust / Reputation Ledger (V1 Minimal)

**Owned by:** Trust Engine

**Primary truth:** Event Log (reputation adjustments as events)

**Materialized view:** `reputation_view` per user/domain

---

#### V1 Minimal Model (Do Not Overbuild):



user_id: String (usr_*)
domain_tag: String (nullable for global)
success_count: Integer
fail_count: Integer
timeout_count: Integer
score: Integer (derived; formula defined in Step 21 policy, not here)
last_updated_at: ISO8601


---

#### Important:

**The algorithm is defined in Step 21 policy doc and referenced here.**

**This table only stores counts and computed score.**

**Computation:**
- Triggered by `ReputationAdjusted` event
- Formula in policy document
- Deterministic calculation

---

### H) Capacity Ledger (V1 Basic)

**Owned by:** Trust Engine

**Primary truth:** Event Log (`CapacityAdjusted` events)

**Materialized view:** `capacity_view`

---

#### Fields (Derived):



user_id: String (usr_*)
max_active_snapshots: Integer (default 3, configurable)
active_snapshot_count: Integer (derived from events)
available_capacity: Integer (derived: max - active)
last_updated_at: ISO8601


---

#### Rule:

**Capacity is enforced at `POST /v1/snapshots` creation time.**

**Validation:**


if user.available_capacity <= 0:
return FORBIDDEN(“Capacity limit reached”)


---

## 20.2 OWNERSHIP MAP (WHO CAN WRITE WHAT)

| Data / Entity | Owner Module | Who Can Write | How Writes Happen |
|---------------|--------------|---------------|-------------------|
| User | Identity/Auth | user (self) / admin | direct DB (identity system) |
| Event Log | Event Store | App Service only | append events only |
| Snapshot Store | Trust Engine | nobody directly | rebuilt/materialized from events |
| Read Models | Query/Projection | system | projection rebuild jobs |
| Evidence files | Storage | system | object storage write + event |
| Token Store | Token Service | system | issue token + audit event |
| Dispute View | Trust Engine | nobody directly | derived from events |
| Reputation View | Trust Engine | system | derived from events |
| Capacity View | Trust Engine | system | derived from events |

---

### Key Rule:

**Users never "update snapshot state."**

**Flow:**


User submits command
→ API handler validates
→ Event appended to Event Log
→ Projection job reads event
→ Derived state updated


---

## 20.3 EVENT TYPES (MINIMUM SET FOR V1)

**These must exist (exact names can be used as enums):**

1. `SnapshotCreated`
2. `SnapshotFrozen`
3. `TokenIssued`
4. `IntroClaimed`
5. `IntroConfirmed`
6. `OutcomeSubmitted`
7. `OutcomeVerifiedSuccess`
8. `OutcomeVerifiedFail`
9. `DisputeOpened`
10. `DisputeResolved`
11. `ReputationAdjusted`
12. `CapacityAdjusted`
13. `TimeoutApplied`

---

### Invariant:

**Every write endpoint from Step 19 must map to ≥1 event above.**

**Verification:**


for each POST/PUT endpoint in Step 19:
assert endpoint emits at least one event from this list


---

## 20.4 DATA CLASSIFICATION (SECURITY / COMPLIANCE)

### PII (High Sensitivity):

**Data:**
- `user.email`
- `target_email`
- Evidence content
- Token hashes

**Requirements:**
- Encrypt at rest
- Access logging
- Minimal retention
- Redaction where possible

---

### Operational (Medium):

**Data:**
- Snapshot intent
- `value_range`
- Timestamps

**Requirements:**
- Encrypt at rest
- Standard access controls

---

### Audit (High Integrity):

**Data:**
- Event Log hashes
- `seq`
- `prev_hash`

**Requirements:**
- Immutable storage
- Hash verification
- Admin access logging

---

### Storage Requirements (V1):

✅ **Encrypt at rest**
- Database encryption
- Object storage encryption

✅ **TLS in transit**
- All API calls over HTTPS
- Database connections over TLS

✅ **Strict admin access logging**
- All audit endpoint access logged
- Log retention: 1 year minimum

---

## 20.5 CONSTRAINTS (V1 SCOPE GUARD)

**Explicitly excluded from data model in v1:**

❌ **Organizations/teams**
- No org accounts
- No team memberships
- Individuals only

❌ **Messaging/chat threads**
- No message tables
- No conversation history
- Off-platform communication

❌ **Social graphs, follower graphs**
- No follower relationships
- No social connections
- No network analysis

❌ **Matching recommendations**
- No match scores
- No recommendation tables
- No discovery data

❌ **Feed/posts/comments**
- No content tables
- No engagement metrics
- No social features

❌ **Payments/escrow**
- No payment tables
- No transaction records
- No financial data

❌ **Multi-stage contracts**
- No workflow stages
- No approval chains
- Single snapshot only

---

## 20.6 COMPLETION CRITERIA (STEP 20 DONE WHEN)

**✅ Step 20 is DONE only if:**

1. ✅ **Every entity above has a defined minimal schema**
   - Users, Snapshots, Events, Evidence, Tokens, Disputes, Reputation, Capacity
   - All fields specified

2. ✅ **Ownership map is explicit and consistent with Step 18**
   - Event sourcing enforced
   - No direct mutations
   - Clear ownership

3. ✅ **PII is identified and minimized**
   - Section 20.4 classification exists
   - Encryption requirements specified

4. ✅ **Event types are enumerated and cover all write actions**
   - Section 20.3 lists all 13 event types
   - Maps to Step 19 endpoints

5. ✅ **v1 exclusions are stated to prevent creep**
   - Section 20.5 explicit exclusions
   - Scope guard active

---

## VALIDATION CHECKLIST

| Criterion | Status | Evidence |
|-----------|--------|----------|
| All core entities defined | ✅ | Section 20.1 (8 entities) |
| Ownership map complete | ✅ | Section 20.2 table |
| Event types enumerated | ✅ | Section 20.3 (13 types) |
| PII classified | ✅ | Section 20.4 |
| Exclusions explicit | ✅ | Section 20.5 |
| Event sourcing enforced | ✅ | All entities reference Event Log as truth |

---

## ENTITY RELATIONSHIP DIAGRAM (TEXT)



USER (Identity Store)
|
| creates/participates in
↓
SNAPSHOT (Materialized View)
← derived from ←
EVENT LOG (Primary Truth)
↓ emits
↓
EVENTS:
	∙	SnapshotCreated
	∙	SnapshotFrozen
	∙	TokenIssued → TOKEN STORE
	∙	IntroClaimed
	∙	IntroConfirmed
	∙	OutcomeSubmitted → EVIDENCE STORE
	∙	OutcomeVerified*
	∙	DisputeOpened → DISPUTE VIEW
	∙	DisputeResolved
	∙	ReputationAdjusted → REPUTATION VIEW
	∙	CapacityAdjusted → CAPACITY VIEW
	∙	TimeoutApplied
All projections rebuild from Event Log if corrupted.


---

## LOCK STATUS

🔒 **LOCKED** - Data models are binding for v1

**Revision Criteria:**
- Only if Step 21 (Error Handling) reveals missing error states
- Only if Step 22 (Logging) reveals missing audit fields
- Only with founder approval + decision_log.md entry

**Until then:** These models are frozen.

---

## NEXT STEP

→ **Step 21:** Define Error Handling Policy

**Instruction:** Say "GO — Step 21" when ready

---

## METADATA

**Created By:** Project Owner (Rehan)  
**Reviewed By:** Expert Council + Claude  
**SSOT Status:** ✅ LOCKED  
**Dependencies:** Steps 18 (Event Sourcing), 19 (API Contracts)  
**Referenced By:** Steps 21-24, all implementation phases

---

**END OF STEP 20**