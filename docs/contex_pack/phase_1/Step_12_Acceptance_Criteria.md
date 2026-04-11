## PURPOSE

Define binary, falsifiable conditions that determine PASS vs KILL for v1.

**Critical principle:** Every criterion must be verifiable via logs, records, or artifacts.

---

## 0. ACCEPTANCE RULES (NON-NEGOTIABLE)

✅ **Every criterion is binary** (PASS / FAIL)

✅ **No subjective language**
- Not: "works well"
- Yes: "completes in <2 seconds"

✅ **No partial credit**
- Not: "mostly works"
- Yes: "all 3 referrals complete"

✅ **Verifiable via logs, records, or artifacts**
- Database records
- System logs
- Audit trails
- Automated tests

✅ **Failure of any single critical criterion = FAIL**
- Critical criteria marked with ⚠️
- Any critical failure triggers kill decision

---

## 1. SYSTEM-LEVEL ACCEPTANCE (EXISTENCE TESTS)

### AC-S1 — Truth-Before-Action Enforcement ⚠️ CRITICAL

**PASS if:**
- No referral action executes without a valid snapshot ID
- Every action has `snapshot_id` field populated
- Invalid snapshot IDs are rejected

**FAIL if:**
- Any referral completes without snapshot enforcement
- System allows NULL snapshot_id
- Bypass exists in code

**Verification method:**
```sql
SELECT COUNT(*) FROM actions WHERE snapshot_id IS NULL;
-- Result must be 0


Kill trigger: YES (critical to moat)

AC-S2 — Snapshot Immutability ⚠️ CRITICAL
PASS if:
	∙	Snapshot records are append-only
	∙	No UPDATE or DELETE operations possible
	∙	Cryptographic hash validates integrity (optional but recommended)
FAIL if:
	∙	Any snapshot field can be altered post-creation
	∙	UPDATE queries succeed on snapshots table
	∙	Deletion is possible
Verification method:

-- Attempt to update snapshot
UPDATE snapshots SET purpose = 'modified' WHERE id = 'test_id';
-- Must fail with permission error

-- Check for delete capability
DELETE FROM snapshots WHERE id = 'test_id';
-- Must fail with permission error


Kill trigger: YES (critical to trust)

AC-S3 — Rule-Bound Outcome Finalization ⚠️ CRITICAL
PASS if:
Every finalized outcome satisfies exactly one FR-5 rule:
	∙	Mutual confirmation (both parties confirmed), OR
	∙	Time-bound auto-confirmation (30 days elapsed, no dispute), OR
	∙	Admin arbitration (dispute resolved by admin)
FAIL if:
	∙	Any outcome finalizes outside these three rules
	∙	Outcome status changes without matching rule
	∙	Manual SQL updates bypass rules
Verification method:

SELECT 
  snapshot_id,
  verification_method,
  COUNT(*) 
FROM outcomes 
WHERE status = 'finalized'
GROUP BY snapshot_id, verification_method;

-- Every row must have verification_method IN 
-- ('mutual_confirm', 'auto_confirm', 'admin_arbitration')


Kill trigger: YES (critical to verification integrity)

AC-S4 — Automatic Consequence Execution ⚠️ CRITICAL
PASS if:
	∙	Reputation changes occur automatically upon outcome finalization
	∙	No human approval required
	∙	Executes within 1 minute of verification
FAIL if:
	∙	Any manual override required
	∙	Social negotiation affects consequences
	∙	Admin can adjust reputation directly
Verification method:

1. Finalize an outcome (success)
2. Check reputation_log table
3. Verify reputation_change event exists with timestamp within 60 seconds
4. Verify no manual_override flag is true


Kill trigger: YES (critical to enforcement)

2. CORE LOOP ACCEPTANCE (STEP-7 METRIC)
AC-C1 — Three End-to-End Verified Referrals ⚠️ CRITICAL
PASS if:
≥3 referrals complete with ALL of:
	∙	Snapshot creation
	∙	Snapshot-referenced execution
	∙	Verified outcome (via FR-5 rules)
	∙	Automatic consequences applied
FAIL if:
	∙	Fewer than 3 complete cleanly
	∙	Any of the 4 steps missing for any referral
	∙	Manual intervention occurred
Verification method:

SELECT COUNT(*) 
FROM snapshots s
JOIN outcomes o ON s.id = o.snapshot_id
JOIN reputation_log r ON o.snapshot_id = r.snapshot_id
WHERE 
  o.status = 'finalized'
  AND r.automatic = true;
-- Result must be >= 3


Kill trigger: YES (this is Step 7 metric)

AC-C2 — Zero Manual Intervention ⚠️ CRITICAL
PASS if:
	∙	No human intervention required to complete AC-C1
	∙	No admin actions in audit log for these 3 referrals
	∙	No engineer fixes or workarounds
FAIL if:
	∙	Any admin or engineer “helps it work”
	∙	Logs show manual override
	∙	Support tickets created
Verification method:

SELECT COUNT(*) 
FROM audit_log 
WHERE 
  snapshot_id IN (first_3_verified_referrals)
  AND action_type = 'manual_intervention';
-- Result must be 0


Kill trigger: YES (proves system doesn’t scale)

AC-C3 — Bypass Neutralization
PASS if:
	∙	Off-system outcome claims remain unverified
	∙	No consequences applied to bypassed outcomes
	∙	Bypass attempts logged
FAIL if:
	∙	System accepts bypassed outcomes
	∙	Consequences apply without verification
	∙	Bypass not detected
Verification method:

SELECT COUNT(*) 
FROM outcomes 
WHERE 
  verification_method IS NULL 
  AND status = 'finalized';
-- Result must be 0


Kill trigger: NO (but indicates serious flaw)

AC-C4 — Invalid Snapshot Rejection
PASS if:
	∙	System rejects malformed snapshot IDs
	∙	System rejects expired snapshots (>1 year old)
	∙	System rejects nonexistent snapshot references
FAIL if:
	∙	Any invalid snapshot reference is accepted
	∙	Validation can be bypassed
	∙	Error handling is missing
Verification method:

1. Attempt action with invalid_snapshot_id
2. Verify system returns 400 error
3. Verify no database record created


Kill trigger: NO (but indicates weak validation)

3. TRUST & REPUTATION ACCEPTANCE
AC-T1 — Trust State Persistence
PASS if:
	∙	Trust state reflects historical verified outcomes
	∙	Reputation scores derived from immutable log
	∙	Historical data accessible
FAIL if:
	∙	Trust resets
	∙	Reputation is editable
	∙	History is ignored or lost
Verification method:

-- User completes 3 successful referrals
-- Check reputation increases
SELECT reputation_score FROM users WHERE id = 'test_user';
-- Verify score = initial + (3 * success_bonus)


Kill trigger: NO (but breaks core value prop)

AC-T2 — Asymmetric Consequences
PASS if:
	∙	Introducer impact differs from referee impact
	∙	Algorithm documented in /docs/04_architecture/trust_engine.md
	∙	Asymmetry verifiable in code
FAIL if:
	∙	Consequences are symmetric
	∙	Everyone gets same reputation change
	∙	Asymmetry not implemented
Verification method:

1. Complete referral with success
2. Check introducer reputation change: ΔI
3. Check referee reputation changes: ΔR1, ΔR2
4. Verify ΔI ≠ ΔR1 and ΔI ≠ ΔR2


Kill trigger: NO (but weakens moat)

AC-T3 — Non-Linear Impact
PASS if:
	∙	Impact of second failure > impact of first failure
	∙	Compounding effect exists
	∙	Algorithm implements non-linearity
FAIL if:
	∙	Impact is linear (same penalty every time)
	∙	No compounding
	∙	Failures don’t accumulate
Verification method:

User A:
- 1 failure: reputation_change = -30

User B:
- 1 failure: reputation_change = -30
- 2nd failure: reputation_change = -45 (or more)

Verify User B's second failure has greater impact


Kill trigger: NO (but weakens trust compounding)

AC-T4 — Trust State Survives Restart
PASS if:
	∙	Trust state remains intact after system restart
	∙	Database persistence works
	∙	No in-memory-only state
FAIL if:
	∙	Trust state degrades
	∙	Reputation resets
	∙	Data loss occurs
Verification method:

1. Record user reputation: R1
2. Restart system
3. Check user reputation: R2
4. Verify R1 == R2


Kill trigger: NO (but critical bug)

4. DISPUTE HANDLING ACCEPTANCE (CRITICAL)
AC-D1 — Deterministic Resolution
PASS if:
	∙	All disputes resolve using predefined arbitration rules
	∙	Rule ID referenced in every arbitration decision
	∙	No ad-hoc decisions
FAIL if:
	∙	Disputes devolve into negotiation
	∙	Decisions lack rule references
	∙	Admin “uses judgment”
Verification method:

SELECT COUNT(*) 
FROM arbitrations 
WHERE rule_id IS NULL;
-- Result must be 0


Kill trigger: NO (but indicates weak governance)

AC-D2 — Dispute Rate Containment
PASS if:
	∙	<10% of referrals trigger arbitration
	∙	Dispute rate calculated over 100+ referrals
	∙	Rate monitored continuously
FAIL if:
	∙	Dispute rate exceeds 10%
	∙	Success conditions too ambiguous
	∙	Verification process unclear
Verification method:

SELECT 
  (COUNT(*) FILTER (WHERE status = 'disputed') * 100.0 / COUNT(*)) as dispute_rate
FROM outcomes;
-- Result must be < 10.0


Kill trigger: NO (but triggers redesign if sustained)

AC-D3 — Arbitration Rules Are Pre-Defined & Immutable ⚠️ CRITICAL
PASS if:
	∙	Arbitration rules exist in /docs/04_architecture/arbitration_rules.md before first dispute
	∙	Rules cannot be modified during validation period
	∙	Every arbitration references specific rule IDs
	∙	Rule changes require decision_log.md entry
FAIL if:
	∙	Rules are created ad-hoc
	∙	Rules change per dispute
	∙	No documented rule exists for a case
Verification method:

1. Check /docs/04_architecture/arbitration_rules.md exists
2. Verify file has commit timestamp before first dispute
3. Check all arbitration records have rule_id
4. Verify rule_id matches documented rule


Kill trigger: YES (critical to scalability and fairness)
Example arbitration rule structure:

## Rule A1: Timeline Dispute
If parties disagree on whether time boundary was met:
- Check timestamp evidence
- If evidence exists: use timestamp
- If no evidence: favor introducer (benefit of doubt)
- Rationale: introducer has more at stake

## Rule A2: Success Condition Ambiguity
If success condition is ambiguous:
- Review snapshot original text
- If truly ambiguous: outcome = neutral (no reputation impact)
- Log ambiguity for future prevention
- Rationale: penalizes unclear intent declaration


5. SCOPE INTEGRITY ACCEPTANCE
AC-I1 — No Scope Leakage ⚠️ CRITICAL
PASS if:
NO excluded features exist:
	∙	No matching logic
	∙	No messaging platform
	∙	No payments/escrow
	∙	No AI agents
	∙	No org/team features
FAIL if:
	∙	Any excluded feature appears in code
	∙	Scope creep detected
	∙	Constraints (C-1 through C-5) violated
Verification method:

# Check codebase for excluded features
grep -r "match_users" src/  # Should return nothing
grep -r "send_message" src/  # Should return nothing
grep -r "payment" src/       # Should return nothing
grep -r "ai_agent" src/      # Should return nothing
grep -r "organization" src/  # Should return nothing


Kill trigger: YES (indicates loss of discipline)

AC-I2 — Docs–Code Consistency ⚠️ CRITICAL
PASS if:
	∙	Code behavior matches /docs exactly
	∙	No contradictions exist
	∙	Implementation reflects requirements
FAIL if:
	∙	Any contradiction exists between docs and code
	∙	Features in code not in docs
	∙	Features in docs not in code
Verification method:

1. Review FR-1 through FR-8 in Step 11
2. For each requirement, verify code implementation
3. Check for undocumented features in code
4. Log any contradictions in violation_log.md


Kill trigger: YES (if contradiction remains unresolved)

6. KILL CRITERIA (IMMEDIATE TERMINATION)
The project must be paused or killed if ANY occur:
Critical System Failures:
	∙	⚠️ AC-S1 fails (Truth-before-action not enforced)
	∙	⚠️ AC-S3 fails (Outcome finalization broken)
	∙	⚠️ AC-S4 fails (Consequences not automatic)
Core Loop Failures:
	∙	⚠️ AC-C1 fails after one attempt window (Step 7 metric)
	∙	⚠️ AC-C2 fails (Manual intervention required)
Governance Failures:
	∙	⚠️ AC-D3 fails (Arbitration ambiguity)
	∙	⚠️ AC-I1 fails (Scope leakage)
	∙	⚠️ AC-I2 fails (Docs-code contradiction unresolved)
Other Triggers:
	∙	Manual intervention occurs (violates automation principle)
	∙	Docs-code contradiction remains unresolved for >7 days
Action if triggered:
	1.	Immediate pause (all development stops)
	2.	Root cause analysis (within 7 days)
	3.	Kill decision (per Step 8 kill authority)
	4.	Options: KILL, REDESIGN, or PIVOT

ACCEPTANCE TEST PLAN
Phase 1: Automated Tests (Run before manual testing)

1. AC-S1: Snapshot enforcement test
2. AC-S2: Immutability test
3. AC-S4: Auto-consequence test
4. AC-C4: Invalid snapshot rejection test
5. AC-T4: Persistence test
6. AC-I1: Scope leakage check


Phase 2: Manual Validation (Human verification)

1. AC-C1: Complete 3 end-to-end referrals
2. AC-C2: Verify zero manual intervention
3. AC-S3: Verify all outcomes follow FR-5 rules
4. AC-D1: Test arbitration with predefined rules
5. AC-I2: Manual docs-code consistency review


Phase 3: Metrics Collection (Monitor over time)

1. AC-D2: Calculate dispute rate (ongoing)
2. AC-T1, T2, T3: Reputation mechanics validation


✅ STEP 12 VALIDATION CHECKLIST



|Criterion                   |Status|Evidence                                        |
|----------------------------|------|------------------------------------------------|
|Binary & falsifiable        |✅     |Every criterion has PASS/FAIL definition        |
|Dispute ambiguity removed   |✅     |AC-D3 requires pre-defined immutable rules      |
|Trust enforcement testable  |✅     |AC-T1 through AC-T4 have verification methods   |
|System autonomy enforced    |✅     |AC-C2 and AC-S4 require zero manual intervention|
|Council conditions satisfied|✅     |All amendments integrated                       |

Status: COMPLETED, AMENDED, AND LOCKED (v1.1)

LOCK STATUS
🔒 LOCKED - Acceptance criteria are final
Revision Criteria:
	∙	Only if criterion is proven untestable
	∙	Only if critical flaw discovered in logic
	∙	Only with founder approval + decision_log.md entry
Until then: These criteria are frozen.

NEXT STEP
→ Step 13: Write Non-Goals (what is explicitly excluded)
Instruction: Say “GO — Step 13” when ready

METADATA
Created By: Project Owner (Rehan)Reviewed By: Expert Council + ClaudeSSOT Status: ✅ LOCKEDDependencies: Steps 1-11 (especially FRD)Referenced By: All testing and validation phases

END OF STEP 12
