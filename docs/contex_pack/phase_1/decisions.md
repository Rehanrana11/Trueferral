## Decision Format (Mandatory)

Each decision MUST include:

- Decision ID
- Status
- Date
- Owner
- Context
- Options Considered
- Decision
- Rationale
- Consequences
- Reversal Cost
- Linked Docs (Steps 10–15)

-----

## D-001 — Build Trust Engine Before Growth Engine

- *Status:* ACCEPTED
- *Date:* 2026-01-XX
- *Owner:* Kill Authority

*Context:*  
Networking platforms fail at high-stakes referrals due to lack of enforced truth. Growth without trust corrupts outcomes.

*Options Considered:*

1. Growth-first indicate/match system
1. Hybrid growth + trust from day one
1. Trust engine first (v1), growth later

*Decision:*  
Build Trust Engine only in v1. Growth Engine is explicitly excluded.

*Rationale:*  
Trust primitives must be proven before scale. Mixing engines early destroys both.

*Consequences:*

- Slower early MAU
- Stronger long-term moat
- Clear system identity

*Reversal Cost:* VERY HIGH  
Requires redesign of core data model and acceptance criteria.

*Linked Docs:*  
Step 10 (BRD), Step 13 (Non-Goals), Step 16 (Scope Freeze)

-----

## D-002 — No Messaging or Matching in v1

- *Status:* ACCEPTED
- *Date:* 2026-01-XX
- *Owner:* Kill Authority

*Context:*  
Messaging and matching introduce ambiguity, unobservable actions, and unverifiable execution.

*Options Considered:*

1. Built-in chat + intros
1. Email forwarding
1. No messaging; record execution only

*Decision:*  
Truferral v1 will not send messages or perform matching.

*Rationale:*  
System must observe and verify reality, not mediate conversation.

*Consequences:*

- UX feels austere
- Execution clarity preserved
- Trust invariants protected

*Reversal Cost:* HIGH  
Would require redefining verification and dispute logic.

*Linked Docs:*  
Step 13 (Non-Goals), Step 15 (Happy Path)

-----

## D-003 — Immutable Truth Snapshot as Core Primitive

- *Status:* ACCEPTED
- *Date:* 2026-01-XX
- *Owner:* Kill Authority

*Context:*  
Referrals fail due to mutable memory and social reinterpretation.

*Options Considered:*

1. Editable referral records
1. Versioned mutable records
1. Append-only immutable snapshot

*Decision:*  
All referrals must create an immutable Truth Snapshot before execution.

*Rationale:*  
Freezing reality before action prevents retroactive disputes.

*Consequences:*

- Strong auditability
- No “he said / she said”
- Higher friction upfront

*Reversal Cost:* EXTREME  
Would invalidate entire trust model.

*Linked Docs:*  
Step 11 (FRD), Step 12 (Acceptance Criteria), Step 15 (Happy Path)

-----

## D-004 — Independent Verification Required for Execution

- *Status:* ACCEPTED
- *Date:* 2026-01-XX
- *Owner:* Kill Authority

*Context:*  
Self-reported execution enables collusion and gaming.

*Options Considered:*

1. Introducer self-report
1. Introducer + system heuristic
1. ≥2 independent party confirmation

*Decision:*  
Execution is valid only after confirmation by at least two independent parties.

*Rationale:*  
Trust requires independence, not intent.

*Consequences:*

- Slight delay in execution state
- Strong protection against fraud

*Reversal Cost:* VERY HIGH  
Breaks verification guarantees.

*Linked Docs:*  
Step 15 (Happy Path Revised), Step 12 (AC-D3)

-----

## D-005 — Binary Outcomes Only in v1

- *Status:* ACCEPTED
- *Date:* 2026-01-XX
- *Owner:* Kill Authority

*Context:*  
Partial outcomes introduce subjectivity and dispute explosion.

*Options Considered:*

1. Graded outcomes
1. Weighted success scores
1. Binary success / failure / timeout

*Decision:*  
Outcomes are strictly binary.

*Rationale:*  
Binary truth is enforceable; nuance can come later.

*Consequences:*

- Some nuance lost
- Deterministic enforcement gained

*Reversal Cost:* HIGH  
Would require reworking reputation logic.

*Linked Docs:*  
Step 12 (Acceptance Criteria), Step 13 (Non-Goals)

-----

## D-006 — Asymmetric Reputation Impact

- *Status:* ACCEPTED
- *Date:* 2026-01-XX
- *Owner:* Kill Authority

*Context:*  
Introducers carry more reputational risk than requesters or targets.

*Options Considered:*

1. Equal reputation impact
1. Asymmetric impact by role
1. No reputation system

*Decision:*  
Introducer reputation impact > other parties.

*Rationale:*  
Reflects real-world reputational economics.

*Consequences:*

- Introducers act more carefully
- Signal integrity improves

*Reversal Cost:* HIGH  
Would undermine trust incentives.

*Linked Docs:*  
Step 11 (FRD Revised), Step 15 (Happy Path)

-----

## D-007 — No Monetization in v1

- *Status:* ACCEPTED
- *Date:* 2026-01-XX
- *Owner:* Kill Authority

*Context:*  
Monetization distorts early behavior and incentives.

*Options Considered:*

1. Paid referrals
1. Subscription
1. No monetization in v1

*Decision:*  
v1 contains no payments, escrow, or fees.

*Rationale:*  
Truth must precede money.

*Consequences:*

- No early revenue
- Cleaner signal

*Reversal Cost:* MEDIUM  
Payments can be layered later.

*Linked Docs:*  
Step 10 (BRD), Step 13 (Non-Goals)

-----

## D-008 — Dispute Resolution Is Deterministic

- *Status:* ACCEPTED
- *Date:* 2026-01-XX
- *Owner:* Kill Authority

*Context:*  
Human arbitration invites bias and inconsistency.

*Options Considered:*

1. Manual case-by-case review
1. Community voting
1. Predefined rule-based arbitration

*Decision:*  
All disputes resolve via predefined, immutable rules.

*Rationale:*  
Predictability beats discretion.

*Consequences:*

- Some edge cases feel harsh
- System remains trustworthy

*Reversal Cost:* VERY HIGH  
Would undermine acceptance criteria.

*Linked Docs:*  
Step 12 (Acceptance Criteria), /docs/04_architecture/dispute_arbitration_rules.md

-----

## D-009 — Human Accounts Only in v1

- *Status:* ACCEPTED
- *Date:* 2026-01-XX
- *Owner:* Kill Authority

*Context:*  
AI agents require stable trust primitives first.

*Options Considered:*

1. Humans + agents
1. Agents only
1. Humans only

*Decision:*  
Only human accounts in v1.

*Rationale:*  
Simplifies verification and accountability.

*Consequences:*

- Limits scale
- Improves correctness

*Reversal Cost:* MEDIUM  
Agents can be added post-v1.

*Linked Docs:*  
Step 13 (Non-Goals), Step 16 (Scope Freeze)

-----

## Enforcement Rule

Any proposal that:

- contradicts an ACCEPTED decision, or
- introduces a decision not recorded here

→ is a *scope violation* and must follow the violation protocol in Step 16.

-----

*End of decisions.md*