## 21.1 PURPOSE

Define a single, binding error-handling standard that:
- ✅ Preserves trust invariants
- ✅ Prevents silent or partial failure
- ✅ Enforces determinism
- ✅ Guarantees auditability
- ✅ Enables reliable retries and recovery

**This policy is mandatory for all v1 code.**

---

## 21.2 NON-NEGOTIABLE PRINCIPLES

### 1. No State Mutation on Client Error

**Rule:** Any 4xx error MUST NOT append domain events.

**Why:** Client errors indicate request problems, not valid state transitions.

**Enforcement:**


if error is 4xx:
assert no events written to Event Log


---

### 2. Deterministic Errors

**Rule:** Same inputs + same system state ⇒ same error code + same message class.

**Why:** Enables reliable debugging and client handling.

**Test:**


execute(request_1) → error_A
execute(request_1) → error_A (must be identical)


---

### 3. Idempotency Is Required for All Writes

**Rule:** Duplicate requests must return the original result, never create new events.

**Why:** Network failures require safe retries.

**Implementation:** `Idempotency-Key` header mandatory (see 21.6)

---

### 4. Atomic Command Boundary

**Rule:** Either:
- Event append succeeds (and is recoverable), OR
- Nothing persists

**Why:** No partial state.

**Enforcement:**


try:
validate()
append_event()
commit_transaction()
except:
rollback()
return error


---

### 5. All Failures Are Observable

**Rule:** Every error produces structured logs with correlation identifiers.

**Why:** Debugging requires traceability.

**Mandatory fields:** (see 21.10)

---

## 21.3 ERROR TAXONOMY (CANONICAL)

### A) Client / Caller Errors — 4xx (No Events Written)

| Status | Code | Meaning |
|--------|------|---------|
| 400 | `BAD_REQUEST` | Malformed input, missing fields, missing headers |
| 401 | `UNAUTHORIZED` | Invalid or missing auth |
| 403 | `FORBIDDEN` | Authenticated but wrong actor |
| 404 | `NOT_FOUND` | Resource/token not found |
| 409 | `CONFLICT` | Illegal state transition, idempotency conflict |
| 410 | `GONE` | Token expired or already used |
| 413 | `PAYLOAD_TOO_LARGE` | Evidence too large |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Invalid evidence type |
| 422 | `UNPROCESSABLE_ENTITY` | Business rule violated |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded |

---

**Invariant:** 4xx errors must NEVER write domain events.

**Verification:**
```sql
SELECT COUNT(*) 
FROM events 
WHERE request_id IN (
  SELECT request_id FROM error_log WHERE status_code >= 400 AND status_code < 500
);
-- Result must be 0


B) Server Errors — 5xx (Recoverable via Idempotency)



|Status|Code                  |Meaning                                  |
|------|----------------------|-----------------------------------------|
|500   |`INTERNAL_ERROR`      |Invariant violation, unexpected exception|
|502   |`UPSTREAM_UNAVAILABLE`|Dependency outage (DB, storage)          |
|503   |`UPSTREAM_UNAVAILABLE`|Service temporarily unavailable          |
|504   |`TIMEOUT`             |Command exceeded execution window        |

Invariant: If event append status is uncertain, assume append succeeded and return 202 ACCEPTED.
Why: Prevents duplicate events on retry.
Implementation:

try:
  event_id = append_event()
  return 200, {"event_id": event_id}
except UncertainOutcome:
  # Event may or may not have been written
  return 202, {"recovery_token": generate_token()}


21.4 STANDARD ERROR ENVELOPE (ALL ENDPOINTS)
Format:

{
  "error": {
    "code": "SNAPSHOT_STATE_INVALID",
    "message": "Snapshot state does not allow this action.",
    "details": {
      "snapshot_id": "snap_123",
      "required_state": "SNAPSHOT_FROZEN",
      "actual_state": "INTRO_CONFIRMED"
    }
  },
  "request_id": "req_abc123"
}


Rules:
✅ code → Stable, machine-readable (UPPER_SNAKE_CASE)
	∙	Never changes for same error
	∙	Clients can switch on this
✅ message → Human-readable, no secrets
	∙	Safe to display to users
	∙	No PII, no tokens, no internal details
✅ details → Safe structured context only
	∙	Helps debugging
	∙	No sensitive data
	∙	Optional (can be omitted)
✅ request_id → Always present
	∙	Also returned as X-Request-ID header
	∙	Links to logs

Examples:
Authentication failure:

{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token."
  },
  "request_id": "req_xyz789"
}


State validation failure:

{
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot claim intro for snapshot in current state.",
    "details": {
      "snapshot_id": "snap_456",
      "current_state": "DISPUTED",
      "required_state": "SNAPSHOT_FROZEN"
    }
  },
  "request_id": "req_abc123"
}


21.5 PRECONDITIONS ENFORCEMENT ORDER (COMMAND GATE)
Write commands must validate in strict order:

1. Authentication (AuthN)
   ↓
2. Authorization (AuthZ)
   ↓
3. Input validation
   ↓
4. Snapshot state validation
   ↓
5. Causality validation (timestamps)
   ↓
6. Business rule validation
   ↓
7. Idempotency check
   ↓
8. Event append
   ↓
9. Projection/materialization


Failure at any step stops execution immediately.

Implementation Pattern:

def handle_command(request):
  # 1. AuthN
  user = authenticate(request.headers.get('Authorization'))
  if not user:
    return 401, error("UNAUTHORIZED")
  
  # 2. AuthZ
  if not can_perform_action(user, request.action):
    return 403, error("FORBIDDEN")
  
  # 3. Input validation
  if not validate_schema(request.body):
    return 400, error("BAD_REQUEST", details=validation_errors)
  
  # 4. State validation
  snapshot = get_snapshot(request.snapshot_id)
  if snapshot.state != required_state:
    return 409, error("INVALID_STATE_TRANSITION")
  
  # 5. Causality validation
  if request.occurred_at <= snapshot.intro_confirmed_at:
    return 422, error("TIMESTAMP_ORDERING_VIOLATION")
  
  # 6. Business rules
  if violates_business_rule(request):
    return 422, error("BUSINESS_RULE_VIOLATION")
  
  # 7. Idempotency
  existing = check_idempotency(request.idempotency_key)
  if existing:
    return 200, existing.response  # Return cached result
  
  # 8. Event append
  event_id = append_event(build_event(request))
  
  # 9. Projection (async or sync)
  update_projections(event_id)
  
  return 200, success_response(event_id)


21.6 IDEMPOTENCY POLICY (MANDATORY)
Requirements:
✅ All write endpoints REQUIRE header:

Idempotency-Key: <string>


✅ Missing header ⇒ 400 BAD_REQUEST with code IDEMPOTENCY_KEY_REQUIRED
✅ Idempotency window: 24 hours
	∙	Keys honored for 24h from first request
	∙	After 24h, treated as new request
✅ Key reuse with different payload ⇒ 409 IDEMPOTENCY_KEY_REUSE_CONFLICT
	∙	Same key, different request body
	∙	Prevents accidental reuse

Uncertain Append Rule:
If event append outcome is uncertain:
	∙	Return 202 ACCEPTED
	∙	Provide recovery token
	∙	Allow safe retry without duplication
Example:

{
  "status": "accepted",
  "message": "Request accepted but outcome uncertain. Use recovery token to check status.",
  "recovery_token": "rcv_abc123",
  "check_status_url": "/v1/status/rcv_abc123"
}


Implementation:

idempotency_store = {
  # key: (request_hash, response, timestamp)
}

def check_idempotency(key, request_body):
  if key not in idempotency_store:
    return None
  
  stored = idempotency_store[key]
  
  # Check if expired (24h)
  if now() - stored.timestamp > 24_hours:
    del idempotency_store[key]
    return None
  
  # Check if same request
  request_hash = hash(request_body)
  if request_hash != stored.request_hash:
    raise IdempotencyConflict()
  
  # Return cached response
  return stored.response


21.7 EVIDENCE HANDLING ERRORS (DETERMINISTIC)
Evidence Rules (V1):
Types: PDF, PNG, JPGMax size: 10MBRequired metadata:
	∙	snapshot_id
	∙	submitted_by
	∙	submitted_at
	∙	sha256

Error Codes:



|Condition                  |Code                                 |Status|
|---------------------------|-------------------------------------|------|
|File exceeds 10MB          |`EVIDENCE_TOO_LARGE`                 |413   |
|Type not PDF/PNG/JPG       |`EVIDENCE_TYPE_NOT_ALLOWED`          |415   |
|SHA256 mismatch            |`EVIDENCE_HASH_MISMATCH`             |422   |
|Missing snapshot reference |`EVIDENCE_MISSING_SNAPSHOT_REFERENCE`|422   |
|Invalid HTTPS link         |`EVIDENCE_LINK_INVALID`              |422   |
|Text too long (>1000 chars)|`EVIDENCE_TEXT_TOO_LONG`             |422   |

Validation Examples:

def validate_evidence(evidence):
  if evidence.type == "FILE":
    if evidence.size > 10_MB:
      return error("EVIDENCE_TOO_LARGE", 413)
    
    if evidence.mime_type not in ["application/pdf", "image/png", "image/jpeg"]:
      return error("EVIDENCE_TYPE_NOT_ALLOWED", 415)
    
    computed_hash = sha256(evidence.content)
    if computed_hash != evidence.metadata.sha256:
      return error("EVIDENCE_HASH_MISMATCH", 422)
  
  if evidence.type == "LINK":
    if not evidence.ref.startswith("https://"):
      return error("EVIDENCE_LINK_INVALID", 422)
  
  if evidence.type == "TEXT_ATTESTATION":
    if len(evidence.ref) > 1000:
      return error("EVIDENCE_TEXT_TOO_LONG", 422)
  
  if not evidence.metadata.snapshot_id:
    return error("EVIDENCE_MISSING_SNAPSHOT_REFERENCE", 422)
  
  return None  # Valid


21.8 TOKEN / LINK CONFIRMATION ERRORS
One-Time Tokens Must Enforce:
	∙	✅ Existence
	∙	✅ Expiration
	∙	✅ Single-use

Errors:



|Condition              |Code                |Status|
|-----------------------|--------------------|------|
|Token expired          |`TOKEN_EXPIRED`     |410   |
|Token already used     |`TOKEN_ALREADY_USED`|410   |
|Token not found        |`TOKEN_NOT_FOUND`   |404   |
|Token signature invalid|`TOKEN_INVALID`     |401   |

Anti-Enumeration:
Use 404 for invalid tokens (not 401) to prevent token enumeration attacks.
Why: Attacker shouldn’t know if token exists but is invalid vs. doesn’t exist.

Implementation:

def validate_token(token_string):
  # Verify signature first
  try:
    payload = verify_signature(token_string)
  except SignatureInvalid:
    return error("TOKEN_NOT_FOUND", 404)  # Anti-enumeration
  
  # Check existence
  token = db.get_token(payload.token_id)
  if not token:
    return error("TOKEN_NOT_FOUND", 404)
  
  # Check expiration
  if now() > token.expires_at:
    return error("TOKEN_EXPIRED", 410)
  
  # Check single-use
  if token.used_at is not None:
    return error("TOKEN_ALREADY_USED", 410)
  
  return token  # Valid


21.9 DISPUTE / ARBITRATION ERRORS
Rules:
	∙	✅ Arbitration must reference immutable rule IDs
	∙	✅ Admins cannot invent rules at runtime

Errors:



|Condition                     |Code                         |Status|
|------------------------------|-----------------------------|------|
|Arbitration rules file missing|`ARBITRATION_RULESET_MISSING`|500   |
|rule_id not in ruleset        |`RULE_ID_INVALID`            |422   |
|Snapshot not in DISPUTED state|`DISPUTE_STATE_INVALID`      |409   |
|Non-admin attempts resolution |`FORBIDDEN`                  |403   |

Validation:

def resolve_dispute(snapshot_id, rule_id, verdict, admin_user):
  # Check admin
  if not admin_user.is_admin:
    return error("FORBIDDEN", 403)
  
  # Check state
  snapshot = get_snapshot(snapshot_id)
  if snapshot.state != "DISPUTED":
    return error("DISPUTE_STATE_INVALID", 409)
  
  # Check rule exists
  rules = load_arbitration_rules()
  if rule_id not in rules:
    return error("RULE_ID_INVALID", 422)
  
  # Apply resolution
  append_event(DisputeResolved(
    snapshot_id=snapshot_id,
    rule_id=rule_id,
    verdict=verdict,
    resolved_by=admin_user.id
  ))
  
  return success()


21.10 LOGGING & OBSERVABILITY (MANDATORY)
Every Error Log MUST Include:

{
  "level": "ERROR",
  "timestamp": "2026-01-11T23:00:00Z",
  "request_id": "req_abc123",
  "actor_id": "usr_456",
  "snapshot_id": "snap_789",
  "error_code": "INVALID_STATE_TRANSITION",
  "endpoint": "POST /v1/snapshots/{id}/intro/claim",
  "method": "POST",
  "latency_ms": 45,
  "build_version": "1.0.0",
  "status_code": 409
}


Severity Levels:
4xx → WARN
	∙	Expected errors
	∙	Client-side issues
Expected 409 → INFO/WARN
	∙	Idempotency replays
	∙	State conflicts (normal)
5xx → ERROR
	∙	Server failures
	∙	Unexpected exceptions
Hash chain / invariant violation → CRITICAL
	∙	Data integrity issues
	∙	Immediate investigation required

PII Safety:
❌ Never log:
	∙	Raw tokens
	∙	Passwords
	∙	Full emails (mask: u***@example.com)
	∙	Evidence content
	∙	Target email addresses
✅ Safe to log:
	∙	User IDs (usr_*)
	∙	Snapshot IDs (snap_*)
	∙	Error codes
	∙	Request IDs
	∙	Hashed tokens

21.11 ALERTING THRESHOLDS (V1)
Critical Errors → Immediate Alert
Triggers:
	∙	Hash chain validation failure
	∙	Invariant violation (e.g., event with missing prev_hash)
	∙	Arbitration ruleset missing
	∙	Database corruption detected
Action: Page on-call engineer

5xx Errors → Alert if >1% of Requests Over 5 Minutes
Calculation:

5xx_rate = (count_5xx / total_requests) * 100

if 5xx_rate > 1.0 and duration > 5_minutes:
  send_alert()


Action: Investigate within 15 minutes

429 Errors → Alert if Sustained >15 Minutes
Why: Indicates potential DoS or legitimate traffic spike
Action: Review rate limits, check for attack

21.12 CLIENT RETRY GUIDANCE
4xx → Never Retry Automatically
Why: Client error won’t resolve without request changes
Exceptions:
	∙	408 Request Timeout → Can retry
	∙	429 Too Many Requests → Retry after backoff

429 → Retry After Retry-After Header
Header format:

Retry-After: 60


Client behavior:

if status == 429:
  wait(response.headers['Retry-After'])
  retry()


5xx → Exponential Backoff
Pattern:

delays = [1s, 2s, 4s, 8s, 16s]
max_attempts = 5

for attempt in range(max_attempts):
  response = make_request()
  if response.status < 500:
    return response
  
  if attempt < max_attempts - 1:
    sleep(delays[attempt])

return error("MAX_RETRIES_EXCEEDED")


202 Accepted → Poll Status
Response:

{
  "status": "accepted",
  "recovery_token": "rcv_abc123",
  "check_status_url": "/v1/status/rcv_abc123"
}


Client behavior:

while True:
  status = get_status(recovery_token)
  if status.complete:
    return status.result
  sleep(2s)


21.13 SECURITY & PII SAFETY RULES
Never Log:
❌ Raw tokens or secrets
	∙	Bearer tokens
	∙	Idempotency keys (hash only)
	∙	Confirmation tokens
❌ Full emails
	∙	Mask: user@example.com → u***@example.com
	∙	Or hash: sha256(email)
❌ Evidence content
	∙	File bytes
	∙	Link URLs (may contain PII)
	∙	Text attestations
❌ Internal auth state
	∙	Session details
	∙	Permission lists
	∙	Admin roles (in public errors)

Error Messages Must Not Reveal:
❌ Whether user exists (use generic “invalid credentials”)
❌ Whether token is expired vs. invalid (use 404 for both - anti-enumeration)
❌ Internal system details (DB errors, file paths)

21.14 COMPLETION CRITERIA (PASS / FAIL)
Step 21 is COMPLETE when:
✅ Single authoritative error policy exists in /docs
	∙	This document
✅ All write endpoints enforce Idempotency-Key
	∙	Required header checked
	∙	Missing key → 400 error
✅ 4xx errors write zero domain events
	∙	Verified in tests
	∙	No exceptions
✅ Deterministic error codes exist for all failure modes
	∙	Sections 21.3, 21.7, 21.8, 21.9
✅ Alert thresholds are explicitly defined
	∙	Section 21.11
✅ Retry guidance is documented
	∙	Section 21.12

VALIDATION CHECKLIST



|Criterion                    |Status|Evidence     |
|-----------------------------|------|-------------|
|Error taxonomy complete      |✅     |Section 21.3 |
|Standard envelope defined    |✅     |Section 21.4 |
|Validation order specified   |✅     |Section 21.5 |
|Idempotency policy mandatory |✅     |Section 21.6 |
|Evidence errors deterministic|✅     |Section 21.7 |
|Token errors specified       |✅     |Section 21.8 |
|Logging requirements defined |✅     |Section 21.10|
|Alert thresholds set         |✅     |Section 21.11|
|Retry guidance documented    |✅     |Section 21.12|
|PII safety rules enforced    |✅     |Section 21.13|

LOCK STATUS
🔒 LOCKED - Error handling policy is binding for v1
Revision Criteria:
	∙	Only if Step 22 (Logging) reveals missing error observability
	∙	Only if testing reveals determinism failures
	∙	Only with founder approval + decision_log.md entry
Until then: This policy is frozen.

NEXT STEP
→ Step 22: Logging Events (what must always be observable)
Instruction: Say “GO — Step 22” when ready

METADATA
Created By: Project Owner (Rehan)Reviewed By: Expert Council + ClaudeSSOT Status: ✅ COMPLETE & LOCKEDDependencies: Steps 18-20 (Architecture, APIs, Data Models)Referenced By: Steps 22-24, all implementation phases
STATUS: STEP 21 COMPLETE & LOCKED ✅

END OF Step 21