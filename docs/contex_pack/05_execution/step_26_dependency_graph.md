## PURPOSE

Convert Step 25 atomic tasks into an explicit DAG (dependency graph) and a topological execution order that prevents rework.

**Goal:** Ensure no task starts before its dependencies are complete, preventing architectural violations and rework.

---

## 26.0 RULES

**Execution Rules:**
- ✅ A task may start **only if** all `depends_on` tasks are DONE
- ✅ "Same layer" tasks can run in parallel (2-person team friendly)
- ✅ Critical path is explicitly marked (if it slips, whole schedule slips)
- ✅ If a dependency feels "optional," it's **not optional** unless moved to v2 backlog

---

## 26.1 DEPENDENCY GRAPH FORMAT

Each task entry includes:
- **Task:** T-###
- **Depends on:** [ ... ]
- **Unblocks:** (key tasks it enables)
- **Critical Path:** ✅ / ❌

---

## 26.2 CORE DAG (BY SUBSYSTEM)

### A) FOUNDATION / BOOT

| Task | Depends On | Unblocks | Critical Path |
|------|-----------|----------|---------------|
| T-001 | `[]` | Everything | ✅ |
| T-002 | `[T-001]` | T-003 | ✅ |
| T-004 | `[T-001]` | T-005 | ✅ |
| T-003 | `[T-002, T-004]` | T-005, DB/tasks | ✅ |
| T-005 | `[T-003]` | Service running | ✅ |

---

### B) OBSERVABILITY + ERROR BASELINE

| Task | Depends On | Unblocks | Critical Path |
|------|-----------|----------|---------------|
| T-010 | `[T-005]` | Consistent tracing | ✅ |
| T-011 | `[T-005]` | All logs | ✅ |
| T-012 | `[T-010, T-011]` | Predictable client behavior | ✅ |
| T-013 | `[T-012]` | Canonical error codes | ✅ |
| T-016 | `[T-011]` | CRITICAL alert pipeline | ❌ |
| T-014 | `[T-012, T-013]` | All write endpoints safety | ✅ |
| T-017 | `[T-020, T-014]` | Safe writes | ✅ |
| T-015 | `[T-012]` | Correct retry semantics | ❌ |

---

### C) DATABASE + CORE TABLES

| Task | Depends On | Unblocks | Critical Path |
|------|-----------|----------|---------------|
| T-020 | `[T-005, T-003]` | All storage | ✅ |
| T-021 | `[T-020]` | Identity basics | ❌ |
| T-023 | `[T-020]` | Event sourcing core | ✅ |
| T-022 | `[T-020]` | Snapshot reads | ✅ |
| T-024 | `[T-020]` | Evidence metadata | ❌ |
| T-025 | `[T-020]` | Token auth | ✅ |
| T-028 | `[T-020]` | Deterministic disputes | ✅ |
| T-026 | `[T-023, T-022]` | Rep projection | ❌ |
| T-027 | `[T-023, T-022]` | Capacity projection | ❌ |

---

### D) CRYPTO INTEGRITY (HASH CHAIN)

| Task | Depends On | Unblocks | Critical Path |
|------|-----------|----------|---------------|
| T-030 | `[T-004]` | T-031 | ✅ |
| T-031 | `[T-030]` | T-032 | ✅ |
| T-033 | `[T-031]` | T-032 | ✅ |
| T-032 | `[T-023, T-031, T-033]` | Safe event appends | ✅ |
| T-034 | `[T-032]` | Admin verification | ❌ |

---

### E) AUTH + COMMAND SIDE (WRITE APIs)

#### Auth Foundation

| Task | Depends On | Unblocks | Critical Path |
|------|-----------|----------|---------------|
| T-040 | `[T-012, T-013]` | All protected endpoints | ✅ |
| T-040.5 | `[T-040]` | Admin endpoints | ❌ |

#### Core Command Chain (Happy Path)

| Task | Depends On | Unblocks | Critical Path |
|------|-----------|----------|---------------|
| T-041 | `[T-040, T-014, T-017, T-023, T-022, T-032]` | T-042 | ✅ |
| T-041.5 | `[T-041]` | Safe transitions | ✅ |
| T-042 | `[T-041.5]` | T-043 | ✅ |
| T-043 | `[T-042]` | T-044, T-045 | ✅ |
| T-044 | `[T-025, T-043]` | T-045 | ✅ |
| T-045 | `[T-044]` | T-047 | ✅ |
| T-046 | `[T-045]` | Resilience | ❌ |
| T-047 | `[T-045, T-024]` | T-048.5, T-048 | ✅ |
| T-048.5 | `[T-047]` | T-048 | ✅ |
| T-048 | `[T-048.5]` | T-051 | ✅ |
| T-051 | `[T-048, T-028]` | T-052 | ✅ |
| T-052 | `[T-051]` | Acceptance | ✅ |
| T-053 | `[T-042, T-027]` | Throttling | ❌ |

#### Dispute Path

| Task | Depends On | Unblocks | Critical Path |
|------|-----------|----------|---------------|
| T-049 | `[T-043]` | T-050 | ❌ |
| T-050 | `[T-040.5, T-028, T-049]` | Trust finality | ❌ |

---

### F) QUERY SIDE (READ APIs)

| Task | Depends On | Unblocks | Critical Path |
|------|-----------|----------|---------------|
| T-060 | `[T-022, T-041]` | UI/debugging | ❌ |
| T-061 | `[T-023, T-041]` | Timelines | ❌ |
| T-062 | `[T-040.5, T-023, T-034]` | Audits | ❌ |
| T-063 | `[T-022]` | Pagination | ❌ |

---

### G) BACKGROUND JOBS

| Task | Depends On | Unblocks | Critical Path |
|------|-----------|----------|---------------|
| T-070 | `[T-011, T-023]` | Timeouts, rebuild | ❌ |
| T-071 | `[T-070, T-043]` | Intro timeout | ❌ |
| T-072 | `[T-070, T-047]` | Outcome timeout | ❌ |
| T-073 | `[T-070, T-023, T-022]` | Recovery | ❌ |

---

### H) TESTS

| Task | Depends On | Unblocks | Critical Path |
|------|-----------|----------|---------------|
| T-080 | `[T-030, T-031, T-032, T-033]` | Confidence | ✅ |
| T-081 | `[T-041.5]` | Transition safety | ✅ |
| T-082a | `[T-041, T-042]` | T-082b | ✅ |
| T-082b | `[T-082a, T-043, T-044, T-045, T-047, T-048, T-051]` | Acceptance | ✅ |
| T-083 | `[T-017, T-041]` | Reliability | ✅ |
| T-084 | `[T-049, T-050]` | Arbitration validity | ❌ |
| T-085a | `[T-082b]` | Validation pack | ✅ |
| T-085b | `[T-085a, T-052]` | Non-linear proof | ✅ |
| T-085c | `[T-085a, T-050]` | Dispute proof | ❌ |

---

## 26.3 TOPOLOGICAL EXECUTION ORDER (RECOMMENDED)

### Wave 0 — Boot (Must Be First)

**Sequential:**


T-001 → T-002 → T-004 → T-003 → T-005


---

### Wave 1 — DB + Logs Baseline (Parallel Tracks)

**Track A (Observability):**


T-010 → T-011 → T-012 → T-013 → T-014


**Track B (Database):**


T-020 → T-023 → T-022 → T-025 → T-028 → T-024


---

### Wave 2 — Crypto Integrity (Must Precede Core Writes)

**Sequential:**


T-030 → T-031 → T-033 → T-032 → (optional) T-034


---

### Wave 3 — Idempotency + Auth (Enables Safe Writes)

**Sequential:**


T-017 → T-040 → T-040.5


---

### Wave 4 — Happy-Path Commands (Critical Build Spine)

**Sequential (Critical Path):**


T-041 → T-041.5 → T-042 → T-043 → T-044 → T-045 → T-047 → T-048.5 → T-048 → T-051 → T-052


---

### Wave 5 — Read APIs + Jobs (Parallel)

**Track A (Reads):**


T-060 → T-061 → T-063 → (admin) T-062


**Track B (Jobs):**


T-070 → T-071 → T-072 → T-073


---

### Wave 6 — Tests + Acceptance Pack (Prove It Works)

**Sequential:**


T-080 → T-081 → T-082a → T-082b → T-083 → T-085a → T-085b


**Then (Dispute Path):**


T-049 → T-050 → T-084 → T-085c


---

## 26.4 CRITICAL PATH (DO NOT SLIP)

**Critical Path Tasks (26 tasks total):**



T-001 → T-003 → T-005 → T-020 → T-023 → T-022 → T-030 → T-031 → T-032 → T-017 → T-040 → T-041 → T-041.5 → T-042 → T-043 → T-044 → T-045 → T-047 → T-048.5 → T-048 → T-051 → T-052 → T-082b → T-085a → T-085b


**Critical Path Characteristics:**
- **Total Tasks:** 26 out of 53 (49%)
- **Estimated Time:** 26-52 hours (13-26 work sessions)
- **Includes:** Boot → DB → Crypto → Auth → Happy Path → Tests
- **Excludes:** Disputes, read APIs, background jobs (can be parallel or deferred)

**If any critical path task slips, the entire v1 delivery slips.**

---

## 26.5 STEP 26 COMPLETION CRITERIA (PASS/FAIL)

### ✅ PASS IF:

- ✅ Every Step 25 task has `depends_on` specified (or explicitly `[]`)
- ✅ Critical path is identified and matches happy path + trust invariants
- ✅ Order prevents architectural violations:
  - ❌ API before architecture
  - ❌ Writes before hash chain
  - ❌ Verification before intro confirmation
  - ❌ Disputes without rules

### ❌ FAIL IF:

Any of these can happen due to ordering:
- ❌ Event append without hash chain
- ❌ Write endpoints before idempotency storage
- ❌ Dispute resolution before `arbitration_rules` table exists
- ❌ State transitions without centralized validator

---

## 26.6 DEPENDENCY VIOLATIONS PREVENTED

| Violation | Prevention Mechanism | Evidence |
|-----------|---------------------|----------|
| Write before hash chain | T-032 before T-041 | T-041 depends on T-032 |
| Write before idempotency | T-017 before T-041 | T-041 depends on T-017 |
| Transitions without validator | T-041.5 before T-042 | T-042 depends on T-041.5 |
| Disputes without rules | T-028 before T-050 | T-050 depends on T-028 |
| Evidence without storage | T-048.5 before T-048 | T-048 depends on T-048.5 |
| Verification without intro | T-045 before T-048 | T-048 depends on T-045 |

---

## 26.7 PARALLELIZATION OPPORTUNITIES

**2-Person Team Parallel Work:**

| Wave | Person A | Person B | Duration |
|------|----------|----------|----------|
| Wave 1 | T-010→T-014 (5 tasks) | T-020→T-024 (5 tasks) | 5-10 hours |
| Wave 5 | T-060→T-063 (4 tasks) | T-070→T-073 (4 tasks) | 4-8 hours |

**Solo Developer Sequential Work:**
- Waves 0, 2, 3, 4, 6 must be sequential
- Total solo time: ~40-50 hours for critical path

---

## 26.8 VALIDATION CHECKLIST

| Criterion | Status | Evidence |
|-----------|--------|----------|
| All 53 tasks have dependencies | ✅ | Every task listed above |
| Critical path identified | ✅ | Section 26.4 |
| No circular dependencies | ✅ | DAG structure verified |
| Boot before everything | ✅ | T-001 has no dependencies |
| DB before writes | ✅ | T-020 before T-041 |
| Crypto before events | ✅ | T-032 before T-041 |
| Auth before commands | ✅ | T-040 before T-041 |
| Tests after implementation | ✅ | T-082b depends on T-051 |
| Disputes not on critical path | ✅ | T-049, T-050 marked CP ❌ |

---

## NEXT STEP AUTHORIZATION

**Step 26 Status:** ✅ COMPLETE & LOCKED

**Authorization:** Dependency graph is frozen and ready for blocker analysis

**Next Step:** Step 27 — Identify Blockers

**Instruction:** Say **"GO — Step 27"** to list explicit blockers (technical, product, infra, security, human process) and mark which are must-resolve vs can-defer

---

## METADATA

**Created By:** Project Owner (Rehan)  
**Reviewed By:** Verified against Steps 18-23 architectural constraints  
**Dependencies:** Step 25 (Atomic Task List)  
**Referenced By:** Step 27 (Blockers), Step 30 (Validation), Step 31 (Plan Lock)

**STEP 26 STATUS:** ✅ COMPLETE & LOCKED

---

**END OF STEP 26**