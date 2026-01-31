## CORE DESIGN PRINCIPLE

**Truferral v1 is NOT:**
- ❌ A networking platform
- ❌ A discovery system
- ❌ A messaging tool

**Truferral v1 IS:**
- ✅ **A truth execution system**

---

## ACTION DEFINITION RULE

**Only actions that irreversibly advance a referral toward a verified outcome are allowed.**

**If an action does NOT mutate system state toward truth, it does NOT exist.**

---

## ✅ THE ONLY 3 CORE USER ACTIONS (V1)

### ACTION 1 — DECLARE REFERRAL INTENT

#### User Does:
- **Explicitly declares intent to make or request a referral**

**Specifies, at minimum:**
1. **Parties involved**
   - Introducer (self)
   - Party A (being introduced)
   - Party B (being introduced to)

2. **Purpose of referral**
   - Hiring
   - Investment
   - Partnership
   - Customer introduction
   - Other (with description)

3. **Success condition**
   - What constitutes success
   - Must be binary (yes/no)
   - Must be verifiable
   - Examples:
     - "Hire is made within 90 days"
     - "Investment closes"
     - "Partnership contract signed"
     - "First paid invoice received"

4. **Time window**
   - When success is evaluated
   - Default: 90 days
   - Custom: user-specified
   - Maximum: 1 year

---

#### System Does:

1. **Validates completeness and clarity**
   - All required fields present
   - Success condition is binary
   - Time window is valid
   - Parties are identifiable

2. **Creates a pending referral object (uncommitted)**
   - Status: `draft`
   - Not yet frozen
   - Can still be edited
   - Not yet in trust system

---

#### Why This Action Exists:

✅ **Converts vague social favors into explicit commitments**
- "Can you intro me?" → Structured intent declaration
- Ambiguity removed
- Terms clarified upfront

✅ **Eliminates ambiguity and deniability**
- No "I never said that"
- No "I thought you meant..."
- Terms are written, not verbal

✅ **Initiates the trust execution loop**
- First step in workflow
- Gates entry to system
- Filters out casual requests

---

#### Explicitly NOT Included:

❌ **Messaging**
- No chat about the referral
- No back-and-forth negotiation
- Communication happens off-platform

❌ **Discovery**
- No "find me someone"
- No matching algorithms
- User already knows who to introduce

❌ **Suggestions**
- No "you should meet..."
- No recommendations
- No AI-generated matches

❌ **Casual or exploratory asks**
- No "maybe intro me sometime?"
- No soft commitments
- Intent must be explicit and serious

---

### ACTION 2 — COMMIT VIA TRUTH SNAPSHOT

#### User Does:

1. **Confirms intent**
   - Reviews draft referral
   - Verifies all terms are correct
   - Understands consequences

2. **Accepts responsibility**
   - Acknowledges reputation at stake
   - Agrees to verification process
   - Accepts automatic consequences

3. **Commits to the referral terms**
   - Final confirmation
   - Irreversible action
   - Enters trust system

---

#### System Does:

**Freezes an immutable Truth Snapshot containing:**

1. **Participants**
   - Introducer ID
   - Party A ID
   - Party B ID

2. **Declared intent**
   - Full text of purpose
   - Success condition (exact wording)
   - Time boundary

3. **Conditions**
   - Verification method
   - Dispute resolution rules
   - Consequence algorithm

4. **Verification rules**
   - How outcome will be determined
   - Evidence requirements
   - Timeouts and defaults

5. **Generates a snapshot ID**
   - Unique identifier (UUID)
   - Never reused
   - Used to reference this referral forever

6. **Prevents modification or deletion**
   - Append-only structure
   - No edits allowed
   - No deletions allowed
   - Immutable record

---

#### Why This Action Exists:

✅ **This is the irreversible moment that changes reality**
- Draft → Committed
- Social → Contractual
- Ambiguous → Frozen

✅ **Transfers reputational risk into an enforceable system**
- Reputation now at stake
- System becomes accountable
- Protection activates

✅ **Makes trust computable and auditable**
- Truth is recorded
- Evidence can be evaluated
- Consequences are automatic

---

#### Explicitly NOT Included:

❌ **Editing after commit**
- No changes to terms
- No "I meant to say..."
- Snapshot is final

❌ **Soft confirmation**
- No "maybe" or "probably"
- Binary commitment only
- All or nothing

❌ **Partial or reversible commitment**
- Cannot uncommit
- Cannot revoke snapshot
- Irreversible by design

---

### ACTION 3 — VERIFY OUTCOME

#### User or Counterparty Does:

1. **Submits evidence**
   - Documents (contracts, emails, receipts)
   - Screenshots
   - Third-party confirmations
   - System integrations (ATS, CRM)

2. **Confirms success or failure**
   - Binary declaration
   - References snapshot ID
   - Includes evidence

3. **Raises dispute (if applicable)**
   - Within pre-defined rules only
   - References specific arbitration rule
   - Provides counter-evidence
   - Time-bounded (7 days max)

---

#### System Does:

1. **Validates evidence against the snapshot**
   - Evidence references correct snapshot ID
   - Evidence is timestamped
   - Evidence supports claimed outcome

2. **Resolves outcome deterministically**
   - Uses FR-5 verification rules:
     - Mutual confirmation, OR
     - Time-bound auto-confirmation, OR
     - Admin arbitration (rule-based)
   - No human judgment
   - Algorithm-driven

3. **Executes consequences automatically**
   - Reputation changes
   - Access control updates
   - Trust state modified
   - No manual intervention

4. **Updates reputation and trust state**
   - Historical record updated
   - Success/failure counts incremented
   - Domain-specific reputation adjusted
   - Immutable log entry created

---

#### Why This Action Exists:

✅ **Converts social memory into ground truth**
- "Did it happen?" → Verified yes/no
- Opinion → Evidence
- Narrative → Fact

✅ **Enables compounding trust**
- Reputation increases with success
- Access expands with reliability
- Network quality improves

✅ **Closes the loop definitively**
- Referral reaches terminal state
- No lingering ambiguity
- System is complete

---

#### Explicitly NOT Included:

❌ **Negotiation**
- No "let's call it partial success"
- No bargaining over outcome
- Binary only

❌ **Narrative debate**
- No "here's what really happened"
- Evidence, not stories
- Facts, not opinions

❌ **Manual overrides**
- No admin discretion
- No "this one doesn't count"
- Rules apply universally

---

## 🚫 EXPLICITLY NOT CORE USER ACTIONS (V1)

**The following do NOT exist as actions in Truferral v1:**

❌ **Browsing profiles**
- No user directory
- No search functionality
- No discovery interface

❌ **Searching users**
- No search bar
- No filters
- No recommendations

❌ **Sending messages or DMs**
- No in-app messaging
- No chat system
- Communication is off-platform

❌ **Scheduling meetings**
- No calendar integration
- No meeting booking
- Coordination is off-platform

❌ **Giving feedback or ratings**
- No reviews
- No testimonials
- No endorsements

❌ **Consuming content or feeds**
- No timeline
- No posts
- No updates

---

## SCOPE BOUNDARY

**These belong to Growth Engine (future), not the Trust Engine v1.**

**Two-Engine Architecture:**


Growth Engine (v2+):
	∙	Discovery
	∙	Browsing
	∙	Messaging
	∙	Matching
Trust Engine (v1):
	∙	Declare Intent
	∙	Commit Snapshot
	∙	Verify Outcome


**v1 builds Trust Engine only.**

---

## 🔁 CANONICAL LOOP (LOCKED)



Declare Intent → Freeze Truth → Verify Outcome


**If an action does NOT advance this loop, it is invalid.**

---

## ACTION FLOW DIAGRAM



User Journey:
	1.	DECLARE INTENT
↓
[System validates]
↓
Draft created (uncommitted)
↓
	2.	COMMIT SNAPSHOT
↓
[System freezes truth]
↓
Snapshot created (immutable)
↓
[Referral happens off-platform]
↓
	3.	VERIFY OUTCOME
↓
[System validates evidence]
↓
Outcome finalized
↓
[System executes consequences]
↓
Reputation updated
↓
LOOP COMPLETE


---

## 🔒 ENFORCEMENT RULE

### No Additional Core User Actions May Be Added in V1

**Any attempt to add a fourth action requires:**

1. **Scope freeze violation**
   - Log in `/docs/00_governance/violation_log.md`
   - Immediate halt

2. **Governance review**
   - Founder decision (Step 8 kill authority)
   - Council re-evaluation

3. **Phase reset**
   - Return to Step 13 (Non-goals)
   - Re-validate BRD/FRD alignment
   - Potentially KILL or REDESIGN

---

### Supremacy

**These 3 actions are sufficient and necessary.**

**Sufficient:** Cover entire trust loop  
**Necessary:** Remove any one, system fails

**Rule:** If you think you need a 4th action, you're wrong. Revisit the 3.

---

## VALIDATION CHECKLIST

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Actions are minimal (exactly 3) | ✅ | No 4th action exists |
| Each action advances loop | ✅ | Declare → Commit → Verify sequence |
| Exclusions are explicit | ✅ | Section: "Explicitly NOT Core User Actions" |
| Enforcement rule exists | ✅ | 4th action = scope violation |
| Loop is closed | ✅ | Verify Outcome completes the cycle |

---

## LOCK STATUS

🔒 **LOCKED** - Core actions are immutable for v1

**Revision Criteria:**
- Only if one of the 3 actions is proven unnecessary
- Only if loop cannot close with these 3 actions
- Only with founder approval + decision_log.md entry

**Until then:** These 3 actions are frozen.

---

## NEXT STEP

→ **Step 15:** Define One Happy Path End-to-End

**Instruction:** Say "GO — Step 15" when ready

---

## METADATA

**Created By:** Project Owner (Rehan)  
**Reviewed By:** Expert Council + Claude  
**SSOT Status:** ✅ LOCKED  
**Dependencies:** Steps 1-13 (especially BRD, FRD, Non-goals)  
**Referenced By:** Steps 15-16, all implementation phases

---

**END OF STEP 14**