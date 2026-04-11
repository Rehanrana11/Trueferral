# STEP 11: FUNCTIONAL REQUIREMENTS DOCUMENT (FRD)

**Project:** IntroFlow (Trueferral)  
**Phase:** 1 — Truth & Scope Lock  
**Step:** 11 of 72  
**Version:** v1.1 (Revised per council)  
**Status:** ✅ COMPLETED & LOCKED (Build-Safe)  
**Date Created:** January 20, 2026

---

## 0. FRD BOUNDARY RULES (ENFORCED)

**This document defines only:**
Mandatory system behaviors required to satisfy the BRD.

### Strict Exclusions:

❌ **No UI/UX descriptions**
- What screens look like
- Button placement
- Visual design

❌ **No monetization logic**
- Pricing strategies
- Payment flows
- Revenue features

❌ **No growth features**
- Viral mechanics
- Gamification
- Engagement optimization

❌ **No "nice to have" capabilities**
- Convenience features
- Optional enhancements
- Future possibilities

❌ **No speculative future states**
- V2 features
- Roadmap items
- "Eventually we'll..."

### Inclusion Rule:

**If a function does NOT:**
- Protect trust, OR
- Enable execution, OR
- Enforce consequences

**Then it does NOT belong here.**

---

## 1. CORE SYSTEM OBJECTIVE

**The system must enable high-stakes referrals to occur with:**

1. ✅ **Explicit intent** (no ambiguity)
2. ✅ **Protected introducers** (limited downside)
3. ✅ **Verifiable outcomes** (evidence-based)
4. ✅ **Automatic consequence execution** (no manual intervention)

**Critical rule:**
Failure to enforce **any one** of these invalidates the entire system.

---

## 2. MANDATORY FUNCTIONAL CAPABILITIES (V1)

### FR-1 — Identity & Accountability

**Requirement:**
The system must uniquely identify every participant in a referral.

**Includes:**

✅ **Persistent user identity**
- Unique user ID
- Cannot be deleted or reassigned
- Survives across sessions

✅ **Attribution of actions to a single identity**
- Every action has an owner
- No anonymous actions
- No shared accounts

✅ **Privacy option available**
- Identity may be verified but not publicly visible
- Public alias allowed
- Real identity verified behind the scenes

**Example:**
- Public: "Experienced Investor #4829"
- System: Links to verified LinkedIn/email
- Trust score: Calculated on real identity

**Failure if missing:**
Introducer protection is impossible without attribution.

**Why:**
- Cannot track outcomes without knowing who introduced
- Cannot apply consequences without identity
- Cannot build reputation without persistence

---

### FR-2 — Referral Intent Declaration

**Requirement:**
The system must require explicit declaration of referral intent before execution.

**Includes:**

✅ **Who is introducing**
- Introducer identity (FR-1)

✅ **Who is being introduced**
- Party A identity
- Party B identity

✅ **Purpose of the referral**
- Hiring
- Investment
- Partnership
- Customer intro
- Other (with description)

✅ **Success condition**
- What constitutes success
- Examples:
  - "Hire is made within 90 days"
  - "Investment closes"
  - "Partnership contract signed"
  - "First paid invoice"

✅ **Time boundary (time window)**
- When success is evaluated
- Default: 90 days from intro
- Custom: user-specified
- Maximum: 1 year

**Failure if missing:**
Ambiguity allows blame to leak backward.

**Why:**
- Unclear intent = disputed outcomes
- No time boundary = never resolves
- Missing parties = no accountability

---

### FR-3 — Immutable Truth Snapshot (First-Class Object)

**Requirement:**
The system must create an immutable snapshot of the referral intent before the introduction occurs.

**Includes:**

✅ **Participants**
- Introducer ID
- Party A ID
- Party B ID

✅ **Declared intent**
- Full text of purpose
- Success condition
- Time boundary

✅ **Timestamp**
- ISO 8601 format
- UTC timezone
- Millisecond precision

✅ **Snapshot ID**
- Unique identifier (UUID or similar)
- Used to reference this specific referral
- Never reused

✅ **Immutability enforced**
- Append-only data structure
- No edits allowed
- No deletions allowed
- Cryptographic hash (optional but recommended)

✅ **Snapshot is referentially stable**
- All actions reference snapshot ID
- Snapshot ID never changes
- Historical snapshots remain accessible

**Technical implementation note:**


Snapshot {
id: UUID
created_at: ISO8601
introducer_id: UserID
party_a_id: UserID
party_b_id: UserID
purpose: String
success_condition: String
time_boundary: ISO8601
hash: SHA256 (optional)
status: ENUM [pending, verified_success, verified_failure]
}


**Failure if missing:**
Post-hoc narrative manipulation becomes possible.

**Why:**
- Cannot verify outcomes without original intent
- Cannot prevent "I never said that"
- Cannot enforce consequences without frozen terms

---

### FR-4 — Snapshot-Enforced Execution

**Requirement:**
All referral-related actions must reference a valid snapshot ID.

**Includes:**

✅ **Introduction messages**
- Must include snapshot ID
- Cannot introduce without creating snapshot first
- Example: "This intro is tracked under #ABC123"

✅ **Follow-ups**
- Reference same snapshot ID
- Track all communications
- Link to original intent

✅ **Verification steps**
- Must provide snapshot ID
- Ties outcome to original terms
- Prevents verification of wrong referral

✅ **Any status change related to the referral**
- Snapshot ID required
- Audit trail maintained
- Immutable history

**Technical enforcement:**


Action {
snapshot_id: UUID (REQUIRED, FOREIGN KEY)
action_type: ENUM
timestamp: ISO8601
actor_id: UserID
}


**Failure if missing:**
Introductions can bypass protection.

**Why:**
- Without enforcement, snapshot is optional
- Optional = users skip it when convenient
- Skipped = no protection

---

### FR-5 — Outcome Verification (Unambiguous)

**Requirement:**
The system must support outcome verification tied to the snapshot using explicit verification rules.

**Includes (V1):**

✅ **Binary outcome**
- SUCCESS or FAILURE
- Recorded against the snapshot ID
- No ambiguous states (no "partial success")

✅ **Evidence attachment**
- Optional but timestamped
- Links to snapshot ID
- Examples:
  - Signed contract (PDF)
  - Email confirmation
  - Payment receipt
  - ATS confirmation

✅ **Evidence must reference snapshot ID**
- Ties proof to specific referral
- Prevents evidence reuse
- Maintains chain of custody

✅ **Verification requires ONE of the following (exactly):**

**Option A: Mutual Confirmation**
- Both introduced parties confirm outcome
- Must be explicit (no implied consent)
- Timestamp recorded
- If parties disagree → triggers dispute

**Option B: Time-Bound Auto-Confirmation**
- Default: 30 days with no dispute
- If no party objects within window → outcome auto-finalizes
- Status: pending → auto_verified
- Prevents indefinite limbo

**Option C: Admin Arbitration**
- Triggered by dispute
- Admin reviews evidence
- Admin chooses final outcome
- Decision is binding and immutable
- Logged in audit trail

✅ **All verification events are immutable and auditable**
- Every state change logged
- Timestamps preserved
- Actor IDs recorded
- Cannot be altered or deleted

**Verification state machine:**


pending
→ [mutual_confirm OR auto_confirm] → verified_success/verified_failure
→ [dispute] → under_arbitration → verified_success/verified_failure


**Failure if missing:**
Trust cannot compound; reputation becomes performative or negotiable.

**Why:**
- Ambiguous outcomes = no accountability
- Negotiable verification = trust collapse
- No evidence = he-said-she-said

---

### FR-6 — Automatic Consequence Execution (Specified)

**Requirement:**
The system must automatically apply consequences based on verified outcomes.

**Includes (V1):**

✅ **Reputation increment/decrement applied automatically**
- Triggers on outcome verification
- No manual approval required
- Executes within 1 minute of verification

✅ **Referral status updates**
- `open` → `verified_success` OR `verified_failure`
- Status change logged
- Notification sent to parties

✅ **Reputation algorithm requirements:**

**a) Transparent and documented**
- Full algorithm in `/docs/04_architecture/trust_engine.md`
- No black boxes
- Users understand how reputation changes

**b) Asymmetric**
- Introducer risk ≠ Referee risk
- Introducer has more at stake (protecting reputation)
- Referred parties have less at stake
- Example:
  - Introducer success: +10 points
  - Introducer failure: -30 points
  - Referred party success: +5 points
  - Referred party failure: -5 points

**c) Non-linear**
- Multiple failures compound more than linearly
- Example:
  - 1 failure: -30 points
  - 2 failures: -70 points (not -60)
  - 3 failures: -140 points (not -90)
- Prevents serial bad actors
- Rewards consistent performance

**Example algorithm (v1 baseline):**


reputation_change = base_value * multiplier * streak_modifier
Where:
	∙	base_value: +10 (success) or -30 (failure) for introducer
	∙	multiplier: 1.0 + (consecutive_successes * 0.1) for success
	∙	multiplier: 1.0 + (consecutive_failures * 0.5) for failure
	∙	reputation_change is applied automatically


**Failure if missing:**
Accountability collapses into social negotiation.

**Why:**
- Manual consequences = negotiable
- Negotiable = not enforceable
- Not enforceable = trust fails

---

### FR-7 — Trust State Persistence

**Requirement:**
The system must persist trust state across referrals.

**Includes:**

✅ **Historical outcomes per user**
- All past referrals stored
- Success/failure counts
- Timestamps preserved
- Immutable record

✅ **Domain-tagged success/failure counts**
- If domains exist in v1 (e.g., "hiring", "investment")
- Track performance per domain
- Enable context-specific reputation

✅ **Ability to compute user trust summary from immutable records**
- Reputation score
- Success rate
- Domain-specific scores
- Historical trend
- All derived from append-only log

**Data model:**


UserTrustState {
user_id: UUID
total_referrals: Integer
successful_referrals: Integer
failed_referrals: Integer
current_reputation: Integer
domain_scores: Map<Domain, ReputationScore>
last_updated: ISO8601
}


**Failure if missing:**
No compounding advantage exists.

**Why:**
- Without persistence, every referral starts from zero
- No learning or improvement
- No incentive for good behavior

---

### FR-8 — Bypass Prevention (Operational Definition)

**Requirement:**
The system must prevent or nullify claims of referral outcomes without using the system's verification mechanism.

**Includes:**

✅ **System issues a verifiable referral token per snapshot**
- Unique URL or token
- Example: `https://trueferral.com/ref/ABC123`
- Shareable, verifiable, immutable

✅ **Token must be referenced for verification and status claims**
- Outcome verification requires token
- Status updates require token
- No token = no credit

✅ **Off-system execution is defined as:**
"An outcome claimed without using the system's verification mechanism"

**Examples of off-system execution:**
- Intro made via email, outcome claimed later
- Intro made on LinkedIn, verification attempted in Trueferral
- Verbal intro, retrospective claim

✅ **If party attempts to claim outcome without verification:**
- Status must remain `unverified`
- Consequences must NOT apply
- User warned of bypass attempt
- Logged for audit

**Enforcement mechanism:**


IF outcome_claim.snapshot_id NOT IN valid_snapshots THEN
REJECT claim
LOG bypass_attempt
NOTIFY user
END IF


**Failure if missing:**
The system becomes optional and therefore irrelevant.

**Why:**
- Optional system = no enforcement
- Users bypass when convenient
- High-stakes intros remain off-platform
- Moat collapses

---

## 3. EXPLICIT V1 CONSTRAINTS (HARD)

### C-1 — No Matching Logic

**The system does NOT suggest who to refer.**

**Rationale:**
- Matching is growth feature
- Not required for trust infrastructure
- Adds complexity
- AI commoditizes this anyway

**V1 scope:**
- User knows who to introduce
- System just protects the process

---

### C-2 — No Messaging Platform

**The system does NOT replace email or chat tools.**

**Rationale:**
- Messaging is commoditized
- Not core to trust
- Users have preferred tools

**V1 scope:**
- System provides referral token/URL
- Intro happens via existing channels
- Verification happens in system

---

### C-3 — No Payments or Escrow

**Financial settlement is out of scope for v1.**

**Rationale:**
- Adds regulatory complexity
- Not required for reputation system
- Can be added in v2

**V1 scope:**
- Reputation is the consequence
- No money changes hands

---

### C-4 — No Organizations or Teams

**All users are individuals in v1.**

**Rationale:**
- Team dynamics add complexity
- Not required to validate core loop
- Can be added post-PMF

**V1 scope:**
- Individual users only
- Personal reputation
- 1:1 and 1:1:1 intros

---

### C-5 — No AI Agents

**All actions are human-initiated in v1.**

**Rationale:**
- AI integration is v2+
- Need to prove human workflow first
- Agents need trust rails to exist first

**V1 scope:**
- Humans create intents
- Humans verify outcomes
- System enforces rules

---

## 4. SYSTEM FAILURE CONDITIONS (KILL TRIGGERS)

**The system is considered FAILED if ANY occur:**

❌ **A referral completes without a snapshot**
- Proves FR-4 is not enforced
- Protection mechanism is broken

❌ **An outcome is finalized without one of the FR-5 verification rules**
- Verification is theatrical, not real
- Trust cannot be established

❌ **Consequences are applied manually (outside system rules)**
- Enforcement is negotiable
- Accountability fails

❌ **Trust state is editable without immutable evidence**
- Reputation can be gamed
- System loses integrity

**Action if triggered:**
- Immediate halt (per Step 8 kill authority)
- Root cause analysis
- KILL or REDESIGN decision

---

## 5. ALIGNMENT CHECK (FRD ↔️ BRD)

| BRD Requirement | FRD Coverage |
|----------------|--------------|
| Introducer protection | FR-2, FR-3, FR-6, FR-8 |
| Verifiable outcomes | FR-5 |
| Accountability | FR-1, FR-7 |
| Avoid engagement optimization | Boundary rules + constraints |
| Trust infrastructure | All requirements |

**Alignment:** ✅ COMPLETE

**Verification:**
- Every BRD requirement has FRD coverage
- Every FRD requirement supports BRD
- No FRD requirements contradict BRD

---

## 6. ASSUMPTIONS & DEPENDENCIES (EXPLICIT)

### A1: Friction/Protection Trade-off

**Assumption:**
Users will accept slightly more friction for significantly more protection.

**Test:**
- Do users complete snapshot creation despite extra steps?
- Do users route high-stakes intros through system?

**If false:**
- Friction is too high
- Protection value is too low
- REDESIGN required

---

### A2: Dispute Rate

**Assumption:**
Dispute rate will be <10% of referrals.

**Rationale:**
- If >10%, arbitration doesn't scale
- Manual intervention becomes bottleneck
- System fails at scale

**Test:**
- Monitor dispute rate in first 100 referrals
- If >10%, investigate root cause

**If false:**
- Success conditions are ambiguous
- Verification process is unclear
- REDESIGN verification (FR-5)

---

### A3: Minimal Integration

**Assumption:**
Professional workflows allow minimal integration or linking (e.g., shareable token/URL usage).

**Rationale:**
- Users can share referral tokens
- Tokens can be included in emails/messages
- No deep integration required

**Test:**
- Can users successfully share tokens?
- Do recipients understand tokens?

**If false:**
- Integration burden too high
- REDESIGN token mechanism

---

**All assumptions are testable and may trigger redesign if invalidated.**

---

## ✅ STEP 11 VALIDATION CHECKLIST

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Core ambiguity removed (verification) | ✅ | FR-5 specifies 3 exact verification paths |
| Consequences specified enough to implement | ✅ | FR-6 defines algorithm requirements |
| Bypass prevention operationalized | ✅ | FR-8 defines token mechanism + enforcement |
| Assumptions documented | ✅ | Section 6 with testability criteria |
| Scope remains v1-safe | ✅ | Hard constraints (C-1 through C-5) |

**Status:** COMPLETED, REVISED, AND LOCKED (v1.1)

---

## LOCK STATUS

🔒 **LOCKED** - FRD is build-safe

**Revision Criteria:**
- Only if requirement is proven unbuildable
- Only if assumption is invalidated by testing
- Only with founder approval + decision_log.md entry

**Until then:** These requirements are frozen.

---

## NEXT STEP

→ **Step 12:** Acceptance Criteria (how we know it works)

**Instruction:** Say "GO — Step 12" when ready

---

## METADATA

**Created By:** Project Owner (Rehan)  
**Reviewed By:** Expert Council + Claude  
**SSOT Status:** ✅ LOCKED  
**Dependencies:** Steps 1-10 (especially BRD)  
**Referenced By:** Steps 12-16, all architecture + implementation phases

---

**END OF STEP 11**