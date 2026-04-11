"use client";

import { useState, useEffect, use } from "react";

// ── Design System (matches existing page.jsx exactly) ──────────────────────
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

  /* ── Page shell ── */
  .confirm-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    position: relative;
    overflow: hidden;
  }

  /* Subtle ambient glow — calm, not urgent */
  .confirm-page::before {
    content: '';
    position: fixed;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(ellipse, ${COLORS.accentGlow} 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* Dot-grid texture */
  .confirm-page::after {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.025;
    background-image: radial-gradient(${COLORS.muted} 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  .confirm-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 440px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* ── Wordmark header ── */
  .confirm-wordmark {
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
  .wordmark-text {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.2px;
  }
  .wordmark-text span { color: ${COLORS.accent}; }

  /* ── Card ── */
  .confirm-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 32px 28px;
    width: 100%;
  }

  /* ── Context block (who's introducing you) ── */
  .context-block {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    margin-bottom: 24px;
  }
  .context-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${COLORS.accent}, #9b5de5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }
  .context-text {
    flex: 1;
    min-width: 0;
  }
  .context-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 3px;
  }
  .context-name {
    font-size: 14px;
    font-weight: 700;
    color: ${COLORS.text};
    margin-bottom: 2px;
  }
  .context-sub {
    font-size: 12px;
    color: ${COLORS.muted};
    font-family: 'DM Mono', monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Main headline ── */
  .confirm-heading {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1.2;
    margin-bottom: 10px;
    color: ${COLORS.text};
  }
  .confirm-heading span { color: ${COLORS.accent}; }

  .confirm-body {
    font-size: 14px;
    line-height: 1.6;
    color: ${COLORS.muted};
    margin-bottom: 28px;
  }

  /* ── What happens next (D-014 #3: visible next step) ── */
  .next-steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 28px;
  }
  .next-step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 14px;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
  }
  .step-num {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${COLORS.accentGlow};
    border: 1px solid ${COLORS.accent}44;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: ${COLORS.accent};
    flex-shrink: 0;
    margin-top: 1px;
    font-family: 'DM Mono', monospace;
  }
  .step-text {
    font-size: 13px;
    line-height: 1.45;
    color: ${COLORS.text};
  }
  .step-text strong { font-weight: 700; color: ${COLORS.text}; }
  .step-text span { color: ${COLORS.muted}; }

  /* ── Primary confirm button ── */
  .btn-confirm {
    width: 100%;
    padding: 15px 24px;
    border-radius: 10px;
    border: none;
    background: ${COLORS.accent};
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
    min-height: 52px; /* D-014: 44px+ touch target */
    box-shadow: 0 0 24px ${COLORS.accentGlow};
    position: relative;
    overflow: hidden;
  }
  .btn-confirm:not(:disabled):hover {
    background: ${COLORS.accentHover};
    box-shadow: 0 0 36px ${COLORS.accentGlow};
    transform: translateY(-1px);
  }
  .btn-confirm:not(:disabled):active {
    transform: translateY(0);
  }
  .btn-confirm:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  /* ── Consent note (D-014 #10: control and consent) ── */
  .consent-note {
    margin-top: 14px;
    font-size: 12px;
    color: ${COLORS.muted};
    text-align: center;
    line-height: 1.5;
  }
  .consent-note a {
    color: ${COLORS.accent};
    text-decoration: none;
    cursor: pointer;
  }

  /* ── Loading spinner ── */
  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Success state ── */
  .success-icon-wrap {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: ${COLORS.greenGlow};
    border: 1px solid ${COLORS.green}44;
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
  .success-heading {
    font-size: 20px;
    font-weight: 800;
    text-align: center;
    color: ${COLORS.green};
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }
  .success-body {
    font-size: 13px;
    color: ${COLORS.muted};
    text-align: center;
    line-height: 1.6;
    margin-bottom: 20px;
  }
  .success-receipt {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }
  .receipt-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
  }
  .receipt-label { color: ${COLORS.muted}; }
  .receipt-value { font-family: 'DM Mono', monospace; color: ${COLORS.text}; font-weight: 500; }
  .receipt-divider {
    height: 1px;
    background: ${COLORS.border};
    margin: 2px 0;
  }

  /* ── Join nudge (ONLY shown after confirmation, never before) ── */
  .join-nudge {
    padding: 14px 16px;
    background: ${COLORS.accentGlow};
    border: 1px solid ${COLORS.accent}33;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .join-nudge-text {
    font-size: 13px;
    color: ${COLORS.text};
    line-height: 1.4;
  }
  .join-nudge-text span { color: ${COLORS.muted}; font-size: 12px; }
  .btn-join {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid ${COLORS.accent};
    background: transparent;
    color: ${COLORS.accent};
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
    min-height: 44px;
  }
  .btn-join:hover { background: ${COLORS.accentGlow}; }

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
    color: ${COLORS.text};
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
    transition: background 0.15s, border-color 0.15s;
    min-height: 44px;
  }
  .btn-retry:hover { background: ${COLORS.card}; border-color: ${COLORS.subtle}; }

  /* ── Invalid/expired state ── */
  .invalid-icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #ffd16615;
    border: 1px solid ${COLORS.yellow}44;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  .invalid-heading {
    font-size: 18px;
    font-weight: 800;
    text-align: center;
    color: ${COLORS.text};
    margin-bottom: 8px;
  }
  .invalid-body {
    font-size: 13px;
    color: ${COLORS.muted};
    text-align: center;
    line-height: 1.6;
    margin-bottom: 8px;
  }
  .invalid-code {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: ${COLORS.muted};
    text-align: center;
    margin-bottom: 20px;
    padding: 6px 12px;
    background: ${COLORS.surface};
    border-radius: 6px;
    border: 1px solid ${COLORS.border};
    display: inline-block;
    width: 100%;
  }
  .contact-link {
    display: block;
    text-align: center;
    font-size: 13px;
    color: ${COLORS.accent};
    text-decoration: none;
    margin-top: 12px;
    cursor: pointer;
  }
  .contact-link:hover { text-decoration: underline; }

  /* ── Responsive ── */
  @media (max-width: 480px) {
    .confirm-card { padding: 24px 18px; border-radius: 14px; }
    .confirm-heading { font-size: 20px; }
    .join-nudge { flex-direction: column; align-items: flex-start; }
    .btn-join { width: 100%; text-align: center; }
  }
`;

// ── SVG icons (inline — no deps) ────────────────────────────────────────────
function IconCheck({ size = 28, color = "#00e5a0" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
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
function IconClock({ size = 26, color = "#ffd166" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconShield({ size = 16, color = "#6c6cff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
type State = "default" | "loading" | "success" | "error" | "invalid";

interface IntroContext {
  introducer_name: string;
  introducer_initials: string;
  target_company: string;
  meeting_context: string;
  snapshot_id: string;
}

interface PageProps {
  params: Promise<{ token: string }>;
}

// ── Mock intro context (replaced by real token validation in production) ─────
function getMockContext(token: string): { valid: boolean; context?: IntroContext; errorCode?: string } {
  if (token === "expired") return { valid: false, errorCode: "TOKEN_EXPIRED" };
  if (token === "invalid") return { valid: false, errorCode: "TOKEN_INVALID" };
  if (token === "notfound") return { valid: false, errorCode: "NOT_FOUND" };
  return {
    valid: true,
    context: {
      introducer_name: "Sarah Chen",
      introducer_initials: "SC",
      target_company: "Acme Corp",
      meeting_context: "Intro to discuss potential partnership on Q2 go-to-market strategy",
      snapshot_id: "snp_" + token.slice(0, 8),
    },
  };
}

function getErrorMessage(code: string): { heading: string; body: string } {
  if (code === "TOKEN_EXPIRED") return {
    heading: "This link has expired",
    body: "Introduction confirmation links are time-limited. Ask your introducer to resend the request.",
  };
  if (code === "TOKEN_INVALID") return {
    heading: "Invalid confirmation link",
    body: "This link doesn't look right. It may have been modified or copied incorrectly.",
  };
  return {
    heading: "Introduction not found",
    body: "We couldn't find this introduction. It may have already been confirmed or withdrawn.",
  };
}

// ── Confirm page component ───────────────────────────────────────────────────
export default function ConfirmPage({ params }: PageProps) {
  const { token } = use(params);
  const [uiState, setUiState] = useState<State>("default");
  const [confirmedAt, setConfirmedAt] = useState<string>("");
  const [snapshotId, setSnapshotId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Resolve context on mount
  const tokenResult = getMockContext(token);
  const introCtx = tokenResult.context;
  const errorCode = tokenResult.errorCode;

  useEffect(() => {
    if (!tokenResult.valid) {
      setUiState("invalid");
    }
  }, [tokenResult.valid]);

  async function handleConfirm() {
    setUiState("loading");
    try {
      const now = new Date().toISOString();
      const res = await fetch("/v1/confirm/intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, confirm: true, confirmed_at: now }),
      });
      const data = await res.json();
      if (data.ok) {
        setConfirmedAt(now);
        setSnapshotId(data.data?.snapshot_id ?? snapshotId);
        setUiState("success");
      } else {
        const code = data.error?.code ?? "";
        if (["TOKEN_INVALID", "TOKEN_EXPIRED", "NOT_FOUND"].includes(code)) {
          setUiState("invalid");
        } else {
          setErrorMsg(data.error?.message ?? "Something went wrong.");
          setUiState("error");
        }
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setUiState("error");
    }
  }

  function formatTime(iso: string): string {
    try {
      return new Date(iso).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit", timeZoneName: "short",
      });
    } catch {
      return iso;
    }
  }

  return (
    <>
      <style>{styles}</style>
      <main className="confirm-page">
        <div className="confirm-shell">

          {/* Wordmark — always visible */}
          <div className="confirm-wordmark">
            <div className="wordmark-mark">TF</div>
            <div className="wordmark-text">True<span>ferral</span></div>
          </div>

          <div className="confirm-card">

            {/* ── STATE: default ── */}
            {uiState === "default" && introCtx && (
              <>
                {/* Context block — D-014 #6: context memory */}
                <div className="context-block">
                  <div className="context-avatar">{introCtx.introducer_initials}</div>
                  <div className="context-text">
                    <div className="context-label">Introduction from</div>
                    <div className="context-name">{introCtx.introducer_name}</div>
                    <div className="context-sub">{introCtx.meeting_context}</div>
                  </div>
                </div>

                {/* D-014 #1: immediate clarity */}
                <h1 className="confirm-heading">
                  Confirm this<br /><span>introduction</span>
                </h1>

                {/* D-014 #2: low pressure */}
                <p className="confirm-body">
                  {introCtx.introducer_name} wants to introduce you to someone at {introCtx.target_company}. Confirming means you're open to the connection — no commitment beyond that.
                </p>

                {/* D-014 #3: visible next step */}
                <div className="next-steps">
                  <div className="next-step">
                    <div className="step-num">1</div>
                    <div className="step-text">
                      <strong>You confirm</strong> <span>— takes 10 seconds, no account needed</span>
                    </div>
                  </div>
                  <div className="next-step">
                    <div className="step-num">2</div>
                    <div className="step-text">
                      <strong>{introCtx.introducer_name} is notified</strong> <span>— they coordinate the connection</span>
                    </div>
                  </div>
                  <div className="next-step">
                    <div className="step-num">3</div>
                    <div className="step-text">
                      <strong>An immutable record is created</strong> <span>— both sides are protected</span>
                    </div>
                  </div>
                </div>

                {/* Primary CTA — D-014 #5: fast, single action */}
                <button
                  className="btn-confirm"
                  onClick={handleConfirm}
                >
                  <IconCheck size={18} color="white" />
                  Confirm introduction
                </button>

                {/* D-014 #10: control and consent */}
                <p className="consent-note">
                  By confirming you agree to be introduced. No account required.{" "}
                  <a>Privacy policy</a>
                </p>
              </>
            )}

            {/* ── STATE: loading ── */}
            {uiState === "loading" && (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: COLORS.accentGlow,
                    border: `1px solid ${COLORS.accent}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div className="spinner" />
                  </div>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Confirming…</div>
                <div style={{ fontSize: 13, color: COLORS.muted }}>Creating your introduction record</div>

                <button
                  className="btn-confirm"
                  disabled
                  style={{ marginTop: 28 }}
                >
                  <div className="spinner" />
                  Confirming introduction…
                </button>
              </div>
            )}

            {/* ── STATE: success ── */}
            {uiState === "success" && (
              <>
                <div className="success-icon-wrap">
                  <IconCheck size={30} color={COLORS.green} />
                </div>

                <h1 className="success-heading">You're confirmed</h1>
                <p className="success-body">
                  The introduction is now on record. {introCtx?.introducer_name} will be in touch to coordinate the connection.
                </p>

                {/* D-014 #7: action closure — receipt */}
                <div className="success-receipt">
                  <div className="receipt-row">
                    <span className="receipt-label">Status</span>
                    <span className="receipt-value" style={{ color: COLORS.green }}>INTRO_CONFIRMED</span>
                  </div>
                  <div className="receipt-divider" />
                  <div className="receipt-row">
                    <span className="receipt-label">Record ID</span>
                    <span className="receipt-value">{snapshotId || introCtx?.snapshot_id}</span>
                  </div>
                  {confirmedAt && (
                    <div className="receipt-row">
                      <span className="receipt-label">Confirmed at</span>
                      <span className="receipt-value">{formatTime(confirmedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Optional join nudge — ONLY shown post-confirmation, D-013 */}
                <div className="join-nudge">
                  <div className="join-nudge-text">
                    Want to protect your own introductions?<br />
                    <span>Trueferral is free to try.</span>
                  </div>
                  <button className="btn-join">Join free</button>
                </div>

                <p className="consent-note" style={{ marginTop: 14 }}>
                  <IconShield size={13} color={COLORS.muted} style={{ verticalAlign: "middle", marginRight: 4 }} />
                  This record is immutable and tamper-evident.
                </p>
              </>
            )}

            {/* ── STATE: error ── */}
            {uiState === "error" && (
              <>
                <div className="error-icon-wrap">
                  <IconAlert size={26} color={COLORS.red} />
                </div>
                <h1 className="error-heading">Something went wrong</h1>
                <p className="error-body">
                  {errorMsg || "We couldn't process your confirmation. Your link is still valid — please try again."}
                </p>
                <button className="btn-retry" onClick={handleConfirm}>
                  Try again
                </button>
                <p className="consent-note" style={{ marginTop: 12 }}>
                  If this keeps happening, ask {introCtx?.introducer_name ?? "your introducer"} to resend the link.
                </p>
              </>
            )}

            {/* ── STATE: invalid ── */}
            {uiState === "invalid" && errorCode && (
              <>
                <div className="invalid-icon-wrap">
                  <IconClock size={26} color={COLORS.yellow} />
                </div>
                <h1 className="invalid-heading">{getErrorMessage(errorCode).heading}</h1>
                <p className="invalid-body">{getErrorMessage(errorCode).body}</p>
                <div className="invalid-code">Error: {errorCode}</div>
                <p className="consent-note">
                  If you think this is a mistake,{" "}
                  <a className="contact-link" style={{ display: "inline" }}>
                    contact support
                  </a>
                  .
                </p>
              </>
            )}

          </div>
        </div>
      </main>
    </>
  );
}
