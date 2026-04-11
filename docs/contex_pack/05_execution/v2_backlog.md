## PURPOSE

Protect v1 by isolating all non-v1 work into a governed backlog that cannot "leak" into execution.

**Goal:** Ensure v1 execution remains focused on proving Trust Engine primitives without contamination from Growth Engine or polish features.

---

## 28.0 GOVERNING PRINCIPLE (NON-NEGOTIABLE)

**v1 exists to prove the Trust Engine milestone.**

**Anything that does not directly support the v1 milestone is v2.**

### Definitions

- **v1** = Trust Engine proof (truth primitives, verification, deterministic disputes, asymmetric consequences)
- **v2** = Everything else (growth, AI, monetization, polish, scale, integrations, advanced UX)

---

## 28.1 v1 GUARDRAIL RULE (BINARY)

**A task is v1 ONLY IF it is required to achieve:**

- ✅ Step 12 Acceptance Criteria (PASS)
- ✅ Step 15 Happy Path (PASS)
- ✅ Step 18 Event Sourcing architecture (PASS)
- ✅ Step 19 API contracts (PASS)
- ✅ Step 20 Data model + ownership (PASS)
- ✅ Step 21 Error handling policy (PASS)
- ✅ Step 22 Logging observability (PASS)
- ✅ Step 23 Threat model (PASS)

**If not required → v2.**

---

## 28.2 v2 BACKLOG STRUCTURE (CATEGORIES)

All deferred items must be placed under exactly one category:

### 1. Growth Engine (Engine A)
- Discovery, matchmaking, events, feeds, outreach loops, invites, virality

### 2. AI Features
- AI ranking, auto-evidence interpretation, summarization, assistant agents

### 3. Monetization & Pricing
- Subscriptions, take-rate, payouts, billing, invoicing

### 4. UX / UI Polish
- Design system, animations, onboarding polish, notifications

### 5. Scale & Infrastructure
- Microservices, sharding, queues, caching, high-availability

### 6. Integrations
- LinkedIn/email/calendar/CRM sync, webhooks, external identity

### 7. Compliance / Legal
- Formal audits, ISO/SOC, privacy automation, enterprise policies

### 8. Analytics & Admin Expansion
- Advanced dashboards, BI tooling, admin console UI

---

## 28.3 TRACEABILITY TABLE (STRATEGIC GAP S28-1 CLOSED)

**Every deferred item must appear in this table.**

### Legend

**Decision:**
- V1 - Required for v1 milestone
- V2 - Deferred to v2

**Reason Codes:**
- **R1** - Not required for milestone
- **R2** - Adds surface area / risk
- **R3** - Incentive distortion risk
- **R4** - Operational complexity
- **R5** - Can't be validated pre-truth

---

### Deferred Task Register (from Step 25)

| Item ID | Short Name | Decision | Category | Reason | Notes |
|---------|-----------|----------|----------|--------|-------|
| V2-001 | Discovery feed / browsing | V2 | Growth Engine | R1, R2 | Violates "no browsing" principle |
| V2-002 | Matchmaking / recommendations | V2 | Growth Engine | R1, R4 | Not needed for trust proof |
| V2-003 | Group events / meetups | V2 | Growth Engine | R1, R4 | Adds ops + moderation |
| V2-004 | DMs / chat | V2 | UX/Polish | R2 | Creates bypass channel |
| V2-005 | Social graph / followers | V2 | Growth Engine | R1, R2 | Non-essential network layer |
| V2-006 | Monetization (pricing/billing) | V2 | Monetization | R3 | Incentivizes gaming pre-truth |
| V2-007 | Payout rails | V2 | Monetization | R3, R4 | Complex + fraud surface |
| V2-008 | AI outcome scoring | V2 | AI Features | R5 | Truth primitives first |
| V2-009 | AI matchmaking | V2 | AI Features | R5 | Adds black-box risk |
| V2-010 | Advanced analytics dashboards | V2 | Analytics/Admin | R1 | v1 only needs minimal metrics |
| V2-011 | Multi-tenant enterprise mode | V2 | Scale/Infra | R1, R4 | Premature scale |
| V2-012 | Mobile apps | V2 | UX/Polish | R1, R4 | Web is enough for v1 |
| V2-013 | Deep integrations (CRM/calendar) | V2 | Integrations | R1, R4 | Later compounding |
| V2-014 | Compliance certification | V2 | Compliance/Legal | R1, R4 | After v1 proof |

**Rule:** If an item is deferred during execution, it must be added here within **10 minutes**.

---

## 28.4 ENFORCEMENT RULES (HARD)

### 28.4.1 No v2 Leakage

**If any v2 item appears in v1 execution (code, tasks, PRs, demos):**
- ❌ Immediate violation
- ❌ Work stops
- ✅ Must follow recovery procedure (Section 28.6)

### 28.4.2 Stakeholder Immunity Clause (FORESIGHT F28-1 CLOSED)

**Until v2 entry protocol is satisfied:**
- ❌ No OKRs/KPIs may reference v2 items
- ❌ No sales/marketing commitments may promise v2 items
- ❌ No "just one small feature" exceptions

**If any incentive ties to v2 → violation.**

### 28.4.3 No Reframing

**Renaming a v2 item to sound like a v1 "bugfix" is forbidden.**

Bugfixes are allowed **only if** they do not add new behavior.

---

## 28.5 v2 ENTRY PROTOCOL (STRATEGIC GAP S28-2 CLOSED)

**The team may not even discuss starting v2 execution unless ALL are true:**

1. ✅ **v1 milestone passed** (Step 29 definition)
2. ✅ **v1 acceptance tests pass** (Step 12)
3. ✅ **30 consecutive days with:**
   - Zero P1 trust violations
   - Zero hash chain integrity failures
   - Dispute rate ≤ 10% of referrals
4. ✅ **v1 maintenance load < 20% of weekly capacity**
5. ✅ **Project Owner signs "v2 Entry Approved"** in `/docs/00_governance/violation_log.md`

---

## 28.6 RETROACTIVE QUARANTINE PROCEDURE (FORESIGHT F28-2 CLOSED)

**If a v2 item is discovered after being implemented:**

1. **Quarantine** PR/commit(s) immediately
2. **Revert or isolate** behind a dead flag (default = revert)
3. **Log incident** in `/docs/00_governance/violation_log.md` with:
   - Root cause
   - How it bypassed enforcement
   - Prevention action
4. **Run contradiction check** (Step 24 rules) on affected docs/code
5. **Resume work only after** Project Owner marks incident CLOSED

---

## 28.7 BACKLOG INTEGRITY RULE (FORESIGHT F28-3 CLOSED)

**To prevent backlog atrophy:**

- ✅ **Quarterly review** of `v2_backlog.md`
- ✅ Any item dormant **12 months** without meeting v2 entry protocol:
  - Move to `Archived v2`
  - Must include reason for archival

---

## 28.8 COMPLETION CRITERIA

### ✅ STEP 28 IS COMPLETE WHEN:

- ✅ `v2_backlog.md` exists with categories + traceability table
- ✅ Enforcement rules are written and unambiguous
- ✅ v2 entry protocol exists and is measurable
- ✅ Quarantine procedure exists for violations
- ✅ Quarterly review + archive rule exists

---

## 28.9 v2 BACKLOG SUMMARY

**Total Deferred Items:** 14

**By Category:**
- **Growth Engine:** 5 items (V2-001 to V2-005)
- **Monetization:** 2 items (V2-006, V2-007)
- **AI Features:** 2 items (V2-008, V2-009)
- **Analytics/Admin:** 1 item (V2-010)
- **Scale/Infra:** 1 item (V2-011)
- **UX/Polish:** 2 items (V2-004, V2-012)
- **Integrations:** 1 item (V2-013)
- **Compliance/Legal:** 1 item (V2-014)

**Top Reason Codes:**
- R1 (Not required for milestone): 11 items
- R4 (Operational complexity): 9 items
- R2 (Adds surface area/risk): 5 items
- R3 (Incentive distortion): 2 items
- R5 (Can't validate pre-truth): 2 items

---

## VALIDATION CHECKLIST

| Criterion | Status | Evidence |
|-----------|--------|----------|
| All non-v1 items categorized | ✅ | 14 items in traceability table |
| v1 guardrail rule defined | ✅ | Section 28.1 |
| 8 backlog categories exist | ✅ | Section 28.2 |
| Traceability table complete | ✅ | Section 28.3 |
| No v2 leakage rule enforced | ✅ | Section 28.4.1 |
| Stakeholder immunity clause | ✅ | Section 28.4.2 |
| No reframing rule | ✅ | Section 28.4.3 |
| v2 entry protocol measurable | ✅ | Section 28.5 (5 criteria) |
| Quarantine procedure exists | ✅ | Section 28.6 |
| Backlog integrity rule exists | ✅ | Section 28.7 |

---

## NEXT STEP AUTHORIZATION

**Step 28 Status:** ✅ COMPLETE & LOCKED

**Authorization:** v1 is now protected against scope contamination. All non-v1 work is isolated in governed backlog with entry protocol.

**Next Step:** Step 29 — v1 Milestone Definition

**Instruction:** Say **"GO — Step 29"** to define the exact criteria that mark v1 as complete and ready for first users

---

## METADATA

**Created By:** Project Owner (Rehan)  
**Enhanced:** Strategic gaps S28-1, S28-2 closed; Foresights F28-1, F28-2, F28-3 closed  
**Dependencies:** Steps 12, 15, 18-23, 25 (v1 requirements)  
**Referenced By:** Step 29 (Milestone Definition), Step 31 (Plan Lock), All execution phases (enforcement)

**STEP 28 STATUS:** ✅ COMPLETE & LOCKED

---

**END OF STEP 28**