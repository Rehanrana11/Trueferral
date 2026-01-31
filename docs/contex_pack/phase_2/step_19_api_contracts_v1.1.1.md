PURPOSE

Define the minimal API surface that supports the Trust Engine happy path exactly as locked:

Declare Intent → Introducer Accepts → Freeze Snapshot → Claim Intro → Independent Confirm (Target OR Requester fallback) → Submit Evidence → Mutual Outcome Confirm (2 parties) → Auto Consequences → Dispute (if needed) → Deterministic Admin Resolve

This Step 19 is event-sourcing compliant and Happy-Path compliant.

⸻

19.0 HARD RULES (NON-NEGOTIABLE)
	1.	✅ No Growth Engine APIs in v1 (no discovery, matching, messaging, feed, virality)
	2.	✅ All state changes append Domain Events to Event Log FIRST
	•	Event Log is primary system of record (Step 18)
	•	Snapshot Store / Read Models are derived projections only
	3.	✅ APIs never set state directly
	•	APIs emit events
	•	State is derived from Event Log replay + deterministic Trust Engine
	4.	✅ All write requests are idempotent
	•	Required header: Idempotency-Key: <uuid>
	•	Idempotency window: 24 hours
	5.	✅ Actor identity comes from auth (server-side)
	•	Clients never submit actor_id
	•	Server derives actor from token/session
	6.	✅ Independent verification enforced
	•	Intro confirmation requires: IntroClaimed (I) + IntroConfirmed (T OR R-fallback)
	•	No single actor can advance execution alone
	7.	✅ Binary outcomes
	•	SUCCESS | FAIL | TIMEOUT only
	•	No partial states
	8.	✅ Disputes deterministic
	•	Every admin resolution must cite immutable rule_id
	•	No ad-hoc judgment

⸻

19.1 AUTH (V1)

User Auth

Header:

Authorization: Bearer <user_token>

User roles are contextual per snapshot:
	•	REQUESTER (R)
	•	INTRODUCER (I)

Target / Requester-Fallback Confirmation (No Account Required)

Target and fallback confirmations use signed one-time tokens (Step 18 security boundary).

Token payload (logical):

{
  "snapshot_id": "snp_...",
  "scope": "INTRO_CONFIRM_TARGET|INTRO_CONFIRM_REQUESTER_FALLBACK|OUTCOME_CONFIRM_TARGET|OUTCOME_SUBMIT_TARGET",
  "exp": "ISO8601",
  "nonce": "single_use_random",
  "signature": "HMAC"
}

Admin Auth

Headers:

Authorization: Bearer <admin_token>
X-Admin-Nonce: <per-request-random>

Constraints:
	•	Admin tokens separate from user tokens
	•	Admin actions are rule-bound and event-logged
	•	Admin endpoints rate-limited tighter than user endpoints

⸻

19.2 COMMON HEADERS

Required for all write endpoints (ALL POST/PUT/PATCH)

Content-Type: application/json
Idempotency-Key: <uuid>

Recommended (all endpoints)

X-Client-Version: <string>
X-Request-Trace-Id: <string>

Required response header

X-Request-ID: <server_generated_id>


⸻

19.3 STANDARD RESPONSE ENVELOPE

Success

{
  "ok": true,
  "data": {},
  "meta": {
    "request_id": "req_...",
    "server_time": "2026-01-27T12:00:00Z"
  }
}

Error

{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable description",
    "details": [
      { "field": "time_window_days", "issue": "must_be_between_14_and_365" }
    ]
  },
  "meta": {
    "request_id": "req_...",
    "server_time": "2026-01-27T12:00:00Z"
  }
}

Canonical Error Codes

Auth
	•	AUTH_REQUIRED
	•	FORBIDDEN
	•	TOKEN_INVALID
	•	TOKEN_EXPIRED

Validation / State
	•	VALIDATION_ERROR
	•	NOT_FOUND
	•	CONFLICT
	•	INVALID_STATE_TRANSITION
	•	EVIDENCE_INVALID

Idempotency
	•	IDEMPOTENCY_REPLAY

Rate / Server
	•	RATE_LIMITED
	•	INTERNAL_ERROR

⸻

19.4 DERIVED SNAPSHOT STATES (READ-ONLY)

States are derived (Step 18 state machine). APIs do not set them.
	•	INTENT_DRAFT
	•	INTENT_ACCEPTED
	•	SNAPSHOT_FROZEN
	•	INTRO_CLAIMED
	•	INTRO_CONFIRMED
	•	OUTCOME_SUBMITTED
	•	DISPUTED
	•	OUTCOME_VERIFIED_SUCCESS
	•	OUTCOME_VERIFIED_FAIL
	•	TIMED_OUT

Invariant:
	•	If it’s not in the Event Log, it didn’t happen.
	•	State = deterministic replay of events.

⸻

19.5 EVENT TYPES (V1 MINIMUM — CANONICAL)

These are the only v1 event types referenced by APIs:

Intent + Freeze
	•	IntentDeclared
	•	IntentAccepted
	•	SnapshotFrozen
	•	ReferralTokenIssued

Execution Verification
	•	ExecutionClaimed
	•	ExecutionConfirmed (by TARGET or REQUESTER_FALLBACK)

Outcome
	•	OutcomeEvidenceSubmitted
	•	OutcomeConfirmed (by REQUESTER or TARGET)
	•	OutcomeVerified (mode: MUTUAL | TIMEOUT | ADMIN)
	•	DisputeRaised
	•	DisputeResolved (must include rule_id)

Consequences
	•	ReputationAdjusted
	•	CapacityAdjusted (if you keep capacity ledger)
	•	SnapshotClosed (optional bookkeeping)

System
	•	TimeoutApplied

⸻

19.6 EVIDENCE OBJECT SCHEMA (DETERMINISTIC)

All evidence objects must include:

{
  "type": "FILE|LINK|TEXT_ATTESTATION",
  "ref": "string",
  "description": "string",
  "metadata": {
    "snapshot_id": "snp_123",
    "submitted_at": "ISO8601",
    "sha256": "hex_string"
  }
}

Validation Rules

FILE
	•	Max size: 10MB
	•	Allowed: PDF, PNG, JPG
	•	sha256 required and valid

LINK
	•	Must be HTTPS
	•	Optional v1 allowlist recommended (config):
	•	docs.google.com, drive.google.com, dropbox.com

TEXT_ATTESTATION
	•	Max 1000 chars
	•	No HTML

Invalid evidence returns EVIDENCE_INVALID with deterministic details.

⸻

19.7 TIME WINDOWS (ALIGNED TO STEP 15)
	•	time_window_days:
	•	min: 14
	•	default: 90
	•	max: 365

Any contract that enforces 1–90 is invalid.

⸻

19.8 PRECONDITION TABLE (UPDATED FOR STEP 15 COMPLIANCE)

Endpoint	Required State	Allowed Actor	Core Validations	Events Emitted
POST /v1/intents	(none)	REQUESTER or INTRODUCER	enums valid; time_window_days 14–365; target identifier present; introducer_user_id exists	IntentDeclared
POST /v1/intents/{intent_id}/accept	INTENT_DRAFT	INTRODUCER only	intent exists; introducer matches; accept=true	IntentAccepted
POST /v1/intents/{intent_id}/freeze	INTENT_ACCEPTED	INTRODUCER only	no missing required fields; verify rules locked; creates snapshot_id	SnapshotFrozen
POST /v1/snapshots/{snapshot_id}/tokens/issue	SNAPSHOT_FROZEN or later	REQUESTER or INTRODUCER (as participant)	token scope allowed; expiry bounded	ReferralTokenIssued (recommended)
POST /v1/snapshots/{snapshot_id}/intro/claim	SNAPSHOT_FROZEN	INTRODUCER only	method enum; sent_at ≤ now; cannot claim twice (idempotent)	ExecutionClaimed
POST /v1/confirm/intro	INTRO_CLAIMED	TARGET token OR REQUESTER_FALLBACK token	token valid+unexpired; single-use nonce; confirmed_at ≥ claimed_at	ExecutionConfirmed
POST /v1/snapshots/{snapshot_id}/outcome/submit	INTRO_CONFIRMED	REQUESTER user OR TARGET token	occurred_at > intro_confirmed_at; evidence valid	OutcomeEvidenceSubmitted
POST /v1/confirm/outcome	OUTCOME_SUBMITTED	REQUESTER user OR TARGET token	token valid if token flow; verdict is SUCCESS/FAIL; one confirmation per role	OutcomeConfirmed
POST /v1/snapshots/{snapshot_id}/dispute/open	INTRO_CONFIRMED or OUTCOME_SUBMITTED	REQUESTER/INTRODUCER user OR TARGET token	reason_code enum; evidence optional but validated	DisputeRaised
POST /v1/snapshots/{snapshot_id}/dispute/resolve	DISPUTED	ADMIN only	rule_id exists in immutable rules; verdict enum	DisputeResolved + OutcomeVerified
(system job) Timeout Sweep	varies	SYSTEM	based on timers; emits only if guard true	TimeoutApplied + OutcomeVerified(mode=TIMEOUT)

Key enforcement note (Happy Path):
INTRO_CONFIRMED is derived only when both exist:
	•	ExecutionClaimed by introducer AND
	•	ExecutionConfirmed by TARGET (or REQUESTER_FALLBACK after 72h)

⸻

19.9 API ENDPOINTS (COMMANDS + QUERIES)

19.9.1 Create Intent (DECLARE)

Endpoint: POST /v1/intents
Auth: User (REQUESTER or INTRODUCER)

Request:

{
  "purpose": "HIRING|INVESTMENT|PARTNERSHIP|CUSTOMER|OTHER",
  "value_range": "LOW|MEDIUM|HIGH|CRITICAL",
  "success_condition": "HIRE_MADE|INVESTMENT_CLOSED|CONTRACT_SIGNED|FIRST_PAYMENT|CUSTOM",
  "success_condition_custom": "string_optional_if_CUSTOM",
  "time_window_days": 90,
  "participants": {
    "introducer_user_id": "usr_I",
    "target": {
      "email": "target@company.com",
      "display_name": "Target Name"
    }
  },
  "notes": {
    "context": "≤280 chars factual context"
  }
}

Response:

{
  "ok": true,
  "data": { "intent_id": "int_123", "state": "INTENT_DRAFT" },
  "meta": { "request_id": "req_...", "server_time": "..." }
}

Event:
	•	IntentDeclared

⸻

19.9.2 Introducer Accepts Intent

Endpoint: POST /v1/intents/{intent_id}/accept
Auth: INTRODUCER only

Request:

{ "accept": true, "note": "≤280 chars optional" }

Response:

{
  "ok": true,
  "data": { "intent_id": "int_123", "state": "INTENT_ACCEPTED" },
  "meta": { "request_id": "req_...", "server_time": "..." }
}

Event:
	•	IntentAccepted

⸻

19.9.3 Freeze Snapshot (COMMIT TRUTH)

Endpoint: POST /v1/intents/{intent_id}/freeze
Auth: INTRODUCER only
Precondition: INTENT_ACCEPTED

Request:

{
  "confirm": true,
  "verification_rules": {
    "intro_confirm_timeout_hours": 168,
    "requester_fallback_after_hours": 72,
    "outcome_requires_mutual_confirm": true
  },
  "consequence_rules": {
    "algorithm_version": "v1",
    "asymmetry_factor": 1.0,
    "compound_factor": 1.0
  }
}

Response:

{
  "ok": true,
  "data": { "snapshot_id": "snp_123", "state": "SNAPSHOT_FROZEN" },
  "meta": { "request_id": "req_...", "server_time": "..." }
}

Event:
	•	SnapshotFrozen

⸻

19.9.4 Issue Signed Tokens (Target + Fallback + Outcome)

Endpoint: POST /v1/snapshots/{snapshot_id}/tokens/issue
Auth: REQUESTER or INTRODUCER (participant only)

Request:

{
  "token_type": "INTRO_CONFIRM_TARGET|INTRO_CONFIRM_REQUESTER_FALLBACK|OUTCOME_CONFIRM_TARGET|OUTCOME_SUBMIT_TARGET",
  "expires_in_minutes": 4320
}

Response:

{
  "ok": true,
  "data": {
    "snapshot_id": "snp_123",
    "token_type": "INTRO_CONFIRM_TARGET",
    "token": "tok_....",
    "link": "https://app/confirm/intro?token=tok_....",
    "expires_at": "ISO8601"
  },
  "meta": { "request_id": "req_...", "server_time": "..." }
}

Event (recommended for auditability):
	•	ReferralTokenIssued

⸻

19.9.5 Claim Intro Sent (I)

Endpoint: POST /v1/snapshots/{snapshot_id}/intro/claim
Auth: INTRODUCER only
Precondition: SNAPSHOT_FROZEN

Request:

{ "method": "EMAIL|CALL|MEETING|OTHER", "sent_at": "ISO8601" }

Response:

{
  "ok": true,
  "data": { "snapshot_id": "snp_123", "state": "INTRO_CLAIMED" },
  "meta": { "request_id": "req_...", "server_time": "..." }
}

Event:
	•	ExecutionClaimed

⸻

19.9.6 Confirm Intro Received (T or R fallback)

Endpoint: POST /v1/confirm/intro
Auth: None (signed token)
Precondition: INTRO_CLAIMED

Request:

{ "token": "tok_...", "confirm": true, "confirmed_at": "ISO8601" }

Response:

{
  "ok": true,
  "data": { "snapshot_id": "snp_123", "state": "INTRO_CONFIRMED" },
  "meta": { "request_id": "req_...", "server_time": "..." }
}

Event:
	•	ExecutionConfirmed (payload includes confirmer_role = TARGET or REQUESTER_FALLBACK)

Enforcement: Server rejects if confirmer is introducer or if fallback token used before 72h.

⸻

19.9.7 Submit Outcome Evidence (R or T)

Endpoint: POST /v1/snapshots/{snapshot_id}/outcome/submit
Auth: REQUESTER user OR TARGET token
Precondition: INTRO_CONFIRMED

Request:

{
  "occurred_at": "ISO8601",
  "evidence": [
    {
      "type": "FILE|LINK|TEXT_ATTESTATION",
      "ref": "file_id_or_https_url_or_text",
      "description": "Proof description",
      "metadata": {
        "snapshot_id": "snp_123",
        "submitted_at": "ISO8601",
        "sha256": "hex..."
      }
    }
  ]
}

Response:

{
  "ok": true,
  "data": { "snapshot_id": "snp_123", "state": "OUTCOME_SUBMITTED" },
  "meta": { "request_id": "req_...", "server_time": "..." }
}

Event:
	•	OutcomeEvidenceSubmitted

⸻

19.9.8 Confirm Outcome (Mutual confirmations; 2-party)

Endpoint: POST /v1/confirm/outcome
Auth: REQUESTER user OR TARGET token
Precondition: OUTCOME_SUBMITTED

Request:

{ "token": "tok_optional_for_target", "verdict": "SUCCESS|FAIL", "confirmed_at": "ISO8601" }

Response:

{
  "ok": true,
  "data": { "snapshot_id": "snp_123", "confirmation_recorded": true },
  "meta": { "request_id": "req_...", "server_time": "..." }
}

Event:
	•	OutcomeConfirmed (payload includes confirmer_role)

System behavior (deterministic):
	•	When both confirmations exist and match → system emits:
	•	OutcomeVerified (mode=MUTUAL, verdict=SUCCESS|FAIL)
	•	then ReputationAdjusted (+ capacity events if used)
	•	If confirmations conflict → system emits:
	•	DisputeRaised (auto) and transitions to DISPUTED

⸻

19.9.9 Open Dispute

Endpoint: POST /v1/snapshots/{snapshot_id}/dispute/open
Auth: REQUESTER/INTRODUCER user OR TARGET token
Precondition: INTRO_CONFIRMED or OUTCOME_SUBMITTED

Request:

{
  "reason_code": "EVIDENCE_INVALID|COUNTERPARTY_DENIES|OUTCOME_AMBIGUOUS|FRAUD_SUSPECTED",
  "evidence": []
}

Response:

{
  "ok": true,
  "data": { "snapshot_id": "snp_123", "state": "DISPUTED", "dispute_id": "disp_456" },
  "meta": { "request_id": "req_...", "server_time": "..." }
}

Event:
	•	DisputeRaised

⸻

19.9.10 Resolve Dispute (Admin Only, Rule-Bound)

Endpoint: POST /v1/snapshots/{snapshot_id}/dispute/resolve
Auth: ADMIN only
Precondition: DISPUTED

Request:

{
  "rule_id": "AR-03",
  "verdict": "SUCCESS|FAIL|TIMEOUT",
  "rationale": "Must reference rule_id; factual only"
}

Server validation:
	•	rule_id must exist in immutable arbitration rules set
	•	If invalid → VALIDATION_ERROR

Response:

{
  "ok": true,
  "data": { "snapshot_id": "snp_123", "state": "RESOLVED", "verdict": "SUCCESS" },
  "meta": { "request_id": "req_...", "server_time": "..." }
}

Events:
	1.	DisputeResolved (must include rule_id)
	2.	OutcomeVerified (mode=ADMIN, verdict=...)
	3.	ReputationAdjusted (+ CapacityAdjusted if used)

⸻

19.10 SYSTEM TIMEOUT JOBS (HOURLY) — EVENTS ONLY

Timeouts are system-generated; clients cannot trigger them.

A) Intro Confirmation Timeout

If:
	•	state is INTRO_CLAIMED
	•	and age > intro_confirm_timeout_hours (default 168h / 7 days)

Then system emits:
	•	TimeoutApplied (scope=INTRO_CONFIRM)
	•	OutcomeVerified (mode=TIMEOUT, verdict=TIMEOUT) OR sets snapshot terminal as TIMED_OUT per rules

B) Outcome Window Timeout

If:
	•	state is OUTCOME_SUBMITTED
	•	and age > time_window_days

Then system emits:
	•	TimeoutApplied (scope=OUTCOME_WINDOW)
	•	OutcomeVerified (mode=TIMEOUT, verdict=TIMEOUT or FAIL) per arbitration_rules.md
	•	then consequences events (if rules specify)

⸻

19.11 ADMIN AUDITABILITY (OPTIONAL BUT RECOMMENDED IN V1)

Verify Event Hash Chain

Endpoint: GET /v1/admin/events/{event_id}/verify
Auth: ADMIN only

Response:

{
  "ok": true,
  "data": {
    "event_id": "evt_123",
    "prev_hash": "hex...",
    "stored_hash": "hex...",
    "computed_hash": "hex...",
    "valid": true
  },
  "meta": { "request_id": "req_...", "server_time": "..." }
}

Raw Event Stream for Snapshot (Audit)

Endpoint: GET /v1/admin/snapshots/{snapshot_id}/events?raw=true
Auth: ADMIN only (restricted)

Response returns ordered events.

⸻

19.12 QUERIES (READ-ONLY PROJECTIONS)

These read from projections/read models (never directly from event log).

Get Snapshot

GET /v1/snapshots/{snapshot_id}

List Snapshots (by actor / state)

GET /v1/snapshots?role=REQUESTER|INTRODUCER&state=...&limit=20&cursor=...

Get Reputation Summary (projection)

GET /v1/users/me/reputation

Pagination rules:
	•	limit default 20 max 100
	•	cursor opaque base64

⸻

19.13 HEALTH ENDPOINT (RECOMMENDED)

GET /health (public)

Response:

{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "ISO8601",
  "checks": {
    "database": "ok",
    "event_log": "ok",
    "event_log_integrity_hash": "optional_hex"
  }
}


⸻

19.14 COMPLETION CRITERIA (STEP 19 DONE WHEN)

✅ Step 19 is DONE only if:
	1.	✅ Happy Path is representable without contradiction
	•	Intent → Accept → Freeze → Claim → Confirm → Submit → Mutual Confirm → Auto Consequence
	2.	✅ Independent verification enforced by contracts
	•	INTRO_CONFIRMED requires ExecutionClaimed + ExecutionConfirmed
	3.	✅ Event-sourcing invariants preserved
	•	All writes emit events first
	•	No direct state mutation contracts
	4.	✅ Idempotency required on all writes
	•	Including token-based confirmation endpoints
	5.	✅ Deterministic dispute + rule_id enforcement
	•	Admin cannot resolve without immutable rule_id
	6.	✅ Timeout rules exist as system jobs
	•	System emits TimeoutApplied events and finalizes deterministically

⸻

✅ STEP 19 VALIDATION CHECKLIST (V1.1.1)

Criterion	Status	Evidence
Step 15 sequence enforced (Intent→Accept→Freeze)	✅	Endpoints 19.9.1–19.9.3
Independent intro verification enforced	✅	Claim + token confirm (19.9.5–19.9.6)
Mutual outcome confirmation is 2-party	✅	POST /v1/confirm/outcome + system finalizer
Event Log is primary truth	✅	Rules 19.0 + event mapping 19.5
State derived only	✅	Section 19.4
Deterministic evidence validation	✅	Section 19.6
Deterministic disputes w/ immutable rule_id	✅	Section 19.9.10
Time window aligns to Step 15 (14–365)	✅	Section 19.7


⸻

LOCK STATUS

🔒 LOCKED — BINDING (v1.1.1)
Revision Criteria:
	•	Only if Step 20 (Data Models) reveals a contradiction
	•	Only with founder approval + decision_log.md entry
Until then: Contracts are frozen

⸻

NEXT STEP

→ Step 20: Define Data Models + Ownership (Event Store + Snapshot projections + tokens + evidence + reputation logs)

Instruction: Say “GO — Step 20” when ready.

⸻

METADATA

Created By: Project Owner (Rehan)
Reviewed By: Council (alignment patch)
SSOT Status: ✅ LOCKED
Dependencies: Step 18 (Event Sourcing), Step 15 (Happy Path), Steps 10–16 (Truth & Scope Lock)
Referenced By: Steps 20–24, implementation phases

⸻

END OF STEP 19 (v1.1.1 PATCHED)