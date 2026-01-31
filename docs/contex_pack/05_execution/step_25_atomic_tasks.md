## PURPOSE

Convert frozen v1 scope into executable 30-60 minute atomic tasks with binary completion criteria.

**Goal:** Every requirement from Steps 18-23 maps to at least one task with clear Done-When conditions.

---

## 25.0 NON-NEGOTIABLE RULES

**Task Requirements:**
- ✅ Every task is 30-60 minutes maximum (if larger → split)
- ✅ Each task has: ID, Outcome, Done-When
- ✅ v1 is **Trust Engine only** (no Growth Engine work)

**Technical Requirements:**
- ✅ All write actions are Event-Sourced: append event → project views
- ✅ All write endpoints require `Idempotency-Key` header
- ✅ Snapshot state transitions centrally validated (no ad-hoc transitions)
- ✅ Disputes reference immutable `rule_id` from stored arbitration rules

---

## A) REPO + RUNTIME SKELETON (Trust Engine Only)

### T-001: Create repo structure
**Outcome:** Standard folders exist (`/docs`, `/src`, `/tests`, `/infra`, `/scripts`)  
**Done-when:** Committed tree matches structure

### T-002: Add .env.example with all config keys
**Outcome:** All required env vars listed with comments  
**Done-when:** `.env.example` committed

### T-003: Add config loader + validation (fail-fast)
**Outcome:** Service refuses to start if required env missing/invalid  
**Done-when:** Missing env → exits with deterministic error code

### T-004: Add dependency manifest + lockfile
**Outcome:** Deterministic installs  
**Done-when:** Clean install succeeds on new machine

### T-005: Create minimal service entrypoint + health endpoint
**Outcome:** `/health` returns OK + `request_id`  
**Done-when:** `curl` returns JSON with `request_id`

---

## B) LOGGING + ERROR SYSTEM (Per Steps 21-22)

### T-010: Implement request_id middleware
**Outcome:** Every request has `X-Request-ID` (generated if absent)  
**Done-when:** Responses include header + logs include `request_id`

### T-011: Implement structured JSON logger utility
**Outcome:** Log lines are valid JSON with required fields  
**Done-when:** Sample log includes `request_id`, `route`, `actor_type`

### T-012: Implement standard error envelope
**Outcome:** Consistent `{error:{code,message,details,request_id}}`  
**Done-when:** Forced validation error returns envelope

### T-013: Implement canonical error taxonomy constants
**Outcome:** Central list of error codes (no ad-hoc strings)  
**Done-when:** Unknown error code cannot be emitted without failing tests/lint

### T-014: Enforce Idempotency-Key header on write endpoints
**Outcome:** Missing header → `400 IDEMPOTENCY_KEY_REQUIRED`  
**Done-when:** Verified on 2+ write endpoints

### T-015: Add retry guidance headers
**Outcome:** `429` includes `Retry-After`; `202` includes recovery token  
**Done-when:** Verified for at least one 429 and one 202 path

### T-016: Implement CRITICAL alert hook stub (log-first v1)
**Outcome:** Integrity events emit `severity=P1` log event  
**Done-when:** Simulated hash-chain failure triggers P1 log event

### T-017: Implement idempotency key storage + 24h TTL + response caching
**Outcome:** Duplicate `Idempotency-Key` returns cached response; no extra events  
**Done-when:** Repeat request yields identical response + event count unchanged

---

## C) DATA LAYER: TABLES + MIGRATIONS (Step 20)

### T-020: Create DB migration framework
**Outcome:** Apply/rollback works  
**Done-when:** Migrate up/down works in local DB

### T-021: Create users table (identity store)
**Outcome:** Minimal fields (email, verified flags, created_at)  
**Done-when:** Insert/select works

### T-022: Create snapshots materialized view table
**Outcome:** State + `last_event_id` + `event_seq_max` + timestamps  
**Done-when:** View row can be created/updated only by projector

### T-023: Create event_log table (primary record)
**Outcome:** Append-only rows with seq, prev_hash, hash, canonical payload  
**Done-when:** Insert works and ordering constraint exists

### T-024: Create evidence table + storage metadata
**Outcome:** Evidence references `snapshot_id` + content hash + location  
**Done-when:** Insert evidence metadata works

### T-025: Create tokens table (hashed one-time tokens)
**Outcome:** `token_hash` + purpose + expires_at + used_at  
**Done-when:** Token verify + consume works

### T-026: Create reputation_ledger projection table
**Outcome:** Computed reputation state per actor  
**Done-when:** Projector can rebuild from events (stub ok)

### T-027: Create capacity_ledger projection table
**Outcome:** Active snapshot count + max active  
**Done-when:** Projector updates counts deterministically

### T-028: Create arbitration_rules table (immutable, versioned)
**Outcome:** `rule_id` exists, immutable rule bodies, versioned publishing  
**Done-when:** Rule can be referenced by dispute resolution; updates prohibited (only new version)

---

## D) CRYPTO INTEGRITY (Hash Chain) — Required by Step 23

### T-030: Implement RFC 8785 canonical JSON serialization utility
**Outcome:** Deterministic serialization for hashing  
**Done-when:** Same payload → same canonical bytes always

### T-031: Implement event hash computation (SHA-256 over canonical event)
**Outcome:** Hash covers full canonical event document  
**Done-when:** Unit test checks stable hash for fixed input

### T-032: Implement per-snapshot hash-chain append enforcement
**Outcome:** `event(n).prev_hash == hash(n-1)`  
**Done-when:** Wrong `prev_hash` rejects append with deterministic error

### T-033: Implement genesis prev_hash rule
**Outcome:** First event uses 64 zero bytes  
**Done-when:** Test passes for first event

### T-034: Implement admin verify endpoint for event hash integrity
**Outcome:** Returns `{valid:true/false}` + computed hash info  
**Done-when:** Tampered event fails verification

---

## E) CORE COMMANDS + API ENDPOINTS (Step 19) — Command Side

### T-040: Implement AuthN/AuthZ stubs (user tokens + roles)
**Outcome:** Endpoints enforce `actor_type` + ownership rules  
**Done-when:** Unauthorized requests rejected deterministically

### T-040.5: Implement separate admin token validation
**Outcome:** Admin endpoints accept only admin tokens; user tokens rejected  
**Done-when:** Admin endpoint rejects user token and logs security event

### T-041: Implement "Create Snapshot" command + endpoint
**Outcome:** `POST /v1/snapshots` emits `SnapshotCreated`  
**Done-when:** Event exists + snapshot view row created

### T-041.5: Implement centralized snapshot state machine validator
**Outcome:** Invalid transitions rejected with `INVALID_STATE_TRANSITION`  
**Done-when:** Tests cover 10+ invalid transitions

### T-042: Implement "Freeze Snapshot" command
**Outcome:** Snapshot becomes immutable and state → `SNAPSHOT_FROZEN`  
**Done-when:** Edits rejected after freeze

### T-043: Implement "Claim Intro Sent" (introducer only)
**Outcome:** Emits `IntroClaimed`  
**Done-when:** Requires `SNAPSHOT_FROZEN`

### T-044: Implement token generation for Target confirmation link
**Outcome:** One-time token created, stored hashed, expiry enforced  
**Done-when:** Raw token never stored; token usable once

### T-045: Implement "Confirm Intro Received" (target via token)
**Outcome:** Emits `IntroConfirmed`  
**Done-when:** Invalid/expired token → `410`; used token → `410`

### T-046: Implement requester fallback confirmation (time-bound)
**Outcome:** Requester may confirm if target silent after X days  
**Done-when:** Server time + state rules enforced

### T-047: Implement "Submit Outcome Evidence" endpoint
**Outcome:** Emits `OutcomeSubmitted` + evidence metadata saved  
**Done-when:** Evidence validated (type/size/hash rules)

### T-048.5: Implement evidence file storage (content-addressed SHA-256)
**Outcome:** Files stored/retrieved with SHA-256 verification  
**Done-when:** Upload/download verified; hash mismatch rejected

### T-048: Implement "Verify Outcome" endpoint (mutual or admin)
**Outcome:** Emits `OutcomeVerified(success|fail|timeout)`  
**Done-when:** Requires intro confirmed + causal timestamps

### T-049: Implement dispute open endpoint
**Outcome:** Emits `DisputeOpened`  
**Done-when:** Allowed states only; deterministic checks

### T-050: Implement dispute resolve endpoint (admin) with rule_id enforcement
**Outcome:** Emits `DisputeResolved(rule_id=...)` referencing arbitration_rules  
**Done-when:** Unknown `rule_id` rejected; rule version immutable

### T-051: Implement deterministic reputation update handler
**Outcome:** Emits `ReputationUpdated` based on outcome + rules  
**Done-when:** Same inputs → same outputs test passes

### T-052: Implement non-linear penalty rule (v1 simple)
**Outcome:** Second failure impact > first failure impact  
**Done-when:** Unit test demonstrates nonlinearity

### T-053: Implement capacity update handler
**Outcome:** Emits `CapacityAdjusted` and updates projection  
**Done-when:** Max active enforced deterministically

---

## F) READ APIs + TIMELINE (Query Side)

### T-060: Implement GET snapshot by id (materialized view)
**Outcome:** Returns state + key fields  
**Done-when:** Response matches view table

### T-061: Implement GET snapshot timeline (sanitized events)
**Outcome:** Ordered lifecycle view; sensitive fields removed  
**Done-when:** Logs/events are correctly sanitized

### T-062: Implement admin raw event log endpoint (with hashes)
**Outcome:** Audit output includes `prev_hash` + `hash` + canonical event  
**Done-when:** Verify endpoint can validate returned events

### T-063: Implement list snapshots with pagination
**Outcome:** Cursor pagination works  
**Done-when:** Stable pagination tested

---

## G) BACKGROUND JOBS (Timeouts + Rebuild) — Required by Step 22

### T-070: Implement timeout processor job skeleton
**Outcome:** Scheduled job runs hourly with `JOB_*` logs  
**Done-when:** `JOB_STARTED`/`JOB_COMPLETED` emitted

### T-071: Implement intro-claimed timeout transition
**Outcome:** `INTRO_CLAIMED` > 7 days → `TIMED_OUT`  
**Done-when:** Emits `TimeoutApplied`

### T-072: Implement outcome-submitted timeout transition
**Outcome:** `OUTCOME_SUBMITTED` > `time_window_days` → `TIMED_OUT`  
**Done-when:** Emits `TimeoutApplied`

### T-073: Implement projection rebuild job (on-demand)
**Outcome:** Rebuild view tables from event log  
**Done-when:** Can drop views and rebuild successfully

---

## H) TESTS (Acceptance-Driven)

### T-080: Unit tests for canonical JSON + hashing
**Outcome:** Stable hash + chain verification  
**Done-when:** Tests green

### T-081: Unit tests for state machine transitions
**Outcome:** Invalid transition rejected deterministically  
**Done-when:** Tests cover 10+ invalid transitions

### T-082a: Integration test setup: seed users + create snapshot + freeze
**Outcome:** Reproducible fixture for full flow  
**Done-when:** Setup completes with deterministic IDs

### T-082b: Integration test execution: full happy path (1 referral)
**Outcome:** Create → freeze → claim → confirm → outcome → reputation  
**Done-when:** Passes end-to-end locally

### T-083: Integration test: idempotency edge case
**Outcome:** Duplicate request returns cached response; no extra events  
**Done-when:** Event count unchanged + same response body

### T-084: Integration test: dispute open + resolve with rule_id
**Outcome:** Deterministic resolution referencing immutable rules  
**Done-when:** Passes; `rule_id` validated

### T-085a: Acceptance scenario 1: Verified referral #1
**Outcome:** Produces complete artifacts for AC checks  
**Done-when:** Output bundle generated

### T-085b: Acceptance scenario 2: Verified referral #2
**Outcome:** Second run validates non-linear penalties  
**Done-when:** Reputation delta shows nonlinearity

### T-085c: Acceptance scenario 3: Verified referral #3
**Outcome:** Validates dispute + deterministic arbitration reference  
**Done-when:** Dispute resolved referencing `rule_id` with immutable rules

---

## 25.1 STEP 25 COMPLETION CRITERIA (PASS/FAIL)

### ✅ PASS IF:
- ✅ Every requirement from Steps 18-23 maps to at least one task ID
- ✅ No task exceeds 60 minutes
- ✅ Added tasks exist: T-017, T-028, T-040.5, T-041.5, T-048.5
- ✅ Split tasks exist: T-082a/b and T-085a/b/c
- ✅ No Growth Engine tasks exist

### ❌ FAIL IF:
- ❌ Missing any of: hash chain, idempotency storage, arbitration rules storage, evidence storage, centralized state machine validation
- ❌ Any task is vague ("build API") without Done-When
- ❌ Any task includes non-goals or v2 scope

---

## TASK COUNT SUMMARY

**Total Tasks:** 53 atomic tasks
- **Repo/Runtime:** 5 tasks (T-001 to T-005)
- **Logging/Errors:** 8 tasks (T-010 to T-017)
- **Data Layer:** 9 tasks (T-020 to T-028)
- **Crypto Integrity:** 5 tasks (T-030 to T-034)
- **Core Commands:** 14 tasks (T-040 to T-053)
- **Read APIs:** 4 tasks (T-060 to T-063)
- **Background Jobs:** 4 tasks (T-070 to T-073)
- **Tests:** 8 tasks (T-080 to T-085c)

---

## VALIDATION CHECKLIST

| Criterion | Status | Evidence |
|-----------|--------|----------|
| All tasks 30-60 min max | ✅ | Each task scoped to single function/endpoint |
| Every task has Done-When | ✅ | All 53 tasks include completion criteria |
| Trust Engine only | ✅ | No matching, messaging, or payments |
| Event sourcing enforced | ✅ | All writes emit events first |
| Idempotency required | ✅ | T-014, T-017 enforce headers + storage |
| State machine centralized | ✅ | T-041.5 validates transitions |
| Disputes use rule_id | ✅ | T-028, T-050 enforce immutable rules |
| Hash chain complete | ✅ | T-030 to T-034 implement integrity |
| Evidence storage | ✅ | T-024, T-048.5 handle files |
| Tests acceptance-driven | ✅ | T-085a/b/c map to AC scenarios |

---

## NEXT STEP AUTHORIZATION

**Step 25 Status:** ✅ COMPLETE & LOCKED

**Authorization:** Task list is frozen and ready for dependency ordering

**Next Step:** Step 26 — Order Tasks by Dependency Graph

**Instruction:** Say **"GO — Step 26"** to create dependency-ordered execution sequence with critical path analysis

---

## METADATA

**Created By:** Project Owner (Rehan) + Expert Council  
**Reviewed By:** Council validation passed  
**Dependencies:** Steps 18-23 (Architecture, API Contracts, Data Models, Threat Model)  
**Referenced By:** Step 26 (Dependency Graph), Step 30 (Task Validation)

**STEP 25 STATUS:** ✅ COMPLETE & LOCKED

---

**END OF STEP 25**