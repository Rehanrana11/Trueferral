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

  .rc-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px 80px;
    position: relative;
    overflow: hidden;
  }
  .rc-page::before {
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
  .rc-page::after {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.025;
    background-image: radial-gradient(${COLORS.muted} 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  .rc-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
  }

  /* ── Topbar ── */
  .rc-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .rc-wordmark {
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

  /* ── Outcome hero ── */
  .outcome-hero {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 28px 24px;
    margin-bottom: 12px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .outcome-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.04;
    background: repeating-linear-gradient(
      45deg,
      ${COLORS.green},
      ${COLORS.green} 1px,
      transparent 1px,
      transparent 12px
    );
    pointer-events: none;
  }
  .outcome-hero.failure::before {
    background: repeating-linear-gradient(
      45deg,
      ${COLORS.red},
      ${COLORS.red} 1px,
      transparent 1px,
      transparent 12px
    );
  }

  .outcome-icon-wrap {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    position: relative;
    z-index: 1;
  }
  .outcome-icon-wrap.success {
    background: ${COLORS.greenGlow};
    border: 1px solid ${COLORS.green}44;
  }
  .outcome-icon-wrap.failure {
    background: ${COLORS.redGlow};
    border: 1px solid ${COLORS.red}44;
  }

  .outcome-verdict {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 6px;
    position: relative;
    z-index: 1;
  }
  .outcome-verdict.success { color: ${COLORS.green}; }
  .outcome-verdict.failure { color: ${COLORS.red}; }

  .outcome-title {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
    position: relative;
    z-index: 1;
  }
  .outcome-subtitle {
    font-size: 13px;
    color: ${COLORS.muted};
    position: relative;
    z-index: 1;
    line-height: 1.5;
  }

  /* ── Proof card ── */
  .proof-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 12px;
  }

  .proof-section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid ${COLORS.border};
  }

  .proof-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 8px 0;
    border-bottom: 1px solid ${COLORS.border}55;
    gap: 12px;
  }
  .proof-row:last-child { border-bottom: none; padding-bottom: 0; }
  .proof-label {
    font-size: 12px;
    color: ${COLORS.muted};
    flex-shrink: 0;
    min-width: 110px;
    padding-top: 1px;
  }
  .proof-value {
    font-size: 12px;
    color: ${COLORS.text};
    font-weight: 500;
    text-align: right;
    word-break: break-word;
  }
  .proof-value.mono {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
  }
  .proof-value.green { color: ${COLORS.green}; }
  .proof-value.yellow { color: ${COLORS.yellow}; }
  .proof-value.accent { color: ${COLORS.accent}; }

  /* ── Hash chain block ── */
  .hash-block {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    padding: 14px 16px;
    margin-top: 12px;
  }
  .hash-block-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .hash-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${COLORS.green};
    box-shadow: 0 0 5px ${COLORS.green};
  }
  .hash-chain-rows { display: flex; flex-direction: column; gap: 6px; }
  .hash-chain-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-family: 'DM Mono', monospace;
  }
  .hash-chain-seq {
    color: ${COLORS.accent};
    width: 48px;
    flex-shrink: 0;
  }
  .hash-chain-type {
    color: ${COLORS.text};
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hash-chain-hash { color: ${COLORS.muted}; font-size: 10px; flex-shrink: 0; }

  /* ── Parties block ── */
  .parties-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }
  .party-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    padding: 16px;
  }
  .party-role {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 6px;
  }
  .party-name {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 3px;
  }
  .party-org {
    font-size: 11px;
    color: ${COLORS.muted};
    margin-bottom: 8px;
  }
  .party-verified {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 600;
    color: ${COLORS.green};
    background: ${COLORS.greenGlow};
    border: 1px solid ${COLORS.green}33;
    border-radius: 4px;
    padding: 2px 7px;
  }

  /* ── Share / action bar ── */
  .action-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .btn-share {
    flex: 1;
    padding: 13px 20px;
    border-radius: 10px;
    border: none;
    background: ${COLORS.accent};
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
    min-height: 48px;
    box-shadow: 0 0 20px ${COLORS.accentGlow};
  }
  .btn-share:hover {
    background: #8484ff;
    transform: translateY(-1px);
    box-shadow: 0 0 32px ${COLORS.accentGlow};
  }
  .btn-share:active { transform: translateY(0); }
  .btn-share.copied { background: #1a3a2a; border: 1px solid ${COLORS.green}44; color: ${COLORS.green}; box-shadow: none; }

  .btn-download {
    padding: 13px 18px;
    border-radius: 10px;
    border: 1px solid ${COLORS.border};
    background: ${COLORS.surface};
    color: ${COLORS.muted};
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: color 0.15s, border-color 0.15s;
    min-height: 48px;
  }
  .btn-download:hover { color: ${COLORS.text}; border-color: ${COLORS.subtle}; }

  .share-note {
    font-size: 11px;
    color: ${COLORS.muted};
    text-align: center;
    line-height: 1.6;
    margin-bottom: 8px;
  }

  /* ── Immutability seal ── */
  .immutability-seal {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px;
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    margin-bottom: 12px;
  }
  .seal-icon {
    font-size: 20px;
    flex-shrink: 0;
  }
  .seal-text {
    font-size: 12px;
    color: ${COLORS.muted};
    line-height: 1.5;
  }
  .seal-text strong { color: ${COLORS.text}; font-weight: 600; }

  @media (max-width: 480px) {
    .proof-card { padding: 16px; }
    .parties-grid { grid-template-columns: 1fr; }
    .outcome-title { font-size: 18px; }
  }
`;

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconStar({ size = 30, color = "#00e5a0" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconX({ size = 28, color = "#ff4d6a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconShare({ size = 15, color = "white" }) {
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
function IconDownload({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function IconCheck({ size = 11, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Types & mock data ─────────────────────────────────────────────────────────
type Outcome = "SUCCESS" | "FAILURE";

interface Receipt {
  receipt_id: string;
  snapshot_id: string;
  outcome: Outcome;
  introducer: { name: string; org: string };
  target: { name: string; org: string };
  counterparty: string;
  success_condition: string;
  value_range: string;
  intro_confirmed_at: string;
  outcome_verified_at: string;
  event_hash: string;
  chain: { seq: number; type: string; hash: string }[];
}

function getMockReceipt(id: string): Receipt {
  const isFailure = id.includes("fail");
  return {
    receipt_id: `rcpt_${id}`,
    snapshot_id: `snp_${id}`,
    outcome: isFailure ? "FAILURE" : "SUCCESS",
    introducer: { name: "Sarah Chen", org: "Sequoia Capital" },
    target:     { name: "Alex Johnson", org: "Acme Corp" },
    counterparty: "Jordan Lee — Senior Backend Engineer",
    success_condition: "Candidate placed and retained 90 days",
    value_range: "$50,000 – $80,000",
    intro_confirmed_at: "Mar 3, 2026 · 2:14 PM EST",
    outcome_verified_at: "Mar 6, 2026 · 11:07 AM EST",
    event_hash: `sha256:9f3c2a...${id.slice(0,4)}...e7d2`,
    chain: [
      { seq: 1, type: "SnapshotCreated",        hash: "a1b2c3d4" },
      { seq: 2, type: "SnapshotFrozen",          hash: "b2c3d4e5" },
      { seq: 3, type: "TokenIssued",             hash: "c3d4e5f6" },
      { seq: 4, type: "IntroClaimed",            hash: "d4e5f6a1" },
      { seq: 5, type: "IntroConfirmed",          hash: "e5f6a1b2" },
      { seq: 6, type: isFailure ? "OutcomeVerifiedFail" : "OutcomeVerifiedSuccess", hash: "f6a1b2c3" },
      { seq: 7, type: "ReputationAdjusted",      hash: "a1b2c3d5" },
    ],
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OutcomeReceiptPage({ params }: PageProps) {
  const { id } = use(params);
  const receipt = getMockReceipt(id);
  const [copied, setCopied] = useState(false);

  const isSuccess = receipt.outcome === "SUCCESS";

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <>
      <style>{styles}</style>
      <main className="rc-page">
        <div className="rc-shell">

          {/* Topbar */}
          <div className="rc-topbar">
            <div className="rc-wordmark">
              <div className="wordmark-mark">TF</div>
              <div className="wordmark-text">True<span>ferral</span></div>
            </div>
          </div>

          {/* Outcome hero */}
          <div className={`outcome-hero${isSuccess ? "" : " failure"}`}>
            <div className={`outcome-icon-wrap${isSuccess ? " success" : " failure"}`}>
              {isSuccess
                ? <IconStar size={32} color={COLORS.green} />
                : <IconX size={28} color={COLORS.red} />
              }
            </div>
            <div className={`outcome-verdict${isSuccess ? " success" : " failure"}`}>
              {isSuccess ? "Verified successful" : "Verified unsuccessful"}
            </div>
            <div className="outcome-title">
              {isSuccess ? "Introduction succeeded" : "Introduction did not succeed"}
            </div>
            <div className="outcome-subtitle">
              {isSuccess
                ? `${receipt.introducer.name} introduced ${receipt.counterparty.split("—")[0].trim()} to ${receipt.target.name}. Outcome independently verified by both parties.`
                : `${receipt.introducer.name} introduced ${receipt.counterparty.split("—")[0].trim()} to ${receipt.target.name}. Outcome verified as unsuccessful by both parties.`
              }
            </div>
          </div>

          {/* Parties */}
          <div className="parties-grid">
            <div className="party-card">
              <div className="party-role">Introducer</div>
              <div className="party-name">{receipt.introducer.name}</div>
              <div className="party-org">{receipt.introducer.org}</div>
              <div className="party-verified"><IconCheck size={9} color={COLORS.green} /> Verified</div>
            </div>
            <div className="party-card">
              <div className="party-role">Target</div>
              <div className="party-name">{receipt.target.name}</div>
              <div className="party-org">{receipt.target.org}</div>
              <div className="party-verified"><IconCheck size={9} color={COLORS.green} /> Verified</div>
            </div>
          </div>

          {/* Immutable proof */}
          <div className="proof-card">
            <div className="proof-section-label">Immutable proof record</div>
            <div className="proof-row">
              <span className="proof-label">Receipt ID</span>
              <span className="proof-value mono accent">{receipt.receipt_id}</span>
            </div>
            <div className="proof-row">
              <span className="proof-label">Snapshot ID</span>
              <span className="proof-value mono">{receipt.snapshot_id}</span>
            </div>
            <div className="proof-row">
              <span className="proof-label">Counterparty</span>
              <span className="proof-value">{receipt.counterparty}</span>
            </div>
            <div className="proof-row">
              <span className="proof-label">Success condition</span>
              <span className="proof-value">{receipt.success_condition}</span>
            </div>
            <div className="proof-row">
              <span className="proof-label">Value range</span>
              <span className="proof-value green">{receipt.value_range}</span>
            </div>
            <div className="proof-row">
              <span className="proof-label">Intro confirmed</span>
              <span className="proof-value mono">{receipt.intro_confirmed_at}</span>
            </div>
            <div className="proof-row">
              <span className="proof-label">Outcome verified</span>
              <span className="proof-value mono">{receipt.outcome_verified_at}</span>
            </div>
            <div className="proof-row">
              <span className="proof-label">Final state</span>
              <span className={`proof-value mono${isSuccess ? " green" : ""}`} style={!isSuccess ? { color: COLORS.red } : {}}>
                {isSuccess ? "OutcomeVerifiedSuccess" : "OutcomeVerifiedFail"}
              </span>
            </div>

            {/* Hash chain */}
            <div className="hash-block">
              <div className="hash-block-label">
                <div className="hash-dot" />
                Event hash chain
              </div>
              <div className="hash-chain-rows">
                {receipt.chain.map(e => (
                  <div key={e.seq} className="hash-chain-row">
                    <span className="hash-chain-seq">seq {e.seq}</span>
                    <span className="hash-chain-type">{e.type}</span>
                    <span className="hash-chain-hash">{e.hash}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Share bar */}
          <div className="action-bar">
            <button
              className={`btn-share${copied ? " copied" : ""}`}
              onClick={handleShare}
            >
              {copied
                ? <><IconCheck size={13} color={COLORS.green} /> Link copied</>
                : <><IconShare size={14} /> Share this receipt</>
              }
            </button>
            <button className="btn-download">
              <IconDownload size={14} />
              Save
            </button>
          </div>

          <p className="share-note">
            Anyone with this link can verify the outcome. The record cannot be edited or deleted.
          </p>

          {/* Immutability seal */}
          <div className="immutability-seal">
            <div className="seal-icon">⬡</div>
            <div className="seal-text">
              <strong>Tamper-evident record.</strong> This receipt is hash-chained to {receipt.chain.length} immutable events. Any modification would break the chain and be immediately detectable.
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
