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

  .rl-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 32px 16px 64px;
    position: relative;
    overflow: hidden;
  }
  .rl-page::before {
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
  .rl-page::after {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.025;
    background-image: radial-gradient(${COLORS.muted} 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  .rl-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
  }

  /* ── Wordmark ── */
  .rl-wordmark {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
    padding: 0 2px;
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

  /* ── Warning banner ── */
  .lock-warning {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    background: ${COLORS.yellowGlow};
    border: 1px solid ${COLORS.yellow}44;
    border-radius: 10px;
    margin-bottom: 20px;
  }
  .lock-warning-icon {
    font-size: 18px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .lock-warning-text {
    font-size: 13px;
    color: ${COLORS.yellow};
    line-height: 1.5;
    font-weight: 500;
  }
  .lock-warning-text strong { font-weight: 700; }

  /* ── Card ── */
  .rl-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 28px 24px;
    width: 100%;
    margin-bottom: 16px;
  }

  /* ── Section heading ── */
  .section-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${COLORS.accent};
    background: ${COLORS.accentGlow};
    border: 1px solid ${COLORS.accent}33;
    border-radius: 4px;
    padding: 3px 8px;
    margin-bottom: 16px;
  }

  .rl-heading {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1.2;
    margin-bottom: 6px;
  }
  .rl-heading span { color: ${COLORS.accent}; }
  .rl-subheading {
    font-size: 13px;
    color: ${COLORS.muted};
    line-height: 1.6;
    margin-bottom: 24px;
  }

  /* ── Field review rows ── */
  .review-section {
    margin-bottom: 20px;
  }
  .review-section-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid ${COLORS.border};
  }
  .review-field {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid ${COLORS.border}66;
    gap: 16px;
  }
  .review-field:last-child { border-bottom: none; }
  .review-field-label {
    font-size: 12px;
    color: ${COLORS.muted};
    flex-shrink: 0;
    min-width: 120px;
    padding-top: 1px;
  }
  .review-field-value {
    font-size: 13px;
    color: ${COLORS.text};
    font-weight: 500;
    text-align: right;
    word-break: break-word;
  }
  .review-field-value.mono {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
  }
  .review-field-value.accent { color: ${COLORS.accent}; }
  .review-field-value.yellow { color: ${COLORS.yellow}; }
  .review-field-value.green { color: ${COLORS.green}; }

  /* ── Hash preview ── */
  .hash-block {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    padding: 12px 14px;
    margin-top: 8px;
  }
  .hash-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 6px;
  }
  .hash-value {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: ${COLORS.muted};
    word-break: break-all;
    line-height: 1.6;
  }
  .hash-value span { color: ${COLORS.accent}; }

  /* ── What happens next ── */
  .consequences-block {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 20px;
  }
  .consequences-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 12px;
  }
  .consequence-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
  }
  .consequence-row:last-child { margin-bottom: 0; }
  .consequence-bullet {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${COLORS.accentGlow};
    border: 1px solid ${COLORS.accent}44;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .consequence-bullet span {
    font-size: 9px;
    font-weight: 700;
    color: ${COLORS.accent};
  }
  .consequence-text {
    font-size: 12px;
    color: ${COLORS.muted};
    line-height: 1.5;
  }
  .consequence-text strong { color: ${COLORS.text}; font-weight: 600; }

  /* ── CTA area ── */
  .cta-area {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .btn-lock {
    width: 100%;
    padding: 15px 24px;
    border-radius: 10px;
    border: none;
    background: ${COLORS.yellow};
    color: #0a0a0f;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
    min-height: 52px;
    box-shadow: 0 0 28px ${COLORS.yellowGlow};
    letter-spacing: -0.2px;
  }
  .btn-lock:not(:disabled):hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 0 40px ${COLORS.yellowGlow};
  }
  .btn-lock:not(:disabled):active { transform: translateY(0); }
  .btn-lock:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .btn-back {
    width: 100%;
    padding: 12px;
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    background: transparent;
    color: ${COLORS.muted};
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    min-height: 44px;
  }
  .btn-back:hover { color: ${COLORS.text}; border-color: ${COLORS.subtle}; }

  .lock-consent {
    font-size: 11px;
    color: ${COLORS.muted};
    text-align: center;
    line-height: 1.6;
    padding: 0 4px;
  }

  /* ── Spinner ── */
  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(0,0,0,0.25);
    border-top-color: #0a0a0f;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Locked state ── */
  .locked-icon-wrap {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: ${COLORS.yellowGlow};
    border: 1px solid ${COLORS.yellow}44;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    animation: pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes pop-in {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .locked-heading {
    font-size: 22px;
    font-weight: 800;
    text-align: center;
    color: ${COLORS.yellow};
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }
  .locked-body {
    font-size: 13px;
    color: ${COLORS.muted};
    text-align: center;
    line-height: 1.6;
    margin-bottom: 24px;
  }
  .locked-receipt {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 16px;
  }
  .locked-receipt-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 12px;
    padding: 6px 0;
    border-bottom: 1px solid ${COLORS.border}66;
    gap: 12px;
  }
  .locked-receipt-row:last-child { border-bottom: none; }
  .locked-receipt-label { color: ${COLORS.muted}; flex-shrink: 0; }
  .locked-receipt-value {
    font-family: 'DM Mono', monospace;
    color: ${COLORS.text};
    font-weight: 500;
    text-align: right;
    word-break: break-all;
  }
  .locked-state-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: ${COLORS.yellowGlow};
    border: 1px solid ${COLORS.yellow}44;
    border-radius: 6px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 700;
    color: ${COLORS.yellow};
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.5px;
  }
  .next-step-block {
    background: ${COLORS.accentGlow};
    border: 1px solid ${COLORS.accent}33;
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 16px;
    font-size: 13px;
    color: ${COLORS.text};
    line-height: 1.5;
  }
  .next-step-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: ${COLORS.accent};
    margin-bottom: 6px;
  }

  /* ── Error state ── */
  .error-icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #ff4d6a15;
    border: 1px solid ${COLORS.red}44;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  .error-heading {
    font-size: 18px;
    font-weight: 800;
    text-align: center;
    margin-bottom: 8px;
  }
  .error-body {
    font-size: 13px;
    color: ${COLORS.muted};
    text-align: center;
    line-height: 1.6;
    margin-bottom: 20px;
  }
  .btn-retry {
    width: 100%;
    padding: 13px 24px;
    border-radius: 10px;
    border: 1px solid ${COLORS.border};
    background: ${COLORS.surface};
    color: ${COLORS.text};
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    min-height: 44px;
    margin-bottom: 10px;
  }
  .btn-retry:hover { background: ${COLORS.card}; }

  @media (max-width: 480px) {
    .rl-card { padding: 22px 16px; border-radius: 14px; }
    .rl-heading { font-size: 20px; }
    .review-field-label { min-width: 100px; }
  }
`;

// ── Icons ────────────────────────────────────────────────────────────────────
function IconLock({ size = 22, color = "#0a0a0f" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconAlert({ size = 26, color = "#ff4d6a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function IconShield({ size = 28, color = "#ffd166" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// ── Mock data ────────────────────────────────────────────────────────────────
function getMockSnapshot(id: string) {
  return {
    snapshot_id: `snp_${id}`,
    created_at: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    introducer: "You (Sarah Chen)",
    counterparty: "Alex Johnson, CTO at Acme Corp",
    note: "Alex is looking for a senior backend engineer. I've worked with the candidate for 3 years — strong systems thinker, very reliable.",
    state: "FROZEN" as const,
    event_hash_preview: `sha256:3f9c2a...${id.slice(0, 6)}...e8d1`,
    terms: {
      success_condition: "Candidate placed and retained 90 days",
      value_range: "$50,000 – $80,000",
      timeline: "30 days",
      consequence: "Reputation impact recorded on both sides",
    },
  };
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", timeZoneName: "short",
    });
  } catch { return iso; }
}

// ── Types ────────────────────────────────────────────────────────────────────
type UIState = "review" | "locking" | "locked" | "error";

interface PageProps {
  params: Promise<{ id: string }>;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function RiskLockPreviewPage({ params }: PageProps) {
  const { id } = use(params);
  const snapshot = getMockSnapshot(id);

  const [uiState, setUiState] = useState<UIState>("review");
  const [errorMsg, setErrorMsg] = useState("");
  const [lockedAt, setLockedAt] = useState("");

  async function handleLock() {
    setUiState("locking");
    try {
      const res = await fetch(`/v1/snapshots/${id}/freeze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setLockedAt(new Date().toISOString());
        setUiState("locked");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.detail ?? "The snapshot couldn't be frozen. Please try again.");
        setUiState("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setUiState("error");
    }
  }

  const isLocking = uiState === "locking";

  return (
    <>
      <style>{styles}</style>
      <main className="rl-page">
        <div className="rl-shell">

          {/* Wordmark */}
          <div className="rl-wordmark">
            <div className="wordmark-mark">TF</div>
            <div className="wordmark-text">True<span>ferral</span></div>
          </div>

          {/* ── STATE: review / locking ── */}
          {(uiState === "review" || uiState === "locking") && (
            <>
              {/* Warning banner */}
              <div className="lock-warning">
                <div className="lock-warning-icon">⚠️</div>
                <div className="lock-warning-text">
                  <strong>Review carefully before locking.</strong> Once frozen, these terms are permanent and cannot be changed, deleted, or disputed.
                </div>
              </div>

              <div className="rl-card">
                <div className="section-tag">
                  <IconLock size={10} color={COLORS.accent} /> Risk Lock Preview
                </div>
                <h1 className="rl-heading">These terms will be <span>locked forever</span></h1>
                <p className="rl-subheading">
                  Review every field below. After locking, this snapshot becomes an immutable record on both sides.
                </p>

                {/* Introduction details */}
                <div className="review-section">
                  <div className="review-section-title">Introduction details</div>
                  <div className="review-field">
                    <span className="review-field-label">Snapshot ID</span>
                    <span className="review-field-value mono accent">{snapshot.snapshot_id}</span>
                  </div>
                  <div className="review-field">
                    <span className="review-field-label">Created at</span>
                    <span className="review-field-value mono">{formatTime(snapshot.created_at)}</span>
                  </div>
                  <div className="review-field">
                    <span className="review-field-label">Introducer</span>
                    <span className="review-field-value">{snapshot.introducer}</span>
                  </div>
                  <div className="review-field">
                    <span className="review-field-label">Introducing</span>
                    <span className="review-field-value">{snapshot.counterparty}</span>
                  </div>
                  <div className="review-field">
                    <span className="review-field-label">Context</span>
                    <span className="review-field-value" style={{ fontSize: 12, fontStyle: "italic", color: COLORS.muted, maxWidth: 260 }}>{snapshot.note}</span>
                  </div>
                </div>

                {/* Agreed terms */}
                <div className="review-section">
                  <div className="review-section-title">Agreed terms</div>
                  <div className="review-field">
                    <span className="review-field-label">Success condition</span>
                    <span className="review-field-value">{snapshot.terms.success_condition}</span>
                  </div>
                  <div className="review-field">
                    <span className="review-field-label">Value range</span>
                    <span className="review-field-value green">{snapshot.terms.value_range}</span>
                  </div>
                  <div className="review-field">
                    <span className="review-field-label">Timeline</span>
                    <span className="review-field-value yellow">{snapshot.terms.timeline}</span>
                  </div>
                  <div className="review-field">
                    <span className="review-field-label">Consequence</span>
                    <span className="review-field-value" style={{ color: COLORS.red }}>{snapshot.terms.consequence}</span>
                  </div>
                </div>

                {/* Integrity hash preview */}
                <div className="hash-block">
                  <div className="hash-label">Integrity hash (preview)</div>
                  <div className="hash-value">
                    <span>{snapshot.event_hash_preview}</span>
                    <br />
                    <span style={{ fontSize: 10, display: "block", marginTop: 4 }}>Final hash computed at freeze time — cannot be replicated post-lock</span>
                  </div>
                </div>
              </div>

              {/* What locking means */}
              <div className="rl-card" style={{ padding: "20px 24px" }}>
                <div className="consequences-title">What happens when you lock</div>
                <div className="consequences-block" style={{ margin: 0, padding: 0, background: "transparent", border: "none" }}>
                  <div className="consequence-row">
                    <div className="consequence-bullet"><span>1</span></div>
                    <div className="consequence-text"><strong>Snapshot frozen</strong> — state transitions to FROZEN, no edits possible</div>
                  </div>
                  <div className="consequence-row">
                    <div className="consequence-bullet"><span>2</span></div>
                    <div className="consequence-text"><strong>Hash committed</strong> — all fields signed into an append-only event log</div>
                  </div>
                  <div className="consequence-row">
                    <div className="consequence-bullet"><span>3</span></div>
                    <div className="consequence-text"><strong>Confirmation token issued</strong> — one-click link generated for the target</div>
                  </div>
                  <div className="consequence-row">
                    <div className="consequence-bullet"><span>4</span></div>
                    <div className="consequence-text"><strong>Consequence engine armed</strong> — outcome verification and reputation impact now active</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="cta-area">
                <button
                  className="btn-lock"
                  onClick={handleLock}
                  disabled={isLocking}
                >
                  {isLocking
                    ? <><div className="spinner" /> Locking terms…</>
                    : <><IconLock size={18} color="#0a0a0f" /> Lock these terms permanently</>
                  }
                </button>
                <button className="btn-back" disabled={isLocking}>
                  ← Go back and edit
                </button>
                <p className="lock-consent">
                  By locking, you confirm these terms are accurate and you accept the consequence clause. This action cannot be undone.
                </p>
              </div>
            </>
          )}

          {/* ── STATE: locked ── */}
          {uiState === "locked" && (
            <div className="rl-card">
              <div className="locked-icon-wrap">
                <IconShield size={30} color={COLORS.yellow} />
              </div>
              <h1 className="locked-heading">Terms locked</h1>
              <p className="locked-body">
                This snapshot is now immutable. The consequence engine is armed. A confirmation token has been issued for the target.
              </p>

              <div className="locked-receipt">
                <div className="locked-receipt-row">
                  <span className="locked-receipt-label">Snapshot ID</span>
                  <span className="locked-receipt-value">{snapshot.snapshot_id}</span>
                </div>
                <div className="locked-receipt-row">
                  <span className="locked-receipt-label">Locked at</span>
                  <span className="locked-receipt-value">{formatTime(lockedAt)}</span>
                </div>
                <div className="locked-receipt-row">
                  <span className="locked-receipt-label">Introducing</span>
                  <span className="locked-receipt-value" style={{ fontFamily: "Syne" }}>{snapshot.counterparty}</span>
                </div>
                <div className="locked-receipt-row">
                  <span className="locked-receipt-label">State</span>
                  <span className="locked-state-badge">⬡ FROZEN</span>
                </div>
                <div className="locked-receipt-row">
                  <span className="locked-receipt-label">Hash</span>
                  <span className="locked-receipt-value">{snapshot.event_hash_preview}</span>
                </div>
              </div>

              <div className="next-step-block">
                <div className="next-step-label">Next step</div>
                The confirmation request has been sent to {snapshot.counterparty.split(",")[0]}. Once they confirm, the introduction moves to <span style={{ color: COLORS.accent, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>INTRO_CONFIRMED</span>.
              </div>
            </div>
          )}

          {/* ── STATE: error ── */}
          {uiState === "error" && (
            <div className="rl-card">
              <div className="error-icon-wrap">
                <IconAlert size={26} color={COLORS.red} />
              </div>
              <h1 className="error-heading">Lock failed</h1>
              <p className="error-body">
                {errorMsg || "The snapshot couldn't be frozen. No changes were made — your terms are still editable."}
              </p>
              <button className="btn-retry" onClick={handleLock}>
                Try again
              </button>
              <button className="btn-back" onClick={() => setUiState("review")}>
                ← Back to review
              </button>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
