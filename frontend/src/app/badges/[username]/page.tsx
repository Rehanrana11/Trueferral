"use client";

import { use } from "react";

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
  yellow: "#ffd166",
  yellowGlow: "#ffd16622",
  purple: "#c084fc",
  purpleGlow: "#c084fc22",
  orange: "#fb923c",
  orangeGlow: "#fb923c22",
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

  .bg-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px 80px;
    position: relative;
    overflow: hidden;
  }
  .bg-page::before {
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
  .bg-page::after {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.025;
    background-image: radial-gradient(${COLORS.muted} 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  .bg-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
  }

  /* ── Topbar ── */
  .bg-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .bg-wordmark {
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

  /* ── Identity strip ── */
  .identity-strip {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    padding: 18px 20px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .identity-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${COLORS.accent}44, #9b5de544);
    border: 1px solid ${COLORS.accent}33;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 800;
    color: ${COLORS.accent};
    flex-shrink: 0;
  }
  .identity-info { flex: 1; }
  .identity-name { font-size: 16px; font-weight: 800; letter-spacing: -0.3px; }
  .identity-role { font-size: 12px; color: ${COLORS.muted}; margin-top: 2px; }
  .identity-count {
    font-size: 13px;
    font-weight: 700;
    color: ${COLORS.accent};
    font-family: 'DM Mono', monospace;
    flex-shrink: 0;
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
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${COLORS.muted};
  }
  .section-sub {
    font-size: 11px;
    color: ${COLORS.muted};
    font-family: 'DM Mono', monospace;
  }

  /* ── Badge grid ── */
  .badge-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }

  .badge-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    padding: 18px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.15s;
  }
  .badge-card:hover { border-color: ${COLORS.subtle}; }
  .badge-card.locked {
    opacity: 0.5;
  }
  .badge-card.locked::after {
    content: '🔒';
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 12px;
  }

  /* glow accent per tier */
  .badge-card.tier-bronze::before { content: ''; position: absolute; top: -30px; right: -30px; width: 80px; height: 80px; border-radius: 50%; background: ${COLORS.orangeGlow}; pointer-events: none; }
  .badge-card.tier-silver::before { content: ''; position: absolute; top: -30px; right: -30px; width: 80px; height: 80px; border-radius: 50%; background: #94a3b822; pointer-events: none; }
  .badge-card.tier-gold::before   { content: ''; position: absolute; top: -30px; right: -30px; width: 80px; height: 80px; border-radius: 50%; background: ${COLORS.yellowGlow}; pointer-events: none; }
  .badge-card.tier-diamond::before { content: ''; position: absolute; top: -30px; right: -30px; width: 80px; height: 80px; border-radius: 50%; background: ${COLORS.purpleGlow}; pointer-events: none; }

  .badge-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  .badge-icon-wrap.tier-bronze  { background: ${COLORS.orangeGlow};  border: 1px solid ${COLORS.orange}44; }
  .badge-icon-wrap.tier-silver  { background: #94a3b822; border: 1px solid #94a3b844; }
  .badge-icon-wrap.tier-gold    { background: ${COLORS.yellowGlow};  border: 1px solid ${COLORS.yellow}44; }
  .badge-icon-wrap.tier-diamond { background: ${COLORS.purpleGlow};  border: 1px solid ${COLORS.purple}44; }

  .badge-body { position: relative; z-index: 1; }
  .badge-name {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -0.2px;
    margin-bottom: 3px;
    line-height: 1.2;
  }
  .badge-desc {
    font-size: 11px;
    color: ${COLORS.muted};
    line-height: 1.4;
    margin-bottom: 6px;
  }

  .badge-tier-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    border-radius: 4px;
    padding: 2px 7px;
  }
  .pill-bronze  { background: ${COLORS.orangeGlow}; color: ${COLORS.orange}; border: 1px solid ${COLORS.orange}33; }
  .pill-silver  { background: #94a3b822; color: #94a3b8; border: 1px solid #94a3b833; }
  .pill-gold    { background: ${COLORS.yellowGlow}; color: ${COLORS.yellow}; border: 1px solid ${COLORS.yellow}33; }
  .pill-diamond { background: ${COLORS.purpleGlow}; color: ${COLORS.purple}; border: 1px solid ${COLORS.purple}33; }

  .badge-earned-at {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    color: ${COLORS.muted};
    margin-top: 4px;
  }

  /* progress toward next badge */
  .badge-progress-wrap { margin-top: 4px; }
  .badge-progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: ${COLORS.muted};
    margin-bottom: 4px;
    font-family: 'DM Mono', monospace;
  }
  .badge-progress-track {
    height: 4px;
    background: ${COLORS.surface};
    border-radius: 2px;
    overflow: hidden;
    border: 1px solid ${COLORS.border};
  }
  .badge-progress-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.4s ease;
  }
  .fill-bronze  { background: ${COLORS.orange}; }
  .fill-silver  { background: #94a3b8; }
  .fill-gold    { background: ${COLORS.yellow}; }
  .fill-diamond { background: ${COLORS.purple}; }

  /* ── Rule block ── */
  .rule-block {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    padding: 18px 20px;
    margin-bottom: 12px;
  }
  .rule-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 12px;
  }
  .rule-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 9px;
  }
  .rule-row:last-child { margin-bottom: 0; }
  .rule-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${COLORS.accent};
    flex-shrink: 0;
    margin-top: 5px;
  }
  .rule-text {
    font-size: 12px;
    color: ${COLORS.muted};
    line-height: 1.5;
  }
  .rule-text strong { color: ${COLORS.text}; font-weight: 600; }

  @media (max-width: 420px) {
    .badge-grid { grid-template-columns: 1fr; }
  }
`;

// ── Badge definitions ─────────────────────────────────────────────────────────
type Tier = "bronze" | "silver" | "gold" | "diamond";

interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  tier: Tier;
  description: string;
  earnedBy: string; // what event triggers it
  threshold: number; // number of qualifying events
}

const BADGE_DEFS: BadgeDef[] = [
  { id: "first_intro",    name: "First Introduction",   icon: "◈", tier: "bronze",  description: "Made your first verified introduction",            earnedBy: "OutcomeVerifiedSuccess",  threshold: 1  },
  { id: "triple_crown",   name: "Triple Crown",          icon: "★", tier: "silver",  description: "3 verified successful introductions",             earnedBy: "OutcomeVerifiedSuccess",  threshold: 3  },
  { id: "trust_builder",  name: "Trust Builder",         icon: "⬡", tier: "silver",  description: "5 introductions confirmed by both parties",        earnedBy: "IntroConfirmed",          threshold: 5  },
  { id: "closer",         name: "The Closer",            icon: "◎", tier: "gold",    description: "10 verified successful introductions",             earnedBy: "OutcomeVerifiedSuccess",  threshold: 10 },
  { id: "network_anchor", name: "Network Anchor",        icon: "▲", tier: "gold",    description: "Zero disputed introductions across 5+ verified",   earnedBy: "OutcomeVerifiedSuccess",  threshold: 5  },
  { id: "rainmaker",      name: "Rainmaker",             icon: "◆", tier: "diamond", description: "25 verified successful introductions",             earnedBy: "OutcomeVerifiedSuccess",  threshold: 25 },
];

interface UserBadge {
  badge_id: string;
  earned_at: string;
  qualifying_events: number;
}

interface UserData {
  name: string;
  initials: string;
  role: string;
  earned: UserBadge[];
  progress: Record<string, number>; // badge_id → current count
}

function getMockData(username: string): UserData {
  if (username === "new" || username === "empty") {
    return {
      name: "Your Account",
      initials: "?",
      role: "No verified introductions yet",
      earned: [],
      progress: {},
    };
  }
  return {
    name: "Sarah Chen",
    initials: "SC",
    role: "Partner at Sequoia Capital",
    earned: [
      { badge_id: "first_intro",   earned_at: "Feb 20, 2026", qualifying_events: 1 },
      { badge_id: "triple_crown",  earned_at: "Mar 1, 2026",  qualifying_events: 3 },
      { badge_id: "trust_builder", earned_at: "Mar 3, 2026",  qualifying_events: 5 },
    ],
    progress: {
      closer:         3,   // needs 10
      network_anchor: 3,   // needs 5
      rainmaker:      3,   // needs 25
    },
  };
}

function tierPillClass(tier: Tier): string {
  return `badge-tier-pill pill-${tier}`;
}

function tierLabel(tier: Tier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

// ── Component ─────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ username: string }>;
}

export default function BadgeSystemPage({ params }: PageProps) {
  const { username } = use(params);
  const data = getMockData(username);

  const earnedIds = new Set(data.earned.map(e => e.badge_id));
  const earnedBadges = BADGE_DEFS.filter(b => earnedIds.has(b.id));
  const lockedBadges = BADGE_DEFS.filter(b => !earnedIds.has(b.id));

  return (
    <>
      <style>{styles}</style>
      <main className="bg-page">
        <div className="bg-shell">

          {/* Topbar */}
          <div className="bg-topbar">
            <div className="bg-wordmark">
              <div className="wordmark-mark">TF</div>
              <div className="wordmark-text">True<span>ferral</span></div>
            </div>
          </div>

          {/* Identity strip */}
          <div className="identity-strip">
            <div className="identity-avatar">{data.initials}</div>
            <div className="identity-info">
              <div className="identity-name">{data.name}</div>
              <div className="identity-role">{data.role}</div>
            </div>
            <div className="identity-count">
              {earnedBadges.length}/{BADGE_DEFS.length} badges
            </div>
          </div>

          {/* Earned badges */}
          {earnedBadges.length > 0 && (
            <>
              <div className="section-header">
                <span className="section-title">Earned</span>
                <span className="section-sub">{earnedBadges.length} badge{earnedBadges.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="badge-grid" style={{ marginBottom: 20 }}>
                {earnedBadges.map(badge => {
                  const userBadge = data.earned.find(e => e.badge_id === badge.id)!;
                  return (
                    <div key={badge.id} className={`badge-card tier-${badge.tier}`}>
                      <div className={`badge-icon-wrap tier-${badge.tier}`}>
                        <span>{badge.icon}</span>
                      </div>
                      <div className="badge-body">
                        <div className="badge-name">{badge.name}</div>
                        <div className="badge-desc">{badge.description}</div>
                        <div className={tierPillClass(badge.tier)}>{tierLabel(badge.tier)}</div>
                        <div className="badge-earned-at">Earned {userBadge.earned_at}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Locked badges with progress */}
          {lockedBadges.length > 0 && earnedBadges.length > 0 && (
            <>
              <div className="section-header">
                <span className="section-title">In progress</span>
                <span className="section-sub">{lockedBadges.length} remaining</span>
              </div>
              <div className="badge-grid" style={{ marginBottom: 20 }}>
                {lockedBadges.map(badge => {
                  const current = data.progress[badge.id] ?? 0;
                  const pct = Math.min(100, Math.round((current / badge.threshold) * 100));
                  return (
                    <div key={badge.id} className={`badge-card tier-${badge.tier} locked`}>
                      <div className={`badge-icon-wrap tier-${badge.tier}`}>
                        <span>{badge.icon}</span>
                      </div>
                      <div className="badge-body">
                        <div className="badge-name">{badge.name}</div>
                        <div className="badge-desc">{badge.description}</div>
                        <div className={tierPillClass(badge.tier)}>{tierLabel(badge.tier)}</div>
                        <div className="badge-progress-wrap">
                          <div className="badge-progress-label">
                            <span>{current}/{badge.threshold} {badge.earnedBy === "IntroConfirmed" ? "confirmed" : "verified"}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="badge-progress-track">
                            <div
                              className={`badge-progress-fill fill-${badge.tier}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Empty state */}
          {earnedBadges.length === 0 && (
            <div style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 14,
              padding: "40px 24px",
              textAlign: "center",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>◈</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>No badges yet</div>
              <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>
                Badges are earned through verified introductions only — never for logging in or filling out profiles. Make your first verified introduction to unlock <strong style={{ color: COLORS.text }}>First Introduction</strong>.
              </div>
            </div>
          )}

          {/* Earning rules */}
          <div className="rule-block">
            <div className="rule-title">How badges are earned</div>
            <div className="rule-row">
              <div className="rule-dot" />
              <div className="rule-text"><strong>Event-only</strong> — every badge is triggered by a verified domain event, never by activity or logins</div>
            </div>
            <div className="rule-row">
              <div className="rule-dot" />
              <div className="rule-text"><strong>Cannot be bought</strong> — no paid tiers, no shortcuts, no exceptions</div>
            </div>
            <div className="rule-row">
              <div className="rule-dot" />
              <div className="rule-text"><strong>Cannot be revoked</strong> — once earned from a verified outcome, the badge is permanent</div>
            </div>
            <div className="rule-row">
              <div className="rule-dot" />
              <div className="rule-text"><strong>Derived from Trust Passport</strong> — badge state is a read-only projection of your reputation data</div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
