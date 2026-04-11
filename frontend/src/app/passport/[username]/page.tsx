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
  accentHover: "#8484ff",
  green: "#00e5a0",
  greenGlow: "#00e5a022",
  red: "#ff4d6a",
  redGlow: "#ff4d6a22",
  yellow: "#ffd166",
  yellowGlow: "#ffd16622",
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

  .pp-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px 80px;
    position: relative;
    overflow: hidden;
  }
  .pp-page::before {
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
  .pp-page::after {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.025;
    background-image: radial-gradient(${COLORS.muted} 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  .pp-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 560px;
    display: flex;
    flex-direction: column;
  }

  /* ── Topbar ── */
  .pp-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .pp-wordmark {
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
  .pp-share-btn {
    padding: 7px 14px;
    border-radius: 7px;
    border: 1px solid ${COLORS.border};
    background: ${COLORS.surface};
    color: ${COLORS.muted};
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    min-height: 36px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .pp-share-btn:hover { color: ${COLORS.text}; border-color: ${COLORS.subtle}; }

  /* ── Identity card ── */
  .identity-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  .identity-avatar {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: linear-gradient(135deg, ${COLORS.accent}44, #9b5de544);
    border: 1px solid ${COLORS.accent}33;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 800;
    color: ${COLORS.accent};
    flex-shrink: 0;
  }
  .identity-info { flex: 1; min-width: 0; }
  .identity-name {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.4px;
    margin-bottom: 3px;
  }
  .identity-role {
    font-size: 13px;
    color: ${COLORS.muted};
    margin-bottom: 10px;
  }
  .identity-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .identity-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    border-radius: 5px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .badge-verified {
    background: ${COLORS.greenGlow};
    border: 1px solid ${COLORS.green}44;
    color: ${COLORS.green};
  }
  .badge-member {
    background: ${COLORS.accentGlow};
    border: 1px solid ${COLORS.accent}44;
    color: ${COLORS.accent};
  }

  /* ── Stats row ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }
  .stat-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    padding: 16px 14px;
    text-align: center;
  }
  .stat-number {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -1px;
    line-height: 1;
    margin-bottom: 4px;
  }
  .stat-number.green { color: ${COLORS.green}; }
  .stat-number.accent { color: ${COLORS.accent}; }
  .stat-number.yellow { color: ${COLORS.yellow}; }
  .stat-label {
    font-size: 11px;
    color: ${COLORS.muted};
    font-weight: 500;
    line-height: 1.3;
  }

  /* ── Section header ── */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    padding: 0 2px;
  }
  .section-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: ${COLORS.muted};
  }
  .section-count {
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: ${COLORS.muted};
  }

  /* ── Intro cards ── */
  .intro-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }
  .intro-item {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    transition: border-color 0.15s;
    cursor: default;
  }
  .intro-item:hover { border-color: ${COLORS.subtle}; }
  .intro-state-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 5px;
  }
  .dot-success { background: ${COLORS.green}; box-shadow: 0 0 6px ${COLORS.green}; }
  .dot-pending { background: ${COLORS.yellow}; box-shadow: 0 0 6px ${COLORS.yellow}; }
  .dot-confirmed { background: ${COLORS.accent}; box-shadow: 0 0 6px ${COLORS.accent}; }
  .dot-frozen { background: ${COLORS.muted}; }

  .intro-item-body { flex: 1; min-width: 0; }
  .intro-item-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
  }
  .intro-item-name {
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .intro-item-state {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 2px 7px;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .state-success {
    background: ${COLORS.greenGlow};
    color: ${COLORS.green};
    border: 1px solid ${COLORS.green}33;
  }
  .state-pending {
    background: ${COLORS.yellowGlow};
    color: ${COLORS.yellow};
    border: 1px solid ${COLORS.yellow}33;
  }
  .state-confirmed {
    background: ${COLORS.accentGlow};
    color: ${COLORS.accent};
    border: 1px solid ${COLORS.accent}33;
  }
  .state-frozen {
    background: ${COLORS.subtle};
    color: ${COLORS.muted};
    border: 1px solid ${COLORS.border};
  }
  .intro-item-meta {
    font-size: 12px;
    color: ${COLORS.muted};
    margin-bottom: 4px;
  }
  .intro-item-date {
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: ${COLORS.muted};
  }

  /* ── Empty state (D-012) ── */
  .empty-passport {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 48px 28px;
    text-align: center;
    margin-bottom: 16px;
  }
  .empty-icon-wrap {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: ${COLORS.accentGlow};
    border: 1px solid ${COLORS.accent}33;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
  }
  .empty-heading {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.3px;
    margin-bottom: 10px;
  }
  .empty-body {
    font-size: 13px;
    color: ${COLORS.muted};
    line-height: 1.7;
    max-width: 320px;
    margin: 0 auto 24px;
  }
  .empty-body strong { color: ${COLORS.text}; }
  .empty-what-block {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    padding: 16px;
    text-align: left;
    max-width: 380px;
    margin: 0 auto 24px;
  }
  .empty-what-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 10px;
  }
  .empty-what-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 9px;
  }
  .empty-what-row:last-child { margin-bottom: 0; }
  .empty-what-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${COLORS.accent};
    flex-shrink: 0;
    margin-top: 5px;
  }
  .empty-what-text {
    font-size: 12px;
    color: ${COLORS.muted};
    line-height: 1.5;
  }
  .empty-what-text strong { color: ${COLORS.text}; font-weight: 600; }
  .btn-start-intro {
    padding: 13px 28px;
    border-radius: 10px;
    border: none;
    background: ${COLORS.accent};
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
    box-shadow: 0 0 20px ${COLORS.accentGlow};
    min-height: 48px;
  }
  .btn-start-intro:hover {
    background: ${COLORS.accentHover};
    transform: translateY(-1px);
    box-shadow: 0 0 32px ${COLORS.accentGlow};
  }
  .btn-start-intro:active { transform: translateY(0); }

  /* ── Trust signal footer ── */
  .trust-signal {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    font-size: 12px;
    color: ${COLORS.muted};
  }
  .trust-signal-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${COLORS.green};
    box-shadow: 0 0 6px ${COLORS.green};
  }

  @media (max-width: 480px) {
    .identity-card { padding: 18px; }
    .stats-row { gap: 8px; }
    .stat-card { padding: 14px 10px; }
    .stat-number { font-size: 24px; }
    .intro-item { padding: 14px; }
  }
`;

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconPassport({ size = 28, color = "#6c6cff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
    </svg>
  );
}
function IconShare({ size = 13, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
function IconPlus({ size = 14, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconCheck({ size = 12, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Types & mock data ─────────────────────────────────────────────────────────
type IntroState = "SUCCESS" | "INTRO_CONFIRMED" | "OUTCOME_PENDING" | "FROZEN";

interface MockIntro {
  id: string;
  counterparty: string;
  role: string;
  state: IntroState;
  note: string;
  date: string;
}

interface PassportData {
  name: string;
  initials: string;
  role: string;
  memberSince: string;
  stats: { successful: number; active: number; pending: number };
  intros: MockIntro[];
}

function getPassportData(username: string): PassportData | null {
  if (username === "new" || username === "empty") return null;
  return {
    name: "Sarah Chen",
    initials: "SC",
    role: "Partner at Sequoia Capital",
    memberSince: "Feb 2026",
    stats: { successful: 3, active: 2, pending: 1 },
    intros: [
      {
        id: "snp_001",
        counterparty: "Alex Johnson",
        role: "CTO at Acme Corp",
        state: "SUCCESS",
        note: "Senior backend engineer placement",
        date: "Feb 28, 2026",
      },
      {
        id: "snp_002",
        counterparty: "Maya Patel",
        role: "Head of Growth at Stripe",
        state: "SUCCESS",
        note: "Series B board advisor introduction",
        date: "Feb 20, 2026",
      },
      {
        id: "snp_003",
        counterparty: "James Liu",
        role: "Founder at Helios AI",
        state: "INTRO_CONFIRMED",
        note: "Strategic partnership exploration",
        date: "Mar 3, 2026",
      },
      {
        id: "snp_004",
        counterparty: "Priya Sharma",
        role: "VP Engineering at Notion",
        state: "OUTCOME_PENDING",
        note: "Engineering leadership hire",
        date: "Mar 5, 2026",
      },
      {
        id: "snp_005",
        counterparty: "David Kim",
        role: "Angel investor",
        state: "FROZEN",
        note: "Seed round investor connection",
        date: "Mar 6, 2026",
      },
    ],
  };
}

function stateLabel(state: IntroState): string {
  switch (state) {
    case "SUCCESS": return "SUCCESS";
    case "INTRO_CONFIRMED": return "CONFIRMED";
    case "OUTCOME_PENDING": return "PENDING";
    case "FROZEN": return "FROZEN";
  }
}

function stateDotClass(state: IntroState): string {
  switch (state) {
    case "SUCCESS": return "intro-state-dot dot-success";
    case "INTRO_CONFIRMED": return "intro-state-dot dot-confirmed";
    case "OUTCOME_PENDING": return "intro-state-dot dot-pending";
    case "FROZEN": return "intro-state-dot dot-frozen";
  }
}

function stateClass(state: IntroState): string {
  switch (state) {
    case "SUCCESS": return "intro-item-state state-success";
    case "INTRO_CONFIRMED": return "intro-item-state state-confirmed";
    case "OUTCOME_PENDING": return "intro-item-state state-pending";
    case "FROZEN": return "intro-item-state state-frozen";
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ username: string }>;
}

export default function TrustPassportPage({ params }: PageProps) {
  const { username } = use(params);
  const data = getPassportData(username);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <style>{styles}</style>
      <main className="pp-page">
        <div className="pp-shell">

          {/* Topbar */}
          <div className="pp-topbar">
            <div className="pp-wordmark">
              <div className="wordmark-mark">TF</div>
              <div className="wordmark-text">True<span>ferral</span></div>
            </div>
            <button className="pp-share-btn" onClick={handleShare}>
              {copied
                ? <><IconCheck size={12} color={COLORS.green} /><span style={{ color: COLORS.green }}>Copied</span></>
                : <><IconShare size={13} /> Share passport</>
              }
            </button>
          </div>

          {/* ── EMPTY STATE (D-012) ── */}
          {!data && (
            <>
              {/* Identity stub */}
              <div className="identity-card" style={{ marginBottom: 16 }}>
                <div className="identity-avatar" style={{ opacity: 0.4, fontSize: 18 }}>?</div>
                <div className="identity-info">
                  <div className="identity-name" style={{ color: COLORS.muted }}>Your Trust Passport</div>
                  <div className="identity-role">Record starts when you make your first introduction</div>
                </div>
              </div>

              {/* Stats — honest zeros */}
              <div className="stats-row" style={{ marginBottom: 16 }}>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: COLORS.muted }}>0</div>
                  <div className="stat-label">Verified<br />introductions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: COLORS.muted }}>0</div>
                  <div className="stat-label">Active<br />intros</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number" style={{ color: COLORS.muted }}>0</div>
                  <div className="stat-label">Pending<br />outcomes</div>
                </div>
              </div>

              {/* Empty invitation — D-012 copy law */}
              <div className="empty-passport">
                <div className="empty-icon-wrap">
                  <IconPassport size={30} color={COLORS.accent} />
                </div>
                <h1 className="empty-heading">Your record starts here</h1>
                <p className="empty-body">
                  Every introduction you make becomes a <strong>verified, permanent entry</strong> in your Trust Passport. Your reputation is built on what actually happened — not what you claimed.
                </p>

                <div className="empty-what-block">
                  <div className="empty-what-title">What gets recorded</div>
                  <div className="empty-what-row">
                    <div className="empty-what-dot" />
                    <div className="empty-what-text"><strong>Who you introduced</strong> — counterparty, context, terms</div>
                  </div>
                  <div className="empty-what-row">
                    <div className="empty-what-dot" />
                    <div className="empty-what-text"><strong>What was confirmed</strong> — independent verification by both sides</div>
                  </div>
                  <div className="empty-what-row">
                    <div className="empty-what-dot" />
                    <div className="empty-what-text"><strong>What happened</strong> — outcome verified, reputation updated</div>
                  </div>
                  <div className="empty-what-row">
                    <div className="empty-what-dot" />
                    <div className="empty-what-text"><strong>All of it immutable</strong> — no edits, no deletions, no disputes about the record</div>
                  </div>
                </div>

                <button className="btn-start-intro">
                  <IconPlus size={14} />
                  Make your first introduction
                </button>
              </div>
            </>
          )}

          {/* ── POPULATED STATE ── */}
          {data && (
            <>
              {/* Identity card */}
              <div className="identity-card">
                <div className="identity-avatar">{data.initials}</div>
                <div className="identity-info">
                  <div className="identity-name">{data.name}</div>
                  <div className="identity-role">{data.role}</div>
                  <div className="identity-badges">
                    <span className="identity-badge badge-verified">
                      <IconCheck size={10} color={COLORS.green} /> Verified introducer
                    </span>
                    <span className="identity-badge badge-member">
                      Member since {data.memberSince}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-number green">{data.stats.successful}</div>
                  <div className="stat-label">Verified<br />successful</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number accent">{data.stats.active}</div>
                  <div className="stat-label">Active<br />intros</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number yellow">{data.stats.pending}</div>
                  <div className="stat-label">Pending<br />outcome</div>
                </div>
              </div>

              {/* Intro list */}
              <div className="section-header">
                <span className="section-title">Introduction record</span>
                <span className="section-count">{data.intros.length} entries</span>
              </div>

              <div className="intro-list">
                {data.intros.map(intro => (
                  <div key={intro.id} className="intro-item">
                    <div className={stateDotClass(intro.state)} />
                    <div className="intro-item-body">
                      <div className="intro-item-top">
                        <span className="intro-item-name">{intro.counterparty}</span>
                        <span className={stateClass(intro.state)}>{stateLabel(intro.state)}</span>
                      </div>
                      <div className="intro-item-meta">{intro.role} · {intro.note}</div>
                      <div className="intro-item-date">{intro.date} · {intro.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Trust signal */}
          <div className="trust-signal">
            <div className="trust-signal-dot" />
            <span>All records are immutable and independently verified</span>
          </div>

        </div>
      </main>
    </>
  );
}
