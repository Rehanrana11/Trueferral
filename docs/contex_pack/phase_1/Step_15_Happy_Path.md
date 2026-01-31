## PURPOSE

Define the smallest complete flow that cannot be gamed and proves trust execution works.

---

## HAPPY PATH RULE (NON-NEGOTIABLE)

**A happy path must prove truth, not intent.**

### Completion Requires:

1. ✅ **Independent confirmation of execution**
   - No self-reporting
   - Multiple parties verify
   - Cannot be gamed by single actor

2. ✅ **Verifiable outcome**
   - Evidence-based
   - References snapshot
   - Timestamped

3. ✅ **Automatic consequences**
   - No manual intervention
   - Algorithm-driven
   - Executes within 1 minute

4. ✅ **Immutable audit trail**
   - Every state change logged
   - Cannot be altered
   - Survives system restart

---

### Critical Principle:

**No single actor can move the system forward alone.**

**Why:**
- Prevents self-dealing
- Ensures independent verification
- Creates accountability
- Enables trust

---

## ACTORS (MINIMUM SET)

### Introducer (I)
- Initiates referral
- Risks reputation
- Makes introduction
- Has most at stake

### Requester (R)
- Requests access
- Benefits from introduction
- Confirms receipt
- Verifies outcome

### Target (T)
- Receives introduction
- Decides to engage
- Confirms receipt
- Verifies outcome

### System (S)
- Truferral v1 platform
- Enforces rules
- Executes consequences
- Maintains immutable state

---

### Identity Requirement:

**All actors are verified human accounts.**

**No:**
- Anonymous users
- Bots or agents
- Organizations (v1)
- Shared accounts

---

## PRECONDITIONS (MUST BE TRUE)

Before happy path can execute:

✅ **I, R, T accounts verified**
- Email verified
- Identity confirmed
- Active accounts

✅ **I has remaining trust capacity**
- Not reputation-locked
- Can vouch for more referrals
- Capacity checked before snapshot

✅ **Verification + arbitration rules exist**
- Documented in `/docs/04_architecture/`
- Rules exist BEFORE first referral
- Immutable during validation period

✅ **Snapshot immutability enforced**
- Database constraints active
- Append-only structure verified
- No UPDATE/DELETE permissions

---

## HAPPY PATH — REVISED, DETERMINISTIC

### HP-1 — R DECLARES REFERRAL INTENT

**Action:** Declare Referral Intent

**R provides (required):**

1. **Introducer (I)**
   - User ID of person making intro
   - Must have active account
   - Must have trust capacity

2. **Target (T identifier)**
   - Name or identifier
   - Context (company, role)
   - Why this person

3. **Purpose (fixed enum)**
   - HIRING
   - INVESTMENT
   - PARTNERSHIP
   - CUSTOMER
   - OTHER

4. **Value range (bucket)**
   - LOW (<$10K impact)
   - MEDIUM ($10K-$100K)
   - HIGH ($100K-$500K)
   - CRITICAL (>$500K)

5. **Success condition (fixed enum)**
   - HIRE_MADE
   - INVESTMENT_CLOSED
   - CONTRACT_SIGNED
   - FIRST_PAYMENT
   - CUSTOM (with description)

6. **Time window**
   - Days until evaluation
   - Default: 90 days
   - Min: 14 days
   - Max: 365 days

---

**S does:**

1. **Validates completeness**
   - All required fields present
   - Enum values valid
   - I account exists and active
   - Time window within bounds

2. **Creates ReferralIntent**


{
id: UUID
requester_id: R
introducer_id: I
target_identifier: String
purpose: ENUM
value_range: ENUM
success_condition: ENUM
time_window_days: Integer
status: PENDING_SNAPSHOT
created_at: ISO8601
}


3. **Status = PENDING_SNAPSHOT**
- Not yet committed
- Can still be modified
- Awaits I acceptance

---

**Evidence:** `intent_id` (UUID of created intent)

---

### HP-2 — I ACCEPTS REFERRAL INTENT

**Action:** Declare Referral Intent (confirmation)

**I provides:**

1. **Accept / Reject (binary)**
- No "maybe"
- No "let me think"
- Binary decision only

2. **Optional context note (≤280 chars)**
- Additional context for R or T
- Not part of snapshot (informational only)
- Character limit enforced

---

**S does:**

**If Reject:**
- Intent status → REJECTED
- No snapshot created
- Process terminates
- **Not happy path** (ends here)

**If Accept:**
- Intent status → ACCEPTED
- Enables snapshot commit
- Proceeds to HP-3

---

**Evidence:** `intent` state transition (PENDING_SNAPSHOT → ACCEPTED or REJECTED)

---

### HP-3 — I COMMITS TRUTH SNAPSHOT

**Action:** Commit via Truth Snapshot

**I confirms:**

1. **Terms**
- Reviews all intent fields
- Verifies accuracy
- Accepts as-is

2. **Verification rules**
- How outcome will be determined
- Evidence requirements
- Confirmation process

3. **Time window**
- Deadline for outcome
- Auto-expiration date
- Cannot be extended

---

**S does:**

**Creates immutable TruthSnapshot containing:**



{
snapshot_id: UUID
intent_id: UUID (reference)
introducer_id: I
requester_id: R
target_identifier: String
purpose: ENUM
value_range: ENUM
success_condition: ENUM
time_window_days: Integer
verification_rules: {
method: ENUM [MUTUAL_CONFIRM, AUTO_CONFIRM, ARBITRATION]
evidence_required: Boolean
timeout_days: Integer
}
consequence_rules: {
algorithm_version: String
asymmetry_factor: Float
compound_factor: Float
}
created_at: ISO8601
immutable_hash: SHA256 (optional)
status: ACTIVE
}


**Locks immutability:**
- No UPDATE allowed
- No DELETE allowed
- Append-only structure
- Database constraints enforced

---

**Evidence:** Immutable snapshot record (queryable, cannot be altered)

---

### HP-4 — SYSTEM ISSUES REFERRAL TOKEN

**Action:** System output

**S does:**

1. **Generates referral_token**
   - Unique token (UUID or signed JWT)
   - Bound to snapshot_id
   - Cannot be reused
   - Expires with snapshot

2. **Token required for verification**
   - All verification actions require token
   - Prevents off-system verification
   - Enforces workflow

---

**Token structure (example):**


{
token_id: UUID
snapshot_id: UUID (reference)
issued_at: ISO8601
expires_at: ISO8601
token_hash: SHA256
}


---

**Evidence:** `token ↔️ snapshot` linkage (stored in database)

---

### ✅ HP-5 — INTRODUCTION EXECUTION IS INDEPENDENTLY VERIFIED (REVISED)

**Action:** Verify Introduction Occurred

**Critical change:** Prevents single-actor manipulation

---

#### Step 5A: I Claims Introduction Sent

**I does (initiation only):**

1. **Marks "Introduction Sent"**
   - Claims intro has happened
   - NOT YET VERIFIED
   - Triggers verification process

2. **Selects method**
   - EMAIL
   - PHONE_CALL
   - IN_PERSON_MEETING
   - VIDEO_CALL
   - OTHER

3. **Provides timestamp**
   - When intro occurred
   - ISO8601 format
   - Must be after snapshot creation
   - Must be before outcome evidence

---

**S does:**

1. **Records claim**


{
snapshot_id: UUID
claimed_by: I
method: ENUM
claimed_timestamp: ISO8601
status: PENDING_VERIFICATION
}


2. **Notifies T that introduction has been claimed**
- Email/notification to T
- Includes snapshot_id
- Requests confirmation
- Time-bounded (default: 7 days)

---

#### Step 5B: T Confirms Receipt (Required)

**T does (required):**

1. **Confirms "Introduction Received" (binary)**
- YES or NO
- No partial confirmation
- References snapshot_id

2. **Timestamp of receipt**
- When T received intro
- Must align with I's claimed timestamp

---

**Alternative fallback (only if T unreachable):**

**R confirms receipt if included in introduction**
- Only if R was CC'd or present
- Only if T doesn't respond within 7 days
- Recorded as fallback verification

---

#### Step 5C: System Validates

**System rule:**

**Snapshot state moves to INTRO_SENT only after ≥2 independent confirmations:**
- I claims sent
- T confirms received (OR R if fallback)

**Cannot advance with single confirmation.**

---

**Evidence produced:**

1. **Dual confirmation records**


{
snapshot_id: UUID
i_claimed: ISO8601
t_confirmed: ISO8601 (OR r_confirmed if fallback)
verification_count: 2
status: INTRO_VERIFIED
}


2. **Ordered timestamps:**
- `intro_execution_time < outcome_evidence_time`
- Temporal ordering enforced
- Cannot verify outcome before intro

---

**❌ If confirmation does NOT occur:**

**Snapshot expires as INTRO_NOT_VERIFIED**
- Status: EXPIRED_UNVERIFIED
- No reputation impact
- Treated as "did not happen"
- Cannot be revived

---

### HP-6 — OUTCOME EVIDENCE IS SUBMITTED

**Action:** Verify Outcome

**R or T provides:**

1. **Evidence file referencing snapshot_id**
- Contract (PDF)
- Email confirmation
- Payment receipt
- ATS confirmation
- Screenshot

---

#### Evidence Validation Rules (Deterministic):

**Allowed types:**
- PDF
- Image (PNG, JPG)
- Link (to verifiable source)

**Must include:**

1. **Timestamp**
- When evidence was created
- Must be after intro verification
- Must be within time window

2. **Snapshot reference**
- snapshot_id visible in evidence
- OR metadata references snapshot_id

3. **File integrity metadata**
- File hash (SHA256)
- Upload timestamp
- Uploader identity

---

**S does:**

1. **Validates format + metadata**
- File type allowed
- Metadata complete
- Timestamp ordering correct
- Snapshot reference valid

2. **Sets OutcomeClaim = PENDING_CONFIRMATION**


{
snapshot_id: UUID
evidence_file_hash: SHA256
submitted_by: R or T
submitted_at: ISO8601
status: PENDING_CONFIRMATION
}


---

**Evidence:** Validated evidence record (stored immutably)

---

### HP-7 — OUTCOME IS VERIFIED (MUTUAL)

**Action:** Verify Outcome

**R and T do:**

1. **Both confirm outcome = SUCCESS (binary)**
- R confirms: "Yes, this was successful"
- T confirms: "Yes, this was successful"
- Must be explicit (no default)

2. **If either says FAILURE:**
- Outcome = FAILURE
- Conservative approach (benefit of doubt to system integrity)

3. **If disagree (one SUCCESS, one FAILURE):**
- Triggers arbitration
- Uses predefined arbitration rules
- Admin resolves per rules

---

**S does:**

1. **Locks outcome as immutable**


{
snapshot_id: UUID
outcome: SUCCESS or FAILURE
r_confirmation: SUCCESS or FAILURE
t_confirmation: SUCCESS or FAILURE
finalized_at: ISO8601
status: FINALIZED
}


2. **Sets snapshot = CLOSED_SUCCESS or CLOSED_FAILURE**
- Terminal state
- Cannot be reopened
- Immutable forever

---

**Evidence:** Final verified outcome record (immutable, auditable)

---

### HP-8 — CONSEQUENCES EXECUTE AUTOMATICALLY

**Action:** System consequence execution

**S does:**

1. **Applies asymmetric reputation update:**

**For SUCCESS:**


I reputation: +10 * multiplier
R reputation: +5
T reputation: +5


**For FAILURE:**


I reputation: -30 * compound_factor
R reputation: -5
T reputation: -5


**Where:**
- `multiplier` = 1.0 + (consecutive_successes * 0.1)
- `compound_factor` = 1.0 + (consecutive_failures * 0.5)

**Introducer impact > others** (asymmetry enforced)

2. **Updates trust capacity ledger**


{
user_id: I
capacity_before: Integer
capacity_after: Integer
change_reason: snapshot_id
timestamp: ISO8601
}


3. **Writes immutable ConsequenceRecord**


{
snapshot_id: UUID
user_id: I/R/T
reputation_before: Integer
reputation_after: Integer
capacity_before: Integer
capacity_after: Integer
algorithm_version: String
executed_at: ISO8601
}


**Execution constraints:**
- Must complete within 60 seconds of outcome finalization
- No manual approval
- No admin override
- Atomic transaction (all or nothing)

---

**Evidence:** Consequence + capacity update persisted (queryable, auditable)

---

### HP-9 — TRUST GRAPH UPDATES

**Action:** System update

**S does:**

**Updates:**

1. **Domain success count**


user_domain_stats {
user_id: I
domain: PURPOSE (from snapshot)
success_count: +1
failure_count: 0 (or +1 if failure)
total_count: +1
}


2. **Referral history**


user_referral_history {
user_id: I
snapshot_id: UUID
outcome: SUCCESS or FAILURE
timestamp: ISO8601
}


3. **Trust visibility**
- Public reputation score updated
- Domain-specific scores updated
- Success rate recalculated

4. **Ensures trust state survives restart**
- All updates persisted to database
- No in-memory-only state
- Survives system restart

---

**Evidence:** Queryable updated trust state (database records)

---

## COMPLETION DEFINITION (BINARY)

**Happy path is DONE only if:**

✅ **Snapshot immutable**
- Cannot be edited
- Cannot be deleted
- Hash validates integrity

✅ **Introduction independently verified**
- ≥2 parties confirmed
- Temporal ordering correct
- Evidence logged

✅ **Outcome verified**
- Mutual confirmation
- Evidence submitted
- Final state reached

✅ **Consequences executed automatically**
- Reputation updated
- Capacity adjusted
- No manual intervention

✅ **Trust state persisted and auditable**
- Database records exist
- Survives restart
- Queryable via API

---

### Any Missing Condition = FAIL

**If any step incomplete:**
- Happy path did NOT complete
- System is NOT production-ready
- Kill decision triggered (per Step 8)

---

## EXPLICITLY OUT OF SCOPE (REMINDER)

**v1 does NOT include:**

❌ **Messaging**
- No in-app chat
- Intro happens via email/phone/etc

❌ **Matching**
- No discovery
- No recommendations
- User knows who to introduce

❌ **Payments / escrow**
- No money movement
- Reputation only

❌ **AI agents**
- All actions human-initiated
- No automation in loop

❌ **Organizations**
- Individual users only
- No team accounts

❌ **Partial outcomes**
- Binary only (success/failure)
- No "sort of worked"

---

## ENFORCEMENT RULE

**If any future implementation:**

❌ **Allows self-reported execution**
- Single-actor verification
- No independent confirmation

❌ **Skips independent confirmation**
- I can verify alone
- No T or R involvement

❌ **Permits mutable records**
- Snapshots can be edited
- Outcomes can be changed

**→ It is NOT Truferral v1**

---

### Violation = Scope Breach

**Action:**
1. Log in `/docs/00_governance/violation_log.md`
2. Immediate halt
3. Kill decision review

---

## ✅ STEP 15 VALIDATION CHECKLIST

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Independent verification enforced | ✅ | HP-5 requires ≥2 confirmations |
| No single-actor manipulation possible | ✅ | Multiple parties required at each step |
| Temporal ordering guaranteed | ✅ | Timestamps enforced: intro < outcome |
| Evidence validation rules explicit | ✅ | HP-6 defines deterministic validation |
| All council conditions satisfied | ✅ | Revised version addresses all critiques |

**Status:** COMPLETE (REVISED & APPROVED)

---

## LOCK STATUS

🔒 **LOCKED** - Happy path is final for v1

**Revision Criteria:**
- Only if security vulnerability discovered
- Only if flow proven ungameable in testing
- Only with founder approval + decision_log.md entry

**Until then:** This happy path is frozen.

---

## NEXT STEP

→ **Step 16:** Freeze v1 Scope (no changes allowed during build)

**Instruction:** Say "GO — Step 16" when ready

---

## METADATA

**Created By:** Project Owner (Rehan)  
**Reviewed By:** Expert Council + Claude  
**SSOT Status:** ✅ LOCKED  
**Dependencies:** Steps 1-14 (especially Core Actions)  
**Referenced By:** All implementation, testing, and validation phases

---

**END OF STEP 15**