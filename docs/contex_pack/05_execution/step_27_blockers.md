## PURPOSE

Prevent rework, trust corruption, and execution drift by surfacing all blocking risks before implementation proceeds.

**Goal:** Every blocker that could cause rework, non-determinism, silent trust violation, security exposure, or unclear ownership is explicitly documented with resolution criteria.

---

## 27.0 GOVERNING RULES (NON-NEGOTIABLE)

### Definition of Blocker

A blocker is anything that can cause:
- ❌ Rework
- ❌ Non-determinism
- ❌ Silent trust violation
- ❌ Security exposure
- ❌ Unclear ownership

### Required Blocker Attributes

Every blocker must include:
1. **Category** (A-F)
2. **Risk** (consequence if unresolved)
3. **Owner** (decision authority)
4. **Decision** (LOCK / IMPLEMENT / CHOOSE / DEFER)
5. **Unblock condition** (binary completion criteria)
6. **Latest-by** (milestone/task deadline)
7. **Verification artifact** (proof of resolution)

### Trust Invariant Protection

**Any blocker that threatens trust invariants is MUST-RESOLVE BEFORE CODING:**
- ✅ Immutability (event sourcing)
- ✅ Independent verification (two-party confirmation)
- ✅ Deterministic disputes (rule-based arbitration)
- ✅ Asymmetric consequences (non-linear penalties)

### Stop-the-Line Authority

If a Stop-the-Line condition is triggered, **all coding pauses immediately**.

---

## 27.1 BLOCKER CATEGORIES

| Category | Domain |
|----------|--------|
| **A** | Product / Scope |
| **B** | Architecture / Data |
| **C** | Security / Trust |
| **D** | Infrastructure / DevOps |
| **E** | Team / Process |
| **F** | Legal / Compliance |

---

## 27.2 MUST-RESOLVE BEFORE CODING (HARD BLOCKERS)

### B-01: Event Store Choice + Schema Lock

**Category:** B  
**Risk:** Schema drift breaks replay, rebuild, and auditability  
**Owner:** Backend Engineer  
**Decision:** LOCK NOW

**Unblock Condition:**
- ✅ `events` schema frozen
- ✅ Canonical JSON (RFC 8785) locked
- ✅ Genesis event defined

**Latest-by:** Before T-023 / T-031  
**Verification Artifact:** Schema migration + docs reference

---

### C-01: Canonical Hashing Specification

**Category:** C  
**Risk:** Hash mismatch → broken chain → trust collapse  
**Owner:** Backend Engineer  
**Decision:** LOCK NOW

**Unblock Condition:**
- ✅ SHA-256 algorithm
- ✅ RFC 8785 serialization
- ✅ Canonical input fields documented
- ✅ Test vectors created

**Latest-by:** Before T-031 / T-032  
**Verification Artifact:** Hash test suite passing

---

### C-02: Admin Authentication Separation

**Category:** C  
**Risk:** Privilege escalation via user tokens  
**Owner:** Backend Engineer  
**Decision:** IMPLEMENT NOW

**Unblock Condition:**
- ✅ Admin tokens isolated
- ✅ TTL + rotation defined
- ✅ User tokens rejected on admin routes

**Latest-by:** Before T-040.5 / T-050  
**Verification Artifact:** Auth tests rejecting user tokens

---

### C-03: Target Confirmation Token Delivery

**Category:** C  
**Risk:** Independent verification cannot complete  
**Owner:** Backend + Product  
**Decision:** CHOOSE NOW

**v1 Choice:**
- ✅ Email HTTPS link
- ✅ Single-use token
- ✅ Bound to snapshot + target email

**Latest-by:** Before T-044 / T-045  
**Verification Artifact:** Token flow test + threat model note

---

### B-02: Snapshot State Machine Validator

**Category:** B  
**Risk:** Invalid transitions corrupt trust state  
**Owner:** Backend Engineer  
**Decision:** IMPLEMENT NOW

**Unblock Condition:**
- ✅ Central validator
- ✅ Explicit allowed transitions table
- ✅ Deterministic rejection codes

**Latest-by:** Before T-041.5  
**Verification Artifact:** Transition rejection tests

---

### B-03: Arbitration Rules (Immutable & Versioned)

**Category:** B / C  
**Risk:** "Deterministic disputes" impossible  
**Owner:** Backend Engineer  
**Decision:** IMPLEMENT NOW

**Unblock Condition:**
- ✅ `arbitration_rules` table
- ✅ Immutable rows
- ✅ Seeded v1 rules

**Latest-by:** Before T-028 / T-050  
**Verification Artifact:** Rule lookup + immutability test

---

### C-04: Evidence Validation Rules

**Category:** C  
**Risk:** Garbage evidence accepted  
**Owner:** Backend Engineer  
**Decision:** LOCK NOW

**Unblock Condition:**
- ✅ Allowed types
- ✅ Size limits
- ✅ URL allowlist
- ✅ Metadata required

**Latest-by:** Before T-047  
**Verification Artifact:** Evidence rejection tests

---

### C-05: Evidence Verification Process (CRITICAL ADDITION)

**Category:** C  
**Risk:** Fabricated or irrelevant evidence accepted as truth  
**Owner:** Backend Engineer + Product  
**Decision:** IMPLEMENT NOW

**Unblock Condition:** Deterministic verification workflow:

#### 1. FILE Evidence
- ✅ SHA-256 verified
- ✅ Basic sanity checks (dates, amounts)

#### 2. LINK Evidence
- ✅ HTTPS only
- ✅ Domain verification
- ✅ Timestamp validation

#### 3. TEXT_ATTESTATION Evidence
- ✅ <1000 chars
- ✅ Requires counterparty confirmation

#### 4. All Evidence Types
- ✅ Requires counterparty acknowledgment or dispute within window

**Latest-by:** Before T-047  
**Verification Artifact:** Verification flow tests

---

### D-01: Evidence File Storage Target

**Category:** D / C  
**Risk:** Evidence pipeline stalls  
**Owner:** DevOps / Backend  
**Decision:** CHOOSE NOW

**v1 Choice:**
- ✅ Local disk (dev)
- ✅ S3-compatible object storage (prod)

**Latest-by:** Before T-048.5  
**Verification Artifact:** Upload/download hash verification

---

### B-04: Idempotency Key Storage

**Category:** B  
**Risk:** Duplicate writes corrupt audit trail  
**Owner:** Backend Engineer  
**Decision:** IMPLEMENT NOW

**Unblock Condition:**
- ✅ 24-hour TTL
- ✅ Cached responses
- ✅ Conflict detection

**Latest-by:** Before any write endpoint  
**Verification Artifact:** Duplicate request tests

---

### E-01: Definition of Done Enforcement

**Category:** E  
**Risk:** "Done" without proof → rework  
**Owner:** Project Owner  
**Decision:** ENFORCE NOW

**Unblock Condition:**
- ✅ Each task requires artifact (test, log, migration, doc)

**Latest-by:** Immediate  
**Verification Artifact:** Task checklist compliance

---

## 27.3 SAFE TO DEFER (EXPLICITLY LOGGED)

| ID | Blocker | Decision | Unblock Condition |
|----|---------|----------|-------------------|
| A-01 | Growth Engine | DEFER | Trust engine passes acceptance |
| D-02 | Logging Vendor | DEFER | JSON logs to stdout |
| D-03 | PagerDuty | DEFER | Basic alert hooks exist |
| F-01 | Compliance Packaging | DEFER | Before enterprise pilots |

---

## 27.4 STOP-THE-LINE CONDITIONS (IMMEDIATE HALT)

**Coding must stop immediately if:**

1. ❌ Event appended without hash chain verification
2. ❌ Snapshot state changes without validator
3. ❌ Evidence accepted without verification workflow
4. ❌ Dispute resolved without immutable `rule_id`
5. ❌ Target token reused, forged, or unbound

### Recovery Procedure (Mandatory)

When Stop-the-Line is triggered:

1. **Quarantine** affected events
2. **Rebuild** from last valid hash
3. **Verify** chain integrity
4. **Log** violation
5. **Resume** only after approval

---

## 27.5 ESCALATION RULES

**Escalation Trigger:**
- If a blocker is unresolved **48 hours before Latest-by**:
  - → **Escalate to Project Owner (Kill Authority)**

**Project Owner Decides:**
- ✅ Resolve immediately
- ✅ Re-scope
- ✅ Kill v1

---

## 27.6 OWNERSHIP & AUTHORITY

| Role | Authority | Scope |
|------|-----------|-------|
| **Kill Authority** | Rehan | Project continuation decisions |
| **Backend Owner** | Backend Engineer | Architecture, data, security |
| **DevOps Owner** | DevOps Engineer | Infrastructure, deployment |
| **Security Owner** | Backend Engineer + Project Owner | Trust invariants |

---

## 27.7 COMPLETION CRITERIA (PASS / FAIL)

### ✅ PASS IF:

- ✅ All MUST blockers resolved or locked
- ✅ C-05 (Evidence Verification Process) implemented
- ✅ Stop-the-line rules defined
- ✅ Verification artifacts exist for all hard blockers

### ❌ FAIL IF:

- ❌ Any trust invariant depends on "later"
- ❌ Evidence can be accepted without verification
- ❌ Hashing or arbitration rules undefined

---

## 27.8 BLOCKER SUMMARY

**Hard Blockers (Must-Resolve Before Coding):** 11 total
- **Architecture/Data (B):** 4 blockers
- **Security/Trust (C):** 5 blockers
- **Infrastructure (D):** 1 blocker
- **Process (E):** 1 blocker

**Deferred Blockers:** 4 total
- **Product (A):** 1 blocker
- **Infrastructure (D):** 2 blockers
- **Legal (F):** 1 blocker

**Stop-the-Line Conditions:** 5 critical violations

---

## VALIDATION CHECKLIST

| Criterion | Status | Evidence |
|-----------|--------|----------|
| All trust invariants protected | ✅ | C-01, C-02, C-05, B-02, B-03 |
| Evidence verification enforced | ✅ | C-04, C-05 |
| Hash chain protected | ✅ | B-01, C-01 |
| State machine protected | ✅ | B-02 |
| Disputes deterministic | ✅ | B-03 |
| Stop-the-line defined | ✅ | Section 27.4 |
| Recovery procedure exists | ✅ | Section 27.4 |
| Escalation path clear | ✅ | Section 27.5 |
| Ownership assigned | ✅ | Section 27.6 |

---

## NEXT STEP AUTHORIZATION

**Step 27 Status:** ✅ COMPLETE & LOCKED

**Authorization:** All blockers identified, categorized, and assigned owners with resolution criteria

**Next Step:** Step 28 — v2 Backlog

**Instruction:** Say **"GO — Step 28"** to create `v2_backlog.md` and cleanly move every non-v1 item out of the execution path so v1 stays uncompromised

---

## METADATA

**Created By:** Project Owner (Rehan) + Expert Council  
**Reviewed By:** Council validation passed  
**Dependencies:** Steps 25 (Task List), 26 (Dependency Graph), 18-23 (Architecture)  
**Referenced By:** Step 30 (Validation), Step 31 (Plan Lock)

**STEP 27 STATUS:** ✅ COMPLETE & LOCKED

---

**END OF STEP 27**