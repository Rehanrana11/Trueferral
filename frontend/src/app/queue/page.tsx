"use client";

import { useState } from "react";

// ── Design System ─────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#0a0a0f",
  surface: "#111118",
  card: "#16161f",
  border: "#1e1e2e",
  accent: "#6c6cff",
  accentGlow: "#6c6cff33",
  accentHover: "#8484ff",
  green: "#00e5a0",
  greenGlow: "#00e5a022",
  yellow: "#ffd166",
  yellowGlow: "#ffd16622",
  red: "#ff4d6a",
  redGlow: "#ff4d6a22",
  purple: "#c084fc",
  text: "#e8e8f0",
  muted: "#6b6b80",
  subtle: "#2a2a3a",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: ${COLORS.bg};
    color: ${COLORS.text};
    font-family: 'Syne', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .aq-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px 80px;
    position: relative;
    overflow: hidden;
  }
  .aq-page::before {
    content: '';
    position: fixed;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 700px;
    height: 400px;
    background: radial-gradient(ellipse, ${COLORS.accentGlow} 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .aq-page::after {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.025;
    background-image: radial-gradient(${COLORS.muted} 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  .aq-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
  }

  /* ── Topbar ── */
  .aq-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .aq-wordmark {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .wordmark-mark {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, ${COLORS.accent}, #9b5de5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 0 16px ${COLORS.accentGlow};
  }
  .wordmark-text { font-size: 15px; font-weight: 700; letter-spacing: -0.2px; }
  .wordmark-text span { color: ${COLORS.accent}; }
  .aq-badge {
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: ${COLORS.muted};
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 6px;
    padding: 4px 10px;
  }

  /* ── Header card ── */
  .aq-header {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    padding: 20px 20px 18px;
    margin-bottom: 16px;
  }
  .aq-header-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 4px;
  }
  .aq-header-title {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.4px;
    margin-bottom: 6px;
  }
  .aq-header-sub {
    font-size: 13px;
    color: ${COLORS.muted};
    line-height: 1.5;
  }
  .aq-header-sub strong { color: ${COLORS.text}; }

  /* ── Filter tabs ── */
  .filter-tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }
  .filter-tab {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid ${COLORS.border};
    background: ${COLORS.surface};
    color: ${COLORS.muted};
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .filter-tab:hover { border-color: ${COLORS.subtle}; color: ${COLORS.text}; }
  .filter-tab.active {
    background: ${COLORS.accent};
    border-color: ${COLORS.accent};
    color: white;
    box-shadow: 0 0 12px ${COLORS.accentGlow};
  }
  .filter-count {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    background: rgba(255,255,255,0.15);
    border-radius: 8px;
    padding: 1px 5px;
  }
  .filter-tab:not(.active) .filter-count {
    background: ${COLORS.subtle};
    color: ${COLORS.muted};
  }

  /* ── Action item ── */
  .action-item {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    padding: 18px 18px 16px;
    margin-bottom: 10px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.15s;
  }
  .action-item:hover { border-color: ${COLORS.subtle}; }
  .action-item.done {
    opacity: 0.45;
  }
  .action-item.urgency-high::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: ${COLORS.red};
    border-radius: 14px 0 0 14px;
  }
  .action-item.urgency-medium::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: ${COLORS.yellow};
    border-radius: 14px 0 0 14px;
  }
  .action-item.urgency-low::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: ${COLORS.accent};
    border-radius: 14px 0 0 14px;
  }

  .action-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }
  .action-type-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    border-radius: 4px;
    padding: 3px 8px;
    margin-bottom: 6px;
  }
  .pill-confirm  { background: ${COLORS.greenGlow};  color: ${COLORS.green};  border: 1px solid ${COLORS.green}33; }
  .pill-outcome  { background: ${COLORS.yellowGlow}; color: ${COLORS.yellow}; border: 1px solid ${COLORS.yellow}33; }
  .pill-overdue  { background: ${COLORS.redGlow};    color: ${COLORS.red};    border: 1px solid ${COLORS.red}33; }
  .pill-pending  { background: ${COLORS.accentGlow}; color: ${COLORS.accent}; border: 1px solid ${COLORS.accent}33; }

  .action-title {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -0.2px;
    line-height: 1.3;
    margin-bottom: 4px;
  }
  .action-desc {
    font-size: 12px;
    color: ${COLORS.muted};
    line-height: 1.5;
  }
  .action-desc strong { color: ${COLORS.text}; font-weight: 600; }

  .action-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    flex-wrap: wrap;
  }
  .meta-chip {
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: ${COLORS.muted};
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 4px;
    padding: 2px 8px;
  }
  .meta-chip.red    { color: ${COLORS.red};    background: ${COLORS.redGlow};    border-color: ${COLORS.red}22; }
  .meta-chip.yellow { color: ${COLORS.yellow}; background: ${COLORS.yellowGlow}; border-color: ${COLORS.yellow}22; }
  .meta-chip.green  { color: ${COLORS.green};  background: ${COLORS.greenGlow};  border-color: ${COLORS.green}22; }

  .action-cta-row {
    display: flex;
    gap: 8px;
    margin-top: 14px;
  }
  .btn-action-primary {
    flex: 1;
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    background: ${COLORS.accent};
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    min-height: 40px;
  }
  .btn-action-primary:hover { background: ${COLORS.accentHover}; transform: translateY(-1px); }
  .btn-action-dismiss {
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid ${COLORS.border};
    background: ${COLORS.surface};
    color: ${COLORS.muted};
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    min-height: 40px;
  }
  .btn-action-dismiss:hover { color: ${COLORS.text}; border-color: ${COLORS.subtle}; }
  .btn-done {
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid ${COLORS.green}33;
    background: ${COLORS.greenGlow};
    color: ${COLORS.green};
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: default;
    min-height: 40px;
  }

  /* ── Empty state ── */
  .aq-empty {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    padding: 48px 24px;
    text-align: center;
    margin-bottom: 14px;
  }
  .aq-empty-icon { font-size: 36px; margin-bottom: 16px; }
  .aq-empty-title { font-size: 17px; font-weight: 800; margin-bottom: 8px; }
  .aq-empty-desc { font-size: 13px; color: ${COLORS.muted}; line-height: 1.6; }

  /* ── D-011 notice ── */
  .d011-notice {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    padding: 12px 14px;
    margin-top: 4px;
  }
  .d011-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${COLORS.yellow};
    flex-shrink: 0;
    margin-top: 4px;
  }
  .d011-text {
    font-size: 11px;
    color: ${COLORS.muted};
    line-height: 1.6;
    font-family: 'DM Mono', monospace;
  }
  .d011-text strong { color: ${COLORS.yellow}; font-weight: 500; }

  @media (max-width: 480px) {
    .aq-header { padding: 16px; }
    .action-item { padding: 14px; }
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────
type ActionType = "confirm" | "outcome" | "overdue" | "pending";
type Urgency = "high" | "medium" | "low";

interface Action {
  id: string;
  type: ActionType;
  urgency: Urgency;
  title: string;
  description: string;
  relationship: string;
  snapshot_id: string;
  due: string;
  dueColor: "red" | "yellow" | "green" | "default";
  ctaLabel: string;
}

// ── Mock data (D-011 shape — real endpoint wired Sprint 2 close) ──────────────
const MOCK_ACTIONS: Action[] = [
  {
    id: "act_001",
    type: "overdue",
    urgency: "high",
    title: "Outcome overdue — Jordan Lee intro",
    description: "You introduced <strong>Jordan Lee</strong> to <strong>Alex Johnson at Acme</strong>. The 90-day outcome window closed 3 days ago. Both parties need to verify.",
    relationship: "Sarah Chen → Jordan Lee",
    snapshot_id: "snp_001",
    due: "3 days overdue",
    dueColor: "red",
    ctaLabel: "Submit outcome now",
  },
  {
    id: "act_002",
    type: "confirm",
    urgency: "medium",
    title: "Awaiting confirmation — Priya Sharma",
    description: "<strong>Priya Sharma</strong> hasn't confirmed your introduction request yet. The confirmation link was sent 2 days ago.",
    relationship: "You → Priya Sharma",
    snapshot_id: "snp_002",
    due: "Expires in 5 days",
    dueColor: "yellow",
    ctaLabel: "Resend confirmation",
  },
  {
    id: "act_003",
    type: "outcome",
    urgency: "medium",
    title: "Submit outcome — Marcus Webb intro",
    description: "You introduced <strong>Marcus Webb</strong> to <strong>Lightspeed Ventures</strong>. The outcome window closes in 8 days.",
    relationship: "You → Marcus Webb",
    snapshot_id: "snp_003",
    due: "8 days remaining",
    dueColor: "yellow",
    ctaLabel: "Submit outcome",
  },
  {
    id: "act_004",
    type: "pending",
    urgency: "low",
    title: "New intro request — David Kim",
    description: "<strong>David Kim</strong> wants to make an introduction involving you. Review the snapshot before it's frozen.",
    relationship: "David Kim → You",
    snapshot_id: "snp_004",
    due: "Received today",
    dueColor: "green",
    ctaLabel: "Review snapshot",
  },
];

function pillClass(type: ActionType): string {
  const map: Record<ActionType, string> = {
    confirm: "action-type-pill pill-confirm",
    outcome: "action-type-pill pill-outcome",
    overdue: "action-type-pill pill-overdue",
    pending: "action-type-pill pill-pending",
  };
  return map[type];
}
function pillLabel(type: ActionType): string {
  const map: Record<ActionType, string> = {
    confirm: "Awaiting confirmation",
    outcome: "Outcome due",
    overdue: "Overdue",
    pending: "New request",
  };
  return map[type];
}

type FilterKey = "all" | ActionType;

// ── Component ─────────────────────────────────────────────────────────────────
export default function ActionQueuePage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [acted, setActed] = useState<Set<string>>(new Set());

  const visible = MOCK_ACTIONS.filter(a => {
    if (dismissed.has(a.id)) return false;
    if (filter === "all") return true;
    return a.type === filter;
  });

  const counts: Record<FilterKey, number> = {
    all:     MOCK_ACTIONS.filter(a => !dismissed.has(a.id)).length,
    confirm: MOCK_ACTIONS.filter(a => a.type === "confirm" && !dismissed.has(a.id)).length,
    outcome: MOCK_ACTIONS.filter(a => a.type === "outcome" && !dismissed.has(a.id)).length,
    overdue: MOCK_ACTIONS.filter(a => a.type === "overdue" && !dismissed.has(a.id)).length,
    pending: MOCK_ACTIONS.filter(a => a.type === "pending" && !dismissed.has(a.id)).length,
  };

  function handleAct(id: string) {
    setActed(prev => new Set([...prev, id]));
  }
  function handleDismiss(id: string) {
    setDismissed(prev => new Set([...prev, id]));
  }

  return (
    <>
      <style>{styles}</style>
      <main className="aq-page">
        <div className="aq-shell">

          {/* Topbar */}
          <div className="aq-topbar">
            <div className="aq-wordmark">
              <div className="wordmark-mark">TF</div>
              <div className="wordmark-text">True<span>ferral</span></div>
            </div>
            <div className="aq-badge">{counts.all} pending</div>
          </div>

          {/* Header */}
          <div className="aq-header">
            <div className="aq-header-label">Action queue</div>
            <div className="aq-header-title">One thing per relationship</div>
            <div className="aq-header-sub">
              The most important action for each active introduction — <strong>not a to-do list</strong>. Each item is derived from a real event in your Trust Engine.
            </div>
          </div>

          {/* Filter tabs */}
          <div className="filter-tabs">
            {(["all", "overdue", "outcome", "confirm", "pending"] as FilterKey[]).map(f => (
              <button
                key={f}
                className={`filter-tab${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : pillLabel(f as ActionType)}
                {counts[f] > 0 && (
                  <span className="filter-count">{counts[f]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Action items */}
          {visible.length === 0 ? (
            <div className="aq-empty">
              <div className="aq-empty-icon">✓</div>
              <div className="aq-empty-title">All clear</div>
              <div className="aq-empty-desc">
                No pending actions for this filter. Every active introduction is on track.
              </div>
            </div>
          ) : (
            visible.map(action => (
              <div
                key={action.id}
                className={`action-item urgency-${action.urgency}${acted.has(action.id) ? " done" : ""}`}
              >
                <div>
                  <div className={pillClass(action.type)}>{pillLabel(action.type)}</div>
                  <div className="action-title">{action.title}</div>
                  <div
                    className="action-desc"
                    dangerouslySetInnerHTML={{ __html: action.description }}
                  />
                </div>

                <div className="action-meta">
                  <span className={`meta-chip ${action.dueColor === "default" ? "" : action.dueColor}`}>
                    {action.due}
                  </span>
                  <span className="meta-chip">{action.snapshot_id}</span>
                  <span className="meta-chip">{action.relationship}</span>
                </div>

                {acted.has(action.id) ? (
                  <div className="action-cta-row">
                    <button className="btn-done">✓ Done</button>
                  </div>
                ) : (
                  <div className="action-cta-row">
                    <button
                      className="btn-action-primary"
                      onClick={() => handleAct(action.id)}
                    >
                      {action.ctaLabel}
                    </button>
                    <button
                      className="btn-action-dismiss"
                      onClick={() => handleDismiss(action.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* D-011 wiring notice */}
          <div className="d011-notice">
            <div className="d011-dot" />
            <div className="d011-text">
              <strong>D-011 — mock data active.</strong> Real actions will be served by <strong>GET /v1/actions/pending</strong> when the endpoint is wired at Sprint 2 close. Shape is stable — no UI changes needed at wire-up.
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
