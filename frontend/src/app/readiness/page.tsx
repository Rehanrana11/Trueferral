"use client";

import { useState, useMemo } from "react";

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

  .irs-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px 80px;
    position: relative;
    overflow: hidden;
  }
  .irs-page::before {
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
  .irs-page::after {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.025;
    background-image: radial-gradient(${COLORS.muted} 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  .irs-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
  }

  /* ── Wordmark ── */
  .irs-wordmark {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
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

  /* ── Score card ── */
  .score-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
  }

  .score-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
  }
  .score-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 4px;
  }
  .score-title {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.3px;
  }
  .score-number-wrap {
    text-align: right;
    flex-shrink: 0;
  }
  .score-number {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -2px;
    line-height: 1;
    font-family: 'DM Mono', monospace;
    transition: color 0.3s;
  }
  .score-number.low    { color: ${COLORS.red}; }
  .score-number.medium { color: ${COLORS.yellow}; }
  .score-number.high   { color: ${COLORS.green}; }
  .score-pct {
    font-size: 13px;
    color: ${COLORS.muted};
    font-weight: 500;
  }

  /* ── Progress bar ── */
  .progress-track {
    height: 8px;
    background: ${COLORS.surface};
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
    border: 1px solid ${COLORS.border};
  }
  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s;
  }
  .fill-low    { background: linear-gradient(90deg, ${COLORS.red}, #ff6b85); }
  .fill-medium { background: linear-gradient(90deg, ${COLORS.yellow}, #ffe08a); }
  .fill-high   { background: linear-gradient(90deg, ${COLORS.green}, #33ffb8); box-shadow: 0 0 8px ${COLORS.greenGlow}; }

  .score-message {
    font-size: 12px;
    color: ${COLORS.muted};
    line-height: 1.5;
  }
  .score-message strong { color: ${COLORS.text}; }

  /* ── Form card ── */
  .form-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
  }

  .form-section-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .form-section-progress {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0;
    text-transform: none;
    color: ${COLORS.accent};
  }

  /* ── Field group ── */
  .field-group { margin-bottom: 18px; }
  .field-group:last-child { margin-bottom: 0; }

  .field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 7px;
  }
  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: ${COLORS.text};
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .field-weight {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    color: ${COLORS.muted};
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 3px;
    padding: 1px 5px;
  }
  .field-check {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    border: 1.5px solid ${COLORS.border};
    background: ${COLORS.surface};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .field-check.filled {
    background: ${COLORS.greenGlow};
    border-color: ${COLORS.green}44;
  }

  .field-input {
    width: 100%;
    padding: 10px 14px;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    color: ${COLORS.text};
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    min-height: 42px;
  }
  .field-input:focus {
    border-color: ${COLORS.accent};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }
  .field-input::placeholder { color: ${COLORS.muted}; }
  .field-input.filled { border-color: ${COLORS.green}44; }

  .field-textarea {
    width: 100%;
    padding: 10px 14px;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    color: ${COLORS.text};
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    outline: none;
    resize: vertical;
    min-height: 80px;
    line-height: 1.5;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .field-textarea:focus {
    border-color: ${COLORS.accent};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }
  .field-textarea::placeholder { color: ${COLORS.muted}; }
  .field-textarea.filled { border-color: ${COLORS.green}44; }

  .field-select {
    width: 100%;
    padding: 10px 14px;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    color: ${COLORS.text};
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    outline: none;
    cursor: pointer;
    appearance: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    min-height: 42px;
  }
  .field-select:focus {
    border-color: ${COLORS.accent};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }
  .field-select.filled { border-color: ${COLORS.green}44; }
  .field-select option { background: ${COLORS.card}; }

  .field-hint {
    font-size: 11px;
    color: ${COLORS.muted};
    margin-top: 5px;
    font-family: 'DM Mono', monospace;
  }

  /* ── Checklist items ── */
  .checklist-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    margin-bottom: 6px;
    cursor: pointer;
    transition: border-color 0.15s;
    min-height: 44px;
  }
  .checklist-row:last-child { margin-bottom: 0; }
  .checklist-row:hover { border-color: ${COLORS.subtle}; }
  .checklist-row.checked {
    background: ${COLORS.greenGlow};
    border-color: ${COLORS.green}33;
  }
  .checklist-box {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    border: 1.5px solid ${COLORS.border};
    background: ${COLORS.card};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .checklist-row.checked .checklist-box {
    background: ${COLORS.green};
    border-color: ${COLORS.green};
  }
  .checklist-text {
    font-size: 13px;
    font-weight: 500;
    color: ${COLORS.muted};
    transition: color 0.15s;
    line-height: 1.3;
  }
  .checklist-row.checked .checklist-text { color: ${COLORS.text}; }
  .checklist-weight {
    margin-left: auto;
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    color: ${COLORS.muted};
    flex-shrink: 0;
  }

  /* ── CTA ── */
  .btn-primary {
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
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s, opacity 0.15s;
    min-height: 52px;
    box-shadow: 0 0 24px ${COLORS.accentGlow};
  }
  .btn-primary:not(:disabled):hover {
    background: ${COLORS.accentHover};
    box-shadow: 0 0 36px ${COLORS.accentGlow};
    transform: translateY(-1px);
  }
  .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-hint {
    font-size: 12px;
    color: ${COLORS.muted};
    text-align: center;
    margin-top: 10px;
    line-height: 1.5;
  }

  @media (max-width: 480px) {
    .score-card, .form-card { padding: 18px; }
    .score-number { font-size: 28px; }
  }
`;

// ── Field definitions ─────────────────────────────────────────────────────────
interface CheckField {
  id: string;
  label: string;
  weight: number;
  type: "text" | "textarea" | "select" | "check";
  placeholder?: string;
  options?: string[];
  hint?: string;
  section: "core" | "context" | "terms";
}

const FIELDS: CheckField[] = [
  // Core — required
  { id: "counterparty",      label: "Who you're introducing",   weight: 20, type: "text",     placeholder: "Name, role, company",            section: "core" },
  { id: "target_email",      label: "Their email address",       weight: 15, type: "text",     placeholder: "email@company.com",              section: "core" },
  { id: "purpose",           label: "Purpose of introduction",   weight: 15, type: "select",   options: ["Select purpose…", "Hiring", "Investment", "Partnership", "Advisory", "Sales", "Other"], section: "core" },
  // Context — quality signals
  { id: "why_now",           label: "Why this, why now",         weight: 15, type: "textarea", placeholder: "What makes this intro timely and valuable?", hint: "Introducers who explain timing get 2× confirmation rate", section: "context" },
  { id: "relationship",      label: "Your relationship to them", weight: 10, type: "textarea", placeholder: "How do you know this person?",    section: "context" },
  { id: "mutual_benefit",    label: "Mutual benefit",            weight: 10, type: "textarea", placeholder: "What does each side get?",        section: "context" },
  // Terms — commitment signals
  { id: "success_condition", label: "Success condition",         weight: 10, type: "text",     placeholder: "e.g. Candidate hired and retained 90 days", section: "terms" },
  { id: "timeline",          label: "Expected timeline",         weight: 5,  type: "check",    label: "I've set a realistic timeline expectation", section: "terms" },
];

const SECTION_LABELS: Record<string, string> = {
  core:    "Core details",
  context: "Context & quality",
  terms:   "Commitment signals",
};

// ── Score logic ───────────────────────────────────────────────────────────────
function getScoreColor(pct: number): "low" | "medium" | "high" {
  if (pct < 40) return "low";
  if (pct < 75) return "medium";
  return "high";
}

function getScoreMessage(pct: number, missing: string[]): string {
  if (pct === 100) return "This introduction is fully prepared. You can send it with confidence.";
  if (pct >= 75) return `Strong intro. Adding ${missing.slice(0, 2).join(", ")} would make it exceptional.`;
  if (pct >= 40) return `Good start. Complete ${missing.slice(0, 3).join(", ")} to increase confirmation likelihood.`;
  return "Fill in the core details to start building your readiness score.";
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconCheck({ size = 11, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconSend({ size = 16, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function IntroReadinessScorePage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  function isFieldFilled(field: CheckField): boolean {
    if (field.type === "check") return !!checks[field.id];
    const v = values[field.id] ?? "";
    if (field.type === "select") return v !== "" && v !== "Select purpose…";
    return v.trim().length > 0;
  }

  const { score, pct, filledCount, missingLabels } = useMemo(() => {
    let earned = 0;
    let total = 0;
    const missing: string[] = [];
    for (const f of FIELDS) {
      total += f.weight;
      if (isFieldFilled(f)) earned += f.weight;
      else missing.push(f.label);
    }
    return {
      score: earned,
      pct: Math.round((earned / total) * 100),
      filledCount: FIELDS.filter(f => isFieldFilled(f)).length,
      missingLabels: missing,
    };
  }, [values, checks]);

  const scoreColor = getScoreColor(pct);
  const canSend = pct >= 35; // core fields sufficient

  const sections = ["core", "context", "terms"] as const;

  return (
    <>
      <style>{styles}</style>
      <main className="irs-page">
        <div className="irs-shell">

          {/* Wordmark */}
          <div className="irs-wordmark">
            <div className="wordmark-mark">TF</div>
            <div className="wordmark-text">True<span>ferral</span></div>
          </div>

          {/* Score card */}
          <div className="score-card">
            <div className="score-header">
              <div>
                <div className="score-label">Intro readiness score</div>
                <div className="score-title">How prepared is this intro?</div>
              </div>
              <div className="score-number-wrap">
                <div className={`score-number ${scoreColor}`}>{pct}</div>
                <div className="score-pct">/ 100</div>
              </div>
            </div>

            <div className="progress-track">
              <div
                className={`progress-fill fill-${scoreColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="score-message">
              {getScoreMessage(pct, missingLabels)}
              {pct > 0 && pct < 100 && (
                <span> <strong>{filledCount}/{FIELDS.length} fields complete.</strong></span>
              )}
            </div>
          </div>

          {/* Form sections */}
          {sections.map(section => {
            const sectionFields = FIELDS.filter(f => f.section === section);
            const sectionFilled = sectionFields.filter(f => isFieldFilled(f)).length;
            return (
              <div key={section} className="form-card">
                <div className="form-section-title">
                  <span>{SECTION_LABELS[section]}</span>
                  <span className="form-section-progress">{sectionFilled}/{sectionFields.length}</span>
                </div>

                {sectionFields.map(field => (
                  <div key={field.id} className="field-group">
                    <div className="field-row">
                      <div className="field-label">
                        {field.type !== "check" && (
                          <div className={`field-check${isFieldFilled(field) ? " filled" : ""}`}>
                            {isFieldFilled(field) && <IconCheck size={10} color={COLORS.green} />}
                          </div>
                        )}
                        {field.type !== "check" ? field.label : ""}
                      </div>
                      {field.type !== "check" && (
                        <span className="field-weight">+{field.weight}pts</span>
                      )}
                    </div>

                    {field.type === "text" && (
                      <input
                        className={`field-input${isFieldFilled(field) ? " filled" : ""}`}
                        type="text"
                        placeholder={field.placeholder}
                        value={values[field.id] ?? ""}
                        onChange={e => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        className={`field-textarea${isFieldFilled(field) ? " filled" : ""}`}
                        placeholder={field.placeholder}
                        value={values[field.id] ?? ""}
                        onChange={e => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                      />
                    )}

                    {field.type === "select" && (
                      <select
                        className={`field-select${isFieldFilled(field) ? " filled" : ""}`}
                        value={values[field.id] ?? ""}
                        onChange={e => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                      >
                        {field.options?.map(o => (
                          <option key={o} value={o === "Select purpose…" ? "" : o}>{o}</option>
                        ))}
                      </select>
                    )}

                    {field.type === "check" && (
                      <div
                        className={`checklist-row${checks[field.id] ? " checked" : ""}`}
                        onClick={() => setChecks(prev => ({ ...prev, [field.id]: !prev[field.id] }))}
                      >
                        <div className="checklist-box">
                          {checks[field.id] && <IconCheck size={10} color="#0a0a0f" />}
                        </div>
                        <span className="checklist-text">{field.label}</span>
                        <span className="checklist-weight">+{field.weight}pts</span>
                      </div>
                    )}

                    {field.hint && !isFieldFilled(field) && (
                      <div className="field-hint">💡 {field.hint}</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}

          {/* CTA */}
          <button className="btn-primary" disabled={!canSend}>
            <IconSend size={15} />
            {canSend ? "Send this introduction" : "Complete core details to send"}
          </button>
          <p className="btn-hint">
            Score {pct}/100 · {canSend ? "Ready to send" : `Need ${35 - pct} more points to unlock`}
          </p>

        </div>
      </main>
    </>
  );
}
