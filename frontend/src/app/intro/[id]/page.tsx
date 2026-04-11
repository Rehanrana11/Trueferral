"use client";

import { useState, use } from "react";

// ── Design System (matches existing pages exactly) ────────────────────────
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
  .intro-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    position: relative;
    overflow: hidden;
  }
  .intro-page::before {
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
  .intro-page::after {
    content: '';
    position: fixed;
    inset: 0;
    opacity: 0.025;
    background-image: radial-gradient(${COLORS.muted} 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  .intro-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
  }

  /* ── Wordmark ── */
  .intro-wordmark {
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

  /* ── Card ── */
  .intro-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    padding: 32px 28px;
    width: 100%;
  }

  /* ── Step indicator ── */
  .step-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
  }
  .step-pip {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${COLORS.border};
    transition: background 0.2s;
  }
  .step-pip.active { background: ${COLORS.accent}; box-shadow: 0 0 6px ${COLORS.accent}; }
  .step-pip.done { background: ${COLORS.green}; }
  .step-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-left: 4px;
  }

  /* ── Heading ── */
  .intro-heading {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1.2;
    margin-bottom: 8px;
  }
  .intro-heading span { color: ${COLORS.accent}; }
  .intro-subheading {
    font-size: 13px;
    color: ${COLORS.muted};
    line-height: 1.6;
    margin-bottom: 28px;
  }

  /* ── Form fields ── */
  .field-group { margin-bottom: 20px; }
  .field-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: ${COLORS.muted};
    margin-bottom: 8px;
  }
  .field-required {
    font-size: 10px;
    color: ${COLORS.accent};
    letter-spacing: 0;
    text-transform: none;
    font-weight: 500;
  }
  .field-optional {
    font-size: 10px;
    color: ${COLORS.muted};
    letter-spacing: 0;
    text-transform: none;
    font-weight: 400;
  }
  .field-input {
    width: 100%;
    padding: 11px 14px;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    color: ${COLORS.text};
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    min-height: 44px;
  }
  .field-input:focus {
    border-color: ${COLORS.accent};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }
  .field-input::placeholder { color: ${COLORS.muted}; }
  .field-input.error {
    border-color: ${COLORS.red};
    box-shadow: 0 0 0 3px #ff4d6a15;
  }
  .field-textarea {
    width: 100%;
    padding: 11px 14px;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 8px;
    color: ${COLORS.text};
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    resize: vertical;
    min-height: 90px;
    line-height: 1.5;
  }
  .field-textarea:focus {
    border-color: ${COLORS.accent};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }
  .field-textarea::placeholder { color: ${COLORS.muted}; }
  .field-error {
    font-size: 12px;
    color: ${COLORS.red};
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .field-hint {
    font-size: 11px;
    color: ${COLORS.muted};
    margin-top: 6px;
    font-family: 'DM Mono', monospace;
  }
  .char-count {
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: ${COLORS.muted};
    text-align: right;
    margin-top: 4px;
    transition: color 0.15s;
  }
  .char-count.warn { color: ${COLORS.yellow}; }
  .char-count.over { color: ${COLORS.red}; }

  /* ── Trust guarantee block ── */
  .trust-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    margin-bottom: 24px;
  }
  .trust-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: ${COLORS.muted};
    line-height: 1.4;
  }
  .trust-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${COLORS.accent};
    flex-shrink: 0;
  }
  .trust-row strong { color: ${COLORS.text}; font-weight: 600; }

  /* ── Primary button ── */
  .btn-send {
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
    min-height: 52px;
    box-shadow: 0 0 24px ${COLORS.accentGlow};
  }
  .btn-send:not(:disabled):hover {
    background: ${COLORS.accentHover};
    box-shadow: 0 0 36px ${COLORS.accentGlow};
    transform: translateY(-1px);
  }
  .btn-send:not(:disabled):active { transform: translateY(0); }
  .btn-send:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .send-note {
    margin-top: 12px;
    font-size: 12px;
    color: ${COLORS.muted};
    text-align: center;
    line-height: 1.5;
  }

  /* ── Spinner ── */
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

  /* ── Sent state ── */
  .sent-icon-wrap {
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
  .sent-heading {
    font-size: 20px;
    font-weight: 800;
    text-align: center;
    color: ${COLORS.green};
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }
  .sent-body {
    font-size: 13px;
    color: ${COLORS.muted};
    text-align: center;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  /* ── Receipt block ── */
  .receipt-block {
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 16px;
  }
  .receipt-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 12px;
    padding: 5px 0;
  }
  .receipt-label { color: ${COLORS.muted}; flex-shrink: 0; margin-right: 12px; }
  .receipt-value {
    font-family: 'DM Mono', monospace;
    color: ${COLORS.text};
    font-weight: 500;
    text-align: right;
    word-break: break-all;
  }
  .receipt-divider { height: 1px; background: ${COLORS.border}; margin: 4px 0; }

  /* ── Confirm link box ── */
  .confirm-link-box {
    background: ${COLORS.accentGlow};
    border: 1px solid ${COLORS.accent}33;
    border-radius: 10px;
    padding: 14px 16px;
    margin-bottom: 16px;
  }
  .confirm-link-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: ${COLORS.accent};
    margin-bottom: 8px;
  }
  .confirm-link-row {
    display: flex;
    align-items: center;
    gap: 0;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 7px;
    overflow: hidden;
  }
  .confirm-link-text {
    flex: 1;
    padding: 9px 12px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: ${COLORS.muted};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .confirm-link-copy {
    padding: 9px 14px;
    background: ${COLORS.accent}22;
    color: ${COLORS.accent};
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border-left: 1px solid ${COLORS.border};
    font-family: 'Syne', sans-serif;
    transition: background 0.15s;
    white-space: nowrap;
    min-height: 44px;
    display: flex;
    align-items: center;
    border: none;
    border-left: 1px solid ${COLORS.border};
  }
  .confirm-link-copy:hover { background: ${COLORS.accentGlow}; }
  .confirm-link-copy.copied { color: ${COLORS.green}; }

  /* ── New intro button ── */
  .btn-new {
    width: 100%;
    padding: 12px 24px;
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-new:hover { background: ${COLORS.card}; border-color: ${COLORS.subtle}; }

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
  .btn-back {
    width: 100%;
    padding: 10px;
    border: none;
    background: transparent;
    color: ${COLORS.muted};
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s;
    min-height: 44px;
  }
  .btn-back:hover { color: ${COLORS.text}; }

  /* ── Responsive ── */
  @media (max-width: 480px) {
    .intro-card { padding: 24px 18px; border-radius: 14px; }
    .intro-heading { font-size: 20px; }
  }
`;

// ── Icons ────────────────────────────────────────────────────────────────────
function IconSend({ size = 18, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
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
function IconPlus({ size = 15, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconCopy({ size = 13, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
type UIState = "form" | "submitting" | "sent" | "error";

interface FormData {
  counterparty: string;
  targetEmail: string;
  note: string;
  why_met: string;
  what_discussed: string;
}

interface FormErrors {
  counterparty?: string;
  targetEmail?: string;
}

interface SentReceipt {
  receipt_id: string;
  counterparty: string;
  note: string | null;
  created_at: string;
  confirm_url: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// ── Validation ────────────────────────────────────────────────────────────────
function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.counterparty.trim()) {
    errors.counterparty = "Who are you introducing? This field is required.";
  } else if (data.counterparty.trim().length > 200) {
    errors.counterparty = "Name too long — max 200 characters.";
  }
  if (!data.targetEmail.trim()) {
    errors.targetEmail = "Target email is required to send the confirmation request.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.targetEmail.trim())) {
    errors.targetEmail = "Please enter a valid email address.";
  }
  return errors;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", timeZoneName: "short",
    });
  } catch { return iso; }
}

// ── Component ────────────────────────────────────────────────────────────────
export default function IntroRoomPage({ params }: PageProps) {
  const { id } = use(params);

  const [uiState, setUiState] = useState<UIState>("form");
  const [form, setForm] = useState<FormData>({ counterparty: "", targetEmail: "", note: "", why_met: "", what_discussed: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [receipt, setReceipt] = useState<SentReceipt | null>(null);
  const [copied, setCopied] = useState(false);

  function handleChange(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const newErrors = validate({ ...form, [field]: value });
      setErrors(prev => ({ ...prev, [field]: newErrors[field as keyof FormErrors] }));
    }
  }

  function handleBlur(field: keyof FormData) {
    setTouched(prev => ({ ...prev, [field]: true }));
    const newErrors = validate(form);
    setErrors(prev => ({ ...prev, [field]: newErrors[field as keyof FormErrors] }));
  }

  async function handleSubmit() {
    // Mark all fields touched to show validation
    setTouched({ counterparty: true, targetEmail: true });
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setUiState("submitting");

    try {
      const res = await fetch("/v1/intro-receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counterparty: form.counterparty.trim(),
          note: form.note.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.receipt_id) {
        const confirmUrl = `${window.location.origin}/confirm/${data.receipt_id}`;
        setReceipt({
          receipt_id: data.receipt_id,
          counterparty: data.counterparty,
          note: data.note ?? null,
          created_at: data.created_at,
          confirm_url: confirmUrl,
        });
        setUiState("sent");
      } else {
        setErrorMsg(data.detail ?? "The introduction couldn't be created. Please try again.");
        setUiState("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setUiState("error");
    }
  }

  function handleCopy() {
    if (!receipt) return;
    navigator.clipboard.writeText(receipt.confirm_url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleNewIntro() {
    setForm({ counterparty: "", targetEmail: "", note: "", why_met: "", what_discussed: "" });
    setErrors({});
    setTouched({});
    setReceipt(null);
    setCopied(false);
    setUiState("form");
  }

  const noteLen = form.note.length;
  const isSubmitting = uiState === "submitting";

  return (
    <>
      <style>{styles}</style>
      <main className="intro-page">
        <div className="intro-shell">

          {/* Wordmark */}
          <div className="intro-wordmark">
            <div className="wordmark-mark">TF</div>
            <div className="wordmark-text">True<span>ferral</span></div>
          </div>

          <div className="intro-card">

            {/* ── STATE: form ── */}
            {(uiState === "form" || uiState === "submitting") && (
              <>
                {/* Step indicator */}
                <div className="step-indicator">
                  <div className="step-pip active" />
                  <div className="step-pip" />
                  <div className="step-pip" />
                  <span className="step-label">Create introduction</span>
                </div>

                <h1 className="intro-heading">
                  Make a <span>protected</span><br />introduction
                </h1>
                <p className="intro-subheading">
                  Fill in who you're introducing and why. A confirmation request will be sent to them — no account required on their end.
                </p>

                {/* Counterparty */}
                <div className="field-group">
                  <div className="field-label">
                    Who are you introducing?
                    <span className="field-required">Required</span>
                  </div>
                  <input
                    className={`field-input${errors.counterparty ? " error" : ""}`}
                    type="text"
                    placeholder="e.g. Alex Johnson, CTO at Acme"
                    value={form.counterparty}
                    onChange={e => handleChange("counterparty", e.target.value)}
                    onBlur={() => handleBlur("counterparty")}
                    disabled={isSubmitting}
                    maxLength={220}
                  />
                  {errors.counterparty && (
                    <div className="field-error">{errors.counterparty}</div>
                  )}
                </div>

                {/* Target email */}
                <div className="field-group">
                  <div className="field-label">
                    Their email address
                    <span className="field-required">Required</span>
                  </div>
                  <input
                    className={`field-input${errors.targetEmail ? " error" : ""}`}
                    type="email"
                    placeholder="alex@acme.com"
                    value={form.targetEmail}
                    onChange={e => handleChange("targetEmail", e.target.value)}
                    onBlur={() => handleBlur("targetEmail")}
                    disabled={isSubmitting}
                  />
                  {errors.targetEmail && (
                    <div className="field-error">{errors.targetEmail}</div>
                  )}
                  <div className="field-hint">
                    They'll receive a one-click confirmation link at this address.
                  </div>
                </div>

                {/* Note */}
                <div className="field-group">
                  <div className="field-label">
                    Context for the introduction
                    <span className="field-optional">Optional</span>
                  </div>
                  <textarea
                    className="field-textarea"
                    placeholder="Why is this introduction valuable? What should they know?"
                    value={form.note}
                    onChange={e => handleChange("note", e.target.value)}
                    disabled={isSubmitting}
                    maxLength={1050}
                  />
                  <div className={`char-count${noteLen > 900 ? noteLen > 1000 ? " over" : " warn" : ""}`}>
                    {noteLen}/1000
                  </div>
                </div>


                {/* Why you met */}
                <div className="field-group">
                  <div className="field-label">
                    Why you met
                    <span className="field-optional">Optional</span>
                  </div>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="e.g. Met at SaaStr 2025, worked together at Stripe"
                    value={form.why_met}
                    onChange={e => handleChange("why_met", e.target.value)}
                    disabled={isSubmitting}
                    maxLength={200}
                  />
                  <div className="field-hint">Seeds the intro with relationship context</div>
                </div>

                {/* What was discussed */}
                <div className="field-group">
                  <div className="field-label">
                    What was discussed
                    <span className="field-optional">Optional</span>
                  </div>
                  <textarea
                    className="field-textarea"
                    placeholder="Key topics, shared interests, or specific ask that came up"
                    value={form.what_discussed}
                    onChange={e => handleChange("what_discussed", e.target.value)}
                    disabled={isSubmitting}
                    maxLength={500}
                    style={{ minHeight: 72 }}
                  />
                </div>

                                {/* Trust guarantee */}
                <div className="trust-block">
                  <div className="trust-row">
                    <div className="trust-dot" />
                    <span><strong>Immutable record</strong> — this introduction is permanently logged</span>
                  </div>
                  <div className="trust-row">
                    <div className="trust-dot" />
                    <span><strong>Consent required</strong> — the target confirms before anything happens</span>
                  </div>
                  <div className="trust-row">
                    <div className="trust-dot" />
                    <span><strong>Your reputation protected</strong> — both sides accountable</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  className="btn-send"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? <><div className="spinner" /> Sending confirmation request…</>
                    : <><IconSend size={16} /> Send confirmation request</>
                  }
                </button>

                <p className="send-note">
                  A confirmation link will be sent to {form.targetEmail || "their email"}. No account required for them.
                </p>
              </>
            )}

            {/* ── STATE: sent ── */}
            {uiState === "sent" && receipt && (
              <>
                <div className="sent-icon-wrap">
                  <IconCheck size={30} color={COLORS.green} />
                </div>

                <h1 className="sent-heading">Introduction sent</h1>
                <p className="sent-body">
                  The confirmation request is on its way to {receipt.counterparty}. Once they confirm, the introduction is on record.
                </p>

                {/* Receipt */}
                <div className="receipt-block">
                  <div className="receipt-row">
                    <span className="receipt-label">Receipt ID</span>
                    <span className="receipt-value">{receipt.receipt_id}</span>
                  </div>
                  <div className="receipt-divider" />
                  <div className="receipt-row">
                    <span className="receipt-label">Introducing</span>
                    <span className="receipt-value">{receipt.counterparty}</span>
                  </div>
                  {receipt.note && (
                    <div className="receipt-row">
                      <span className="receipt-label">Context</span>
                      <span className="receipt-value" style={{ fontFamily: "Syne", fontSize: 12 }}>{receipt.note}</span>
                    </div>
                  )}
                  <div className="receipt-divider" />
                  <div className="receipt-row">
                    <span className="receipt-label">Created</span>
                    <span className="receipt-value">{formatTime(receipt.created_at)}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">State</span>
                    <span className="receipt-value" style={{ color: COLORS.yellow }}>AWAITING_CONFIRMATION</span>
                  </div>
                </div>

                {/* Confirm link to share manually */}
                <div className="confirm-link-box">
                  <div className="confirm-link-label">Confirmation link</div>
                  <div className="confirm-link-row">
                    <div className="confirm-link-text">{receipt.confirm_url}</div>
                    <button
                      className={`confirm-link-copy${copied ? " copied" : ""}`}
                      onClick={handleCopy}
                    >
                      {copied ? "Copied ✓" : <><IconCopy size={12} /> Copy</>}
                    </button>
                  </div>
                </div>

                <button className="btn-new" onClick={handleNewIntro}>
                  <IconPlus size={14} />
                  Make another introduction
                </button>
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
                  {errorMsg || "The introduction couldn't be created. Please try again."}
                </p>
                <button className="btn-retry" onClick={handleSubmit}>
                  Try again
                </button>
                <button className="btn-back" onClick={() => setUiState("form")}>
                  ← Edit introduction details
                </button>
              </>
            )}

          </div>
        </div>
      </main>
    </>
  );
}
