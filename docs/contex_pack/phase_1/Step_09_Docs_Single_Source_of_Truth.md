## PURPOSE

Prevent truth drift, scope poisoning, and rework before any code exists.

**Core principle:** If it's not in /docs, it doesn't exist.

---

## 1️⃣ CANONICAL FOLDER STRUCTURE



/docs
/00_governance
decision_log.md
scope_freeze.md
scope_hash.md
violation_log.md
/01_strategy
problem_statement.md
brd.md
success_metric.md
moat.md
/02_requirements
frd.md
acceptance_criteria.md
non_goals.md
/03_user_flow
core_actions.md
happy_path.md
/04_architecture
system_overview.md
growth_engine.md
trust_engine.md
data_model.md
api_contracts.md
/05_execution
phase_status.md
milestone_tracker.md
README.md


**Ordering is intentional:**
- Governance precedes strategy
- Strategy precedes requirements
- Requirements precede architecture

---

## 2️⃣ NAMING RULES (NON-NEGOTIABLE)

✅ **One concept = one file**
- No duplicates
- No "v2", "v3", "final", "final_final"
- Single authoritative version only

✅ **Filenames must be lowercase_snake_case.md**
- Examples: `problem_statement.md`, `api_contracts.md`, `decision_log.md`
- No spaces, no capitals, no special characters

✅ **If meaning changes → log it**
- Record in `decision_log.md`
- Explain why change was made
- Include timestamp and author

---

## 3️⃣ UPDATE RULES (TRUTH DISCIPLINE)

**Any change to /docs requires:**

1. **Reason for change** (why is this being updated?)
2. **Timestamp** (when was this changed?)
3. **Author** (who made the change?)

**All changes must be recorded in:**


/docs/00_governance/decision_log.md


**Rule:** Unlogged changes are invalid.

**Consequence:** If change isn't logged, it didn't happen.

---

## 4️⃣ WHAT MUST LIVE IN /docs

✅ **Product intent** (why it exists)
✅ **Scope boundaries** (what's in, what's out)
✅ **User actions** (what users can do)
✅ **Architecture intent** (how it's structured)
✅ **Decisions that cannot be inferred from code** (the "why" behind the "what")

**Rule:** If it defines intent, constraint, or truth — it belongs here.

**Examples:**
- "We chose event sourcing because..." → YES
- "Users can request referrals" → YES
- "Snapshot happens before execution" → YES
- "Maximum 3 pending requests per user" → YES

---

## 5️⃣ WHAT MUST NEVER LIVE IN /docs

❌ **Implementation details**
- Example: "We use PostgreSQL 15.2" → NO (goes in tech stack docs)

❌ **Experiments or spikes**
- Example: "Testing if Redis is faster" → NO (goes in experiments folder)

❌ **Temporary notes**
- Example: "TODO: ask about this" → NO (goes in issues/comments)

❌ **Marketing copy**
- Example: "Transform your network!" → NO (goes in marketing materials)

❌ **Backlog tasks**
- Example: "Add dark mode" → NO (goes in project management tool)

❌ **Code comments**
- Example: "This function validates email" → NO (goes in code itself)

**Where they belong:**
- Repositories (code details)
- Issues/tickets (tasks and TODOs)
- Project tools (backlog, sprints)
- Marketing folder (copy and messaging)

---

## 6️⃣ READ-BEFORE-WRITE RULE (HARD ENFORCEMENT)

**No one may:**
- Write code
- Add features
- Plan tasks

**Unless:**
- The relevant /docs file exists
- AND has been read
- AND is understood

**Hierarchy of truth:**


/docs > Code > Comments > Conversations


**Rule:** If code contradicts /docs, the code is wrong.

**Exception:** None. If /docs is wrong, update /docs first, then code.

---

## 7️⃣ VIOLATION RULES (IMMEDIATE CONSEQUENCES)

**If truth drifts:**

### Step 1: Log the violation
**Where:**


/docs/00_governance/violation_log.md


**What to record:**
- What contradicted what
- When it was discovered
- Who discovered it
- Impact assessment

### Step 2: Pause execution immediately
- Stop all development
- No new commits
- No new deployments

### Step 3: Resolve the contradiction
- Determine root cause
- Update /docs or code (whichever is wrong)
- Verify alignment restored

### Step 4: Resume only after resolution
- Document resolution in decision_log.md
- Clear violation from violation_log.md
- Resume development

**Consequence of repeated violations:**
- Triggers scope review
- May trigger complete reset
- Indicates process breakdown

---

## 8️⃣ IMMUTABLE SCOPE CHECKPOINTS (AUDIT-GRADE)

**After any scope freeze or major phase completion:**

### Generate SHA-256 hash
**Command:**
```bash
find /docs -type f -exec sha256sum {} \; | sort | sha256sum


Record in scope_hash.md
Location:

/docs/00_governance/scope_hash.md


Each entry must include:
	∙	Hash: (SHA-256 of entire /docs directory)
	∙	Timestamp: (ISO 8601 format)
	∙	Phase: (e.g., “Phase 0 Complete”, “Scope Locked”)
	∙	Approver: (who signed off)
Purpose: Makes /docs tamper-evident
Benefit: Can prove what scope was at any point in time

9️⃣ CONCEPTUAL INTEGRITY REVIEW
Frequency: At each phase boundary OR quarterly (whichever comes first)
Process:
One human must:
	∙	Read the entire /docs directory in one sitting
	∙	Cover to cover
	∙	No interruptions
	∙	Fresh perspective
	∙	Log observations
	∙	Record in decision_log.md
	∙	Note any contradictions
	∙	Identify subtle drift
	∙	Flag unclear areas
Reviewer: Preferably the founder (kill authority holder)
Purpose: Detect subtle contradictions before they compound
Why in one sitting: Prevents context loss, enables pattern recognition

🔟 AUTOMATED ENFORCEMENT (CI/CD HOOK)
Any entry in:

/docs/00_governance/violation_log.md


Must automatically:
	∙	❌ Fail CI (continuous integration checks)
	∙	❌ Block merges (no PR can be merged)
	∙	❌ Block deploys (no production releases)
Enforcement logic:

# Example CI check
if [ -s /docs/00_governance/violation_log.md ]; then
  echo "ERROR: Unresolved violations in /docs"
  exit 1
fi


Principle:
	∙	/docs defines the rule
	∙	Machines enforce it
	∙	Humans cannot bypass

1️⃣1️⃣ README.md (LOCKED TEXT)
File location: /docs/README.md
Required content:

# TRUFERRAL DOCUMENTATION

/docs is the single source of truth for Truferral.

**Rules:**
- If something is not here, it does not exist.
- If code contradicts /docs, the code is wrong.
- All changes must be logged in decision_log.md.

**Read this first:** governance/decision_log.md


GOVERNANCE MATURITY LEVEL
Assessment: Enterprise-grade
Characteristics:
	∙	✅ Tamper-evident (scope hashing)
	∙	✅ Drift-resistant (violation logging + CI enforcement)
	∙	✅ Rework-preventive (read-before-write rule)
	∙	✅ Audit-ready (decision log + timestamps)
	∙	✅ Machine-enforced (automated CI checks)
Comparison:
	∙	Startup default: Ad-hoc Google Docs (maturity level: 2/10)
	∙	Mid-size company: Confluence + some discipline (maturity level: 5/10)
	∙	Truferral /docs system: Enterprise-grade (maturity level: 9/10)

EXPERT COUNCIL APPROVAL
Reviewed by: Expert archetypes (Systems, Product, Execution)
Consensus: Approved with hardening
Hardening applied:
	∙	Added scope hashing (audit-grade)
	∙	Added conceptual integrity review (drift detection)
	∙	Added CI/CD hooks (automated enforcement)
Status: COMPLETE, HARDENED, and LOCKED

IMPLEMENTATION CHECKLIST
Before moving to Step 10, verify:
	∙	/docs folder structure created
	∙	decision_log.md created (empty, ready for entries)
	∙	scope_freeze.md created (will be filled at Step 16)
	∙	scope_hash.md created (will record first hash at Step 16)
	∙	violation_log.md created (empty, hopefully stays that way)
	∙	README.md created with locked text
	∙	All team members briefed on rules
	∙	CI/CD hook configured (or planned)

LOCK STATUS
🔒 LOCKED - /docs structure and governance rules are final
Revision Criteria:
	∙	Only if fundamental governance flaw is discovered
	∙	Only if compliance becomes impossible
	∙	Requires founder approval + reasoning in decision_log.md
Until then: This structure is frozen.

NEXT STEP
→ Step 10: Write BRD (why this exists)
Instruction: Say “GO — Step 10” when ready

METADATA
Created By: Project Owner (Rehan)Reviewed By: Expert Council + ClaudeSSOT Status: ✅ LOCKEDDependencies: Steps 1-8 (Phase 0 complete)Referenced By: All subsequent steps (foundation for truth)

END OF step 9