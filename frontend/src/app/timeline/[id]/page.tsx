"use client";

import { useState, use } from "react";

// ── Design System ─────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#0a0a0f",
  surface: "#111118",
  card: "#16161f",
  border: "#1e1e2e",
  accent: "#6c6cff",
  accentGlow: "#6c6cff33",
  green: "#00e5a0",
  greenGlow: "#00e5a022",
  red: "#ff4d6a",
  redGlow: "#ff4d6a22",
  yellow: "#ffd166",
  yellowGlow: "#ffd16622",
  purple: "#c084fc",
  purpleGlow: "#c084fc22",
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

  .tl-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px 80px;
    position: relative;
    overflow: hidden;
  }
  .tl-page::before {
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
  .tl-page::after {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.025;
    background-image: radial-gradient(${COLORS.muted} 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  .tl-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 560px;
    display: flex;
    flex-direction: column;
  }

  /* ── Topbar ── */
  .tl-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .tl-wordmark {
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

  /* ── Filter bar ── */
  .filter-bar {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .filter-btn {
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid ${COLORS.border};
    background: ${COLORS.surface};
    color: ${COLORS.muted};
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    min-height: 32px;
    letter-spacing: 0.3px;
  }
  .filter-btn:hover { color: ${COLORS.text}; border-color: ${COLORS.subtle}; }
  .filter-btn.active {
    background: ${COLORS.accentGlow};
    border-color: ${COLORS.accent}44;
    color: ${COLORS.accent};
  }

  /* ── Snapshot header ── */
  .snapshot-header {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .snapshot-header-left { flex: 1; min-width: 0; }
  .snapshot-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 5px;
  }
  .snapshot-name {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.3px;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .snapshot-meta {
    font-size: 12px;
    color: ${COLORS.muted};
    font-family: 'DM Mono', monospace;
  }
  .snapshot-state-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 7px;
    font-size: 11px;
    font-weight: 700;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  }
  .badge-success {
    background: ${COLORS.greenGlow};
    border: 1px solid ${COLORS.green}44;
    color: ${COLORS.green};
  }
  .badge-active {
    background: ${COLORS.accentGlow};
    border: 1px solid ${COLORS.accent}44;
    color: ${COLORS.accent};
  }

  /* ── Timeline ── */
  .timeline-section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 12px;
    padding: 0 2px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .timeline-count {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0;
    text-transform: none;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* vertical line */
  .timeline::before {
    content: '';
    position: absolute;
    left: 19px;
    top: 20px;
    bottom: 20px;
    width: 1px;
    background: linear-gradient(to bottom, ${COLORS.border}, ${COLORS.border}00);
  }

  .tl-event {
    display: flex;
    gap: 14px;
    margin-bottom: 4px;
    position: relative;
  }
  .tl-event:last-child { margin-bottom: 0; }

  /* icon column */
  .tl-event-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    margin-top: 8px;
  }

  /* body */
  .tl-event-body {
    flex: 1;
    min-width: 0;
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 8px;
    transition: border-color 0.15s;
  }
  .tl-event-body:hover { border-color: ${COLORS.subtle}; }

  .tl-event-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
  }
  .tl-event-type {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.1px;
  }
  .tl-event-seq {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    color: ${COLORS.muted};
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 4px;
    padding: 2px 6px;
    flex-shrink: 0;
  }
  .tl-event-desc {
    font-size: 12px;
    color: ${COLORS.muted};
    line-height: 1.5;
    margin-bottom: 8px;
  }
  .tl-event-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .tl-meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    color: ${COLORS.muted};
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 4px;
    padding: 2px 7px;
  }
  .tl-meta-chip.actor { color: ${COLORS.accent}; border-color: ${COLORS.accent}22; background: ${COLORS.accentGlow}; }
  .tl-meta-chip.hash { color: ${COLORS.muted}; font-size: 9px; }

  /* ── Event icon color themes ── */
  .icon-created    { background: ${COLORS.accentGlow};  border: 1px solid ${COLORS.accent}44; }
  .icon-frozen     { background: ${COLORS.accentGlow};  border: 1px solid ${COLORS.accent}44; }
  .icon-token      { background: ${COLORS.accentGlow};  border: 1px solid ${COLORS.accent}44; }
  .icon-claimed    { background: ${COLORS.yellowGlow};  border: 1px solid ${COLORS.yellow}44; }
  .icon-confirmed  { background: ${COLORS.greenGlow};   border: 1px solid ${COLORS.green}44; }
  .icon-submitted  { background: ${COLORS.yellowGlow};  border: 1px solid ${COLORS.yellow}44; }
  .icon-success    { background: ${COLORS.greenGlow};   border: 1px solid ${COLORS.green}44; }
  .icon-fail       { background: ${COLORS.redGlow};     border: 1px solid ${COLORS.red}44; }
  .icon-dispute    { background: ${COLORS.redGlow};     border: 1px solid ${COLORS.red}44; }
  .icon-resolved   { background: ${COLORS.greenGlow};   border: 1px solid ${COLORS.green}44; }
  .icon-reputation { background: ${COLORS.purpleGlow};  border: 1px solid ${COLORS.purple}44; }
  .icon-capacity   { background: ${COLORS.purpleGlow};  border: 1px solid ${COLORS.purple}44; }
  .icon-admin      { background: ${COLORS.subtle};      border: 1px solid ${COLORS.border}; }

  /* type label colors */
  .type-created    { color: ${COLORS.accent}; }
  .type-frozen     { color: ${COLORS.accent}; }
  .type-token      { color: ${COLORS.accent}; }
  .type-claimed    { color: ${COLORS.yellow}; }
  .type-confirmed  { color: ${COLORS.green}; }
  .type-submitted  { color: ${COLORS.yellow}; }
  .type-success    { color: ${COLORS.green}; }
  .type-fail       { color: ${COLORS.red}; }
  .type-dispute    { color: ${COLORS.red}; }
  .type-resolved   { color: ${COLORS.green}; }
  .type-reputation { color: ${COLORS.purple}; }
  .type-capacity   { color: ${COLORS.purple}; }
  .type-admin      { color: ${COLORS.muted}; }

  /* ── Hash chain indicator ── */
  .hash-chain-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    margin-top: 8px;
    font-size: 12px;
    color: ${COLORS.muted};
    border-top: 1px solid ${COLORS.border};
  }
  .hash-chain-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${COLORS.green};
    box-shadow: 0 0 6px ${COLORS.green};
  }

  @media (max-width: 480px) {
    .tl-event-body { padding: 12px; }
    .snapshot-header { padding: 16px; }
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────
type EventType =
  | "SnapshotCreated"
  | "SnapshotFrozen"
  | "TokenIssued"
  | "IntroClaimed"
  | "IntroConfirmed"
  | "OutcomeSubmitted"
  | "OutcomeVerifiedSuccess"
  | "OutcomeVerifiedFail"
  | "DisputeOpened"
  | "DisputeResolved"
  | "ReputationAdjusted"
  | "CapacityAdjusted"
  | "AdminAction";

type FilterType = "all" | "system" | "verification" | "outcome" | "reputation";

interface TLEvent {
  seq: number;
  event_type: EventType;
  actor: string;
  actor_role: string;
  description: string;
  timestamp: string;
  hash: string;
}

interface SnapshotMeta {
  snapshot_id: string;
  counterparty: string;
  introducer: string;
  final_state: string;
  event_count: number;
}

// ── Event config ─────────────────────────────────────────────────────────────
const EVENT_CONFIG: Record<EventType, {
  icon: string;
  iconClass: string;
  typeClass: string;
  filterCategory: FilterType;
}> = {
  SnapshotCreated:        { icon: "◈", iconClass: "icon-created",    typeClass: "type-created",    filterCategory: "system" },
  SnapshotFrozen:         { icon: "⬡", iconClass: "icon-frozen",     typeClass: "type-frozen",     filterCategory: "system" },
  TokenIssued:            { icon: "⟐", iconClass: "icon-token",      typeClass: "type-token",      filterCategory: "system" },
  IntroClaimed:           { icon: "↗", iconClass: "icon-claimed",    typeClass: "type-claimed",    filterCategory: "verification" },
  IntroConfirmed:         { icon: "✓", iconClass: "icon-confirmed",  typeClass: "type-confirmed",  filterCategory: "verification" },
  OutcomeSubmitted:       { icon: "⊕", iconClass: "icon-submitted",  typeClass: "type-submitted",  filterCategory: "outcome" },
  OutcomeVerifiedSuccess: { icon: "★", iconClass: "icon-success",    typeClass: "type-success",    filterCategory: "outcome" },
  OutcomeVerifiedFail:    { icon: "✕", iconClass: "icon-fail",       typeClass: "type-fail",       filterCategory: "outcome" },
  DisputeOpened:          { icon: "⚡", iconClass: "icon-dispute",   typeClass: "type-dispute",    filterCategory: "outcome" },
  DisputeResolved:        { icon: "◎", iconClass: "icon-resolved",   typeClass: "type-resolved",   filterCategory: "outcome" },
  ReputationAdjusted:     { icon: "▲", iconClass: "icon-reputation", typeClass: "type-reputation", filterCategory: "reputation" },
  CapacityAdjusted:       { icon: "◆", iconClass: "icon-capacity",   typeClass: "type-capacity",   filterCategory: "reputation" },
  AdminAction:            { icon: "⊞", iconClass: "icon-admin",      typeClass: "type-admin",      filterCategory: "system" },
};

function shortHash(h: string): string {
  return h.length > 16 ? h.slice(0, 8) + "…" + h.slice(-4) : h;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
      timeZoneName: "short",
    });
  } catch { return iso; }
}

// ── Mock data — all 13 event types ───────────────────────────────────────────
function getMockData(id: string): { meta: SnapshotMeta; events: TLEvent[] } {
  const base = new Date("2026-03-01T09:00:00Z").getTime();
  const t = (minOffset: number) => new Date(base + minOffset * 60000).toISOString();

  return {
    meta: {
      snapshot_id: id,
      counterparty: "Alex Johnson, CTO at Acme Corp",
      introducer: "Sarah Chen",
      final_state: "SUCCESS",
      event_count: 13,
    },
    events: [
      {
        seq: 1,
        event_type: "SnapshotCreated",
        actor: "Sarah Chen",
        actor_role: "INTRODUCER",
        description: "Snapshot created with counterparty Alex Johnson. Terms draft initiated.",
        timestamp: t(0),
        hash: "a1b2c3d4e5f6a1b2",
      },
      {
        seq: 2,
        event_type: "SnapshotFrozen",
        actor: "Sarah Chen",
        actor_role: "INTRODUCER",
        description: "Terms locked. Snapshot is now immutable — no edits possible.",
        timestamp: t(7),
        hash: "b2c3d4e5f6a1b2c3",
      },
      {
        seq: 3,
        event_type: "TokenIssued",
        actor: "System",
        actor_role: "SYSTEM",
        description: "One-click confirmation token generated and dispatched to target.",
        timestamp: t(7),
        hash: "c3d4e5f6a1b2c3d4",
      },
      {
        seq: 4,
        event_type: "IntroClaimed",
        actor: "Sarah Chen",
        actor_role: "INTRODUCER",
        description: "Introducer marked introduction as sent to Alex Johnson.",
        timestamp: t(15),
        hash: "d4e5f6a1b2c3d4e5",
      },
      {
        seq: 5,
        event_type: "IntroConfirmed",
        actor: "Alex Johnson",
        actor_role: "TARGET",
        description: "Target confirmed receipt of introduction via one-click link. Independent verification complete.",
        timestamp: t(47),
        hash: "e5f6a1b2c3d4e5f6",
      },
      {
        seq: 6,
        event_type: "OutcomeSubmitted",
        actor: "Sarah Chen",
        actor_role: "INTRODUCER",
        description: "Outcome evidence submitted. Contract PDF attached referencing snapshot.",
        timestamp: t(14480),
        hash: "f6a1b2c3d4e5f6a1",
      },
      {
        seq: 7,
        event_type: "OutcomeVerifiedSuccess",
        actor: "Alex Johnson",
        actor_role: "TARGET",
        description: "Target verified successful outcome. Candidate placed and retained 90 days confirmed.",
        timestamp: t(14560),
        hash: "a1f6b2c3d4e5f6a2",
      },
      {
        seq: 8,
        event_type: "DisputeOpened",
        actor: "Alex Johnson",
        actor_role: "TARGET",
        description: "Dispute opened on fee calculation. Evidence hash: 0xb3c4.",
        timestamp: t(14600),
        hash: "b3c4d5e6f7a2b3c4",
      },
      {
        seq: 9,
        event_type: "DisputeResolved",
        actor: "System",
        actor_role: "SYSTEM",
        description: "Dispute resolved in favour of INTRODUCER per deterministic arbitration rules. Outcome stands.",
        timestamp: t(15000),
        hash: "c4d5e6f7a2b3c4d5",
      },
      {
        seq: 10,
        event_type: "ReputationAdjusted",
        actor: "System",
        actor_role: "SYSTEM",
        description: "Reputation scores updated asymmetrically. Introducer +12 pts. Target +8 pts.",
        timestamp: t(15001),
        hash: "d5e6f7a2b3c4d5e6",
      },
      {
        seq: 11,
        event_type: "CapacityAdjusted",
        actor: "System",
        actor_role: "SYSTEM",
        description: "Trust capacity ledger updated. Introducer capacity +1 slot unlocked.",
        timestamp: t(15001),
        hash: "e6f7a2b3c4d5e6f7",
      },
      {
        seq: 12,
        event_type: "AdminAction",
        actor: "Admin",
        actor_role: "ADMIN",
        description: "Compliance review completed. No issues found. Record certified.",
        timestamp: t(15200),
        hash: "f7a2b3c4d5e6f7a3",
      },
      {
        seq: 13,
        event_type: "OutcomeVerifiedFail",
        actor: "System",
        actor_role: "SYSTEM",
        description: "Archived: prior partial outcome claim rejected — insufficient evidence timestamp.",
        timestamp: t(14450),
        hash: "a3b4c5d6e7f8a3b4",
      },
    ].sort((a, b) => a.seq - b.seq),
  };
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All events" },
  { key: "system", label: "System" },
  { key: "verification", label: "Verification" },
  { key: "outcome", label: "Outcome" },
  { key: "reputation", label: "Reputation" },
];

// ── Component ─────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VerifiedOutlineTimelinePage({ params }: PageProps) {
  const { id } = use(params);
  const { meta, events } = getMockData(id);
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all"
    ? events
    : events.filter(e => EVENT_CONFIG[e.event_type].filterCategory === filter);

  return (
    <>
      <style>{styles}</style>
      <main className="tl-page">
        <div className="tl-shell">

          {/* Topbar */}
          <div className="tl-topbar">
            <div className="tl-wordmark">
              <div className="wordmark-mark">TF</div>
              <div className="wordmark-text">True<span>ferral</span></div>
            </div>
          </div>

          {/* Snapshot header */}
          <div className="snapshot-header">
            <div className="snapshot-header-left">
              <div className="snapshot-label">Verified outcome timeline</div>
              <div className="snapshot-name">{meta.counterparty}</div>
              <div className="snapshot-meta">
                Introduced by {meta.introducer} · {meta.snapshot_id}
              </div>
            </div>
            <div className={`snapshot-state-badge ${meta.final_state === "SUCCESS" ? "badge-success" : "badge-active"}`}>
              {meta.final_state === "SUCCESS" ? "★ " : "⬡ "}{meta.final_state}
            </div>
          </div>

          {/* Filter bar */}
          <div className="filter-bar">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`filter-btn${filter === f.key ? " active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                {f.key === "all" && ` (${events.length})`}
                {f.key !== "all" && ` (${events.filter(e => EVENT_CONFIG[e.event_type].filterCategory === f.key).length})`}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="timeline-section-label">
            <span>Event log</span>
            <span className="timeline-count">{filtered.length} of {events.length} events</span>
          </div>

          <div className="timeline">
            {filtered.map(event => {
              const cfg = EVENT_CONFIG[event.event_type];
              return (
                <div key={event.seq} className="tl-event">
                  <div className={`tl-event-icon ${cfg.iconClass}`}>
                    <span style={{ fontSize: 16, lineHeight: 1 }}>{cfg.icon}</span>
                  </div>
                  <div className="tl-event-body">
                    <div className="tl-event-top">
                      <span className={`tl-event-type ${cfg.typeClass}`}>{event.event_type}</span>
                      <span className="tl-event-seq">seq {event.seq}</span>
                    </div>
                    <div className="tl-event-desc">{event.description}</div>
                    <div className="tl-event-meta">
                      <span className="tl-meta-chip actor">{event.actor} · {event.actor_role}</span>
                      <span className="tl-meta-chip">{formatTime(event.timestamp)}</span>
                      <span className="tl-meta-chip hash">#{shortHash(event.hash)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hash chain footer */}
          <div className="hash-chain-note">
            <div className="hash-chain-dot" />
            <span>All {events.length} events hash-chained · append-only · tamper-evident</span>
          </div>

        </div>
      </main>
    </>
  );
}
