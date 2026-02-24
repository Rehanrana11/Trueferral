import { useState, useEffect, useCallback, useRef } from "react";

// ─── DESIGN SYSTEM ───────────────────────────────────────────────
const DS = {
  colors: {
    bg: "#0A0A0B",
    surface: "#111113",
    surfaceHover: "#18181B",
    surfaceActive: "#1F1F23",
    border: "#27272A",
    borderSubtle: "#1C1C1F",
    text: "#FAFAFA",
    textSecondary: "#A1A1AA",
    textTertiary: "#71717A",
    accent: "#10B981",
    accentDim: "rgba(16,185,129,0.12)",
    accentGlow: "rgba(16,185,129,0.25)",
    warning: "#F59E0B",
    warningDim: "rgba(245,158,11,0.12)",
    danger: "#EF4444",
    dangerDim: "rgba(239,68,68,0.12)",
    info: "#3B82F6",
    infoDim: "rgba(59,130,246,0.12)",
    purple: "#8B5CF6",
    purpleDim: "rgba(139,92,246,0.12)",
  },
  font: {
    sans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  radius: { sm: "6px", md: "10px", lg: "14px", xl: "20px", full: "9999px" },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.3)",
    md: "0 4px 12px rgba(0,0,0,0.4)",
    lg: "0 8px 32px rgba(0,0,0,0.5)",
    glow: "0 0 24px rgba(16,185,129,0.15)",
  },
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
};

// ─── STATE MACHINE (from step_18) ────────────────────────────────
const STATES = {
  SNAPSHOT_FROZEN: { label: "Frozen", color: DS.colors.info, bg: DS.colors.infoDim, icon: "❄️" },
  INTRO_CLAIMED: { label: "Intro Claimed", color: DS.colors.purple, bg: DS.colors.purpleDim, icon: "📨" },
  INTRO_CONFIRMED: { label: "Confirmed", color: DS.colors.accent, bg: DS.colors.accentDim, icon: "✓" },
  OUTCOME_SUBMITTED: { label: "Outcome Pending", color: DS.colors.warning, bg: DS.colors.warningDim, icon: "📋" },
  OUTCOME_VERIFIED_SUCCESS: { label: "Verified ✓", color: DS.colors.accent, bg: DS.colors.accentDim, icon: "🏆" },
  OUTCOME_VERIFIED_FAIL: { label: "Failed", color: DS.colors.danger, bg: DS.colors.dangerDim, icon: "✗" },
  TIMED_OUT: { label: "Timed Out", color: DS.colors.textTertiary, bg: "rgba(113,113,122,0.12)", icon: "⏱" },
  DISPUTED: { label: "Disputed", color: DS.colors.danger, bg: DS.colors.dangerDim, icon: "⚠" },
  RESOLVED: { label: "Resolved", color: DS.colors.accent, bg: DS.colors.accentDim, icon: "⚖" },
};

// ─── MOCK DATA ───────────────────────────────────────────────────
const MOCK_SNAPSHOTS = [
  {
    id: "snp_001",
    state: "INTRO_CONFIRMED",
    introducer: "Sarah Chen",
    requester: "Marcus Webb",
    target: "Elena Vasquez",
    purpose: "HIRING",
    success_condition: "HIRE_MADE",
    value_range: "$150K–$220K",
    time_window_days: 45,
    frozen_at: "2026-02-01T14:30:00Z",
    events: [
      { type: "SnapshotCreated", actor: "Marcus Webb", time: "2026-02-01T14:28:00Z" },
      { type: "SnapshotFrozen", actor: "System", time: "2026-02-01T14:30:00Z" },
      { type: "IntroClaimed", actor: "Sarah Chen", time: "2026-02-03T09:15:00Z" },
      { type: "IntroConfirmed", actor: "Elena Vasquez", time: "2026-02-04T11:42:00Z" },
    ],
  },
  {
    id: "snp_002",
    state: "SNAPSHOT_FROZEN",
    introducer: "James Park",
    requester: "Aisha Patel",
    target: "David Kim",
    purpose: "PARTNERSHIP",
    success_condition: "CONTRACT_SIGNED",
    value_range: "$50K–$200K",
    time_window_days: 60,
    frozen_at: "2026-02-15T10:00:00Z",
    events: [
      { type: "SnapshotCreated", actor: "Aisha Patel", time: "2026-02-15T09:55:00Z" },
      { type: "SnapshotFrozen", actor: "System", time: "2026-02-15T10:00:00Z" },
    ],
  },
  {
    id: "snp_003",
    state: "OUTCOME_VERIFIED_SUCCESS",
    introducer: "Rachel Torres",
    requester: "Alex Nguyen",
    target: "Sam Mitchell",
    purpose: "INVESTMENT",
    success_condition: "DEAL_CLOSED",
    value_range: "$500K–$2M",
    time_window_days: 90,
    frozen_at: "2025-12-10T16:00:00Z",
    events: [
      { type: "SnapshotCreated", actor: "Alex Nguyen", time: "2025-12-10T15:50:00Z" },
      { type: "SnapshotFrozen", actor: "System", time: "2025-12-10T16:00:00Z" },
      { type: "IntroClaimed", actor: "Rachel Torres", time: "2025-12-12T08:30:00Z" },
      { type: "IntroConfirmed", actor: "Sam Mitchell", time: "2025-12-13T14:20:00Z" },
      { type: "OutcomeSubmitted", actor: "Alex Nguyen", time: "2026-01-20T10:00:00Z" },
      { type: "OutcomeVerifiedSuccess", actor: "Mutual", time: "2026-01-22T09:00:00Z" },
      { type: "ReputationAdjusted", actor: "System", time: "2026-01-22T09:01:00Z" },
    ],
  },
  {
    id: "snp_004",
    state: "DISPUTED",
    introducer: "Carlos Mendez",
    requester: "Nina Zhao",
    target: "Tom Bradley",
    purpose: "HIRING",
    success_condition: "HIRE_MADE",
    value_range: "$120K–$180K",
    time_window_days: 30,
    frozen_at: "2026-01-05T12:00:00Z",
    events: [
      { type: "SnapshotCreated", actor: "Nina Zhao", time: "2026-01-05T11:55:00Z" },
      { type: "SnapshotFrozen", actor: "System", time: "2026-01-05T12:00:00Z" },
      { type: "IntroClaimed", actor: "Carlos Mendez", time: "2026-01-07T10:30:00Z" },
      { type: "IntroConfirmed", actor: "Tom Bradley", time: "2026-01-08T15:00:00Z" },
      { type: "OutcomeSubmitted", actor: "Nina Zhao", time: "2026-02-01T09:00:00Z" },
      { type: "DisputeOpened", actor: "Carlos Mendez", time: "2026-02-03T11:00:00Z" },
    ],
  },
];

const MOCK_EVENTS_GLOBAL = [
  { id: "evt_012", type: "IntroConfirmed", snapshot: "snp_001", actor: "Elena Vasquez", time: "2026-02-04T11:42:00Z" },
  { id: "evt_011", type: "IntroClaimed", snapshot: "snp_001", actor: "Sarah Chen", time: "2026-02-03T09:15:00Z" },
  { id: "evt_010", type: "DisputeOpened", snapshot: "snp_004", actor: "Carlos Mendez", time: "2026-02-03T11:00:00Z" },
  { id: "evt_009", type: "OutcomeSubmitted", snapshot: "snp_004", actor: "Nina Zhao", time: "2026-02-01T09:00:00Z" },
  { id: "evt_008", type: "SnapshotFrozen", snapshot: "snp_002", actor: "System", time: "2026-02-15T10:00:00Z" },
];

// ─── UTILITY COMPONENTS ──────────────────────────────────────────

function Badge({ state }) {
  const s = STATES[state] || { label: state, color: DS.colors.textTertiary, bg: "rgba(113,113,122,0.12)", icon: "?" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 10px", borderRadius: DS.radius.full,
      background: s.bg, color: s.color,
      fontSize: "12px", fontWeight: 600, letterSpacing: "0.02em",
      border: `1px solid ${s.color}22`,
    }}>
      <span style={{ fontSize: "11px" }}>{s.icon}</span>
      {s.label}
    </span>
  );
}

function StatCard({ label, value, sub, color = DS.colors.accent }) {
  return (
    <div style={{
      background: DS.colors.surface, border: `1px solid ${DS.colors.border}`,
      borderRadius: DS.radius.lg, padding: "20px 24px",
      flex: "1 1 200px", minWidth: "180px",
    }}>
      <div style={{ fontSize: "12px", color: DS.colors.textTertiary, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
        {label}
      </div>
      <div style={{ fontSize: "32px", fontWeight: 700, color, lineHeight: 1, fontFamily: DS.font.mono }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "13px", color: DS.colors.textSecondary, marginTop: "6px" }}>{sub}</div>}
    </div>
  );
}

function Button({ children, variant = "primary", size = "md", onClick, disabled, style: extra }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
    fontFamily: DS.font.sans, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", borderRadius: DS.radius.md, transition: DS.transition,
    opacity: disabled ? 0.4 : 1, letterSpacing: "0.01em",
    fontSize: size === "sm" ? "13px" : "14px",
    padding: size === "sm" ? "6px 12px" : "10px 20px",
  };
  const variants = {
    primary: { background: DS.colors.accent, color: "#000" },
    secondary: { background: DS.colors.surfaceActive, color: DS.colors.text, border: `1px solid ${DS.colors.border}` },
    danger: { background: DS.colors.dangerDim, color: DS.colors.danger, border: `1px solid ${DS.colors.danger}33` },
    ghost: { background: "transparent", color: DS.colors.textSecondary },
  };
  return <button style={{ ...base, ...variants[variant], ...extra }} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Input({ label, value, onChange, placeholder, type = "text", options, style: extra }) {
  const shared = {
    width: "100%", boxSizing: "border-box",
    background: DS.colors.surfaceActive, color: DS.colors.text,
    border: `1px solid ${DS.colors.border}`, borderRadius: DS.radius.md,
    padding: "10px 14px", fontSize: "14px", fontFamily: DS.font.sans,
    outline: "none", transition: DS.transition, ...extra,
  };
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: DS.colors.textSecondary, marginBottom: "6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</label>}
      {options ? (
        <select style={{ ...shared, appearance: "none" }} value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input style={shared} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

// ─── TIMELINE COMPONENT ──────────────────────────────────────────

function EventTimeline({ events }) {
  const typeColors = {
    SnapshotCreated: DS.colors.info,
    SnapshotFrozen: DS.colors.info,
    IntroClaimed: DS.colors.purple,
    IntroConfirmed: DS.colors.accent,
    OutcomeSubmitted: DS.colors.warning,
    OutcomeVerifiedSuccess: DS.colors.accent,
    OutcomeVerifiedFail: DS.colors.danger,
    DisputeOpened: DS.colors.danger,
    DisputeResolved: DS.colors.accent,
    ReputationAdjusted: DS.colors.accent,
  };

  return (
    <div style={{ position: "relative", paddingLeft: "24px" }}>
      <div style={{
        position: "absolute", left: "7px", top: "8px", bottom: "8px", width: "2px",
        background: `linear-gradient(to bottom, ${DS.colors.border}, transparent)`,
      }} />
      {events.map((evt, i) => (
        <div key={i} style={{ position: "relative", paddingBottom: "20px" }}>
          <div style={{
            position: "absolute", left: "-20px", top: "6px", width: "10px", height: "10px",
            borderRadius: "50%", background: typeColors[evt.type] || DS.colors.textTertiary,
            boxShadow: `0 0 8px ${(typeColors[evt.type] || DS.colors.textTertiary)}44`,
          }} />
          <div style={{ fontSize: "13px", fontWeight: 600, color: typeColors[evt.type] || DS.colors.textSecondary }}>
            {evt.type.replace(/([A-Z])/g, " $1").trim()}
          </div>
          <div style={{ fontSize: "12px", color: DS.colors.textTertiary, marginTop: "2px" }}>
            {evt.actor} · {new Date(evt.time).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── STATE MACHINE VISUALIZATION ─────────────────────────────────

function StateMachineView() {
  const nodes = [
    { id: "SNAPSHOT_FROZEN", x: 80, y: 50 },
    { id: "INTRO_CLAIMED", x: 280, y: 50 },
    { id: "INTRO_CONFIRMED", x: 480, y: 50 },
    { id: "OUTCOME_SUBMITTED", x: 480, y: 150 },
    { id: "OUTCOME_VERIFIED_SUCCESS", x: 280, y: 250 },
    { id: "OUTCOME_VERIFIED_FAIL", x: 480, y: 250 },
    { id: "DISPUTED", x: 680, y: 150 },
    { id: "RESOLVED", x: 680, y: 250 },
    { id: "TIMED_OUT", x: 80, y: 250 },
  ];
  const edges = [
    ["SNAPSHOT_FROZEN", "INTRO_CLAIMED"],
    ["INTRO_CLAIMED", "INTRO_CONFIRMED"],
    ["INTRO_CLAIMED", "TIMED_OUT"],
    ["INTRO_CONFIRMED", "OUTCOME_SUBMITTED"],
    ["OUTCOME_SUBMITTED", "OUTCOME_VERIFIED_SUCCESS"],
    ["OUTCOME_SUBMITTED", "OUTCOME_VERIFIED_FAIL"],
    ["OUTCOME_SUBMITTED", "DISPUTED"],
    ["INTRO_CONFIRMED", "DISPUTED"],
    ["DISPUTED", "RESOLVED"],
  ];

  const getNode = id => nodes.find(n => n.id === id);
  return (
    <div style={{ overflowX: "auto", padding: "16px 0" }}>
      <svg viewBox="0 0 820 310" style={{ width: "100%", maxWidth: "820px", height: "auto" }}>
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={DS.colors.textTertiary} />
          </marker>
        </defs>
        {edges.map(([from, to], i) => {
          const a = getNode(from), b = getNode(to);
          return <line key={i} x1={a.x + 60} y1={a.y + 16} x2={b.x} y2={b.y + 16} stroke={DS.colors.border} strokeWidth="1.5" markerEnd="url(#arrowhead)" />;
        })}
        {nodes.map(n => {
          const s = STATES[n.id];
          return (
            <g key={n.id}>
              <rect x={n.x} y={n.y} width="120" height="32" rx="8" fill={s.bg} stroke={s.color} strokeWidth="1" opacity="0.9" />
              <text x={n.x + 60} y={n.y + 20} textAnchor="middle" fill={s.color} fontSize="10" fontWeight="600" fontFamily={DS.font.sans}>{s.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── SNAPSHOT DETAIL PANEL ───────────────────────────────────────

function SnapshotDetail({ snapshot, onBack, onAction }) {
  if (!snapshot) return null;
  const s = STATES[snapshot.state];
  const canClaim = snapshot.state === "SNAPSHOT_FROZEN";
  const canConfirm = snapshot.state === "INTRO_CLAIMED";
  const canSubmitOutcome = snapshot.state === "INTRO_CONFIRMED";
  const canVerify = snapshot.state === "OUTCOME_SUBMITTED";
  const canDispute = ["INTRO_CONFIRMED", "OUTCOME_SUBMITTED"].includes(snapshot.state);

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: DS.colors.textSecondary,
        cursor: "pointer", fontSize: "13px", fontWeight: 500, padding: "0", marginBottom: "20px",
        display: "flex", alignItems: "center", gap: "4px", fontFamily: DS.font.sans,
      }}>
        ← Back to snapshots
      </button>

      {/* Header */}
      <div style={{
        background: DS.colors.surface, border: `1px solid ${DS.colors.border}`,
        borderRadius: DS.radius.lg, padding: "28px", marginBottom: "20px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ fontFamily: DS.font.mono, fontSize: "13px", color: DS.colors.textTertiary }}>{snapshot.id}</span>
              <Badge state={snapshot.state} />
            </div>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: DS.colors.text }}>
              {snapshot.purpose.charAt(0) + snapshot.purpose.slice(1).toLowerCase()} Introduction
            </h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: DS.colors.textTertiary }}>Frozen</div>
            <div style={{ fontSize: "14px", color: DS.colors.textSecondary, fontFamily: DS.font.mono }}>
              {new Date(snapshot.frozen_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* Parties */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {[
          { role: "Introducer", name: snapshot.introducer, color: DS.colors.purple },
          { role: "Requester", name: snapshot.requester, color: DS.colors.info },
          { role: "Target", name: snapshot.target, color: DS.colors.accent },
        ].map(p => (
          <div key={p.role} style={{
            background: DS.colors.surface, border: `1px solid ${DS.colors.border}`,
            borderRadius: DS.radius.md, padding: "16px",
            borderLeft: `3px solid ${p.color}`,
          }}>
            <div style={{ fontSize: "11px", color: DS.colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{p.role}</div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: DS.colors.text, marginTop: "4px" }}>{p.name}</div>
          </div>
        ))}
      </div>

      {/* Terms */}
      <div style={{
        background: DS.colors.surface, border: `1px solid ${DS.colors.border}`,
        borderRadius: DS.radius.lg, padding: "24px", marginBottom: "20px",
      }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: 700, color: DS.colors.text, letterSpacing: "0.02em" }}>
          FROZEN TERMS
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          {[
            { label: "Purpose", value: snapshot.purpose },
            { label: "Success Condition", value: snapshot.success_condition.replace(/_/g, " ") },
            { label: "Value Range", value: snapshot.value_range },
            { label: "Time Window", value: `${snapshot.time_window_days} days` },
          ].map(t => (
            <div key={t.label}>
              <div style={{ fontSize: "11px", color: DS.colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{t.label}</div>
              <div style={{ fontSize: "14px", color: DS.colors.text, fontWeight: 500, fontFamily: DS.font.mono }}>{t.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{
        background: DS.colors.surface, border: `1px solid ${DS.colors.border}`,
        borderRadius: DS.radius.lg, padding: "24px", marginBottom: "20px",
      }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: 700, color: DS.colors.text }}>AVAILABLE ACTIONS</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <Button variant={canClaim ? "primary" : "secondary"} disabled={!canClaim} onClick={() => onAction("claim", snapshot.id)}>
            📨 Claim Intro
          </Button>
          <Button variant={canConfirm ? "primary" : "secondary"} disabled={!canConfirm} onClick={() => onAction("confirm", snapshot.id)}>
            ✓ Confirm Intro
          </Button>
          <Button variant={canSubmitOutcome ? "primary" : "secondary"} disabled={!canSubmitOutcome} onClick={() => onAction("outcome", snapshot.id)}>
            📋 Submit Outcome
          </Button>
          <Button variant={canVerify ? "primary" : "secondary"} disabled={!canVerify} onClick={() => onAction("verify", snapshot.id)}>
            🏆 Verify Outcome
          </Button>
          <Button variant="danger" disabled={!canDispute} onClick={() => onAction("dispute", snapshot.id)}>
            ⚠ Open Dispute
          </Button>
        </div>
      </div>

      {/* Event Log */}
      <div style={{
        background: DS.colors.surface, border: `1px solid ${DS.colors.border}`,
        borderRadius: DS.radius.lg, padding: "24px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: DS.colors.text }}>
            IMMUTABLE EVENT LOG
          </h3>
          <span style={{ fontSize: "12px", color: DS.colors.textTertiary, fontFamily: DS.font.mono }}>
            {snapshot.events.length} events · hash-chained
          </span>
        </div>
        <EventTimeline events={snapshot.events} />
      </div>
    </div>
  );
}

// ─── CREATE SNAPSHOT FORM ────────────────────────────────────────

function CreateSnapshotForm({ onClose, onCreate }) {
  const [form, setForm] = useState({
    target: "", purpose: "HIRING", success_condition: "HIRE_MADE",
    value_min: "", value_max: "", time_window_days: "45",
  });
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px",
    }}>
      <div style={{
        background: DS.colors.surface, border: `1px solid ${DS.colors.border}`,
        borderRadius: DS.radius.xl, padding: "32px", width: "100%", maxWidth: "520px",
        boxShadow: DS.shadow.lg, animation: "fadeIn 0.2s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: DS.colors.text }}>Create Snapshot</h2>
          <button onClick={onClose} style={{
            background: DS.colors.surfaceActive, border: "none", color: DS.colors.textSecondary,
            width: "28px", height: "28px", borderRadius: DS.radius.sm, cursor: "pointer", fontSize: "16px",
          }}>×</button>
        </div>

        <div style={{
          background: DS.colors.accentDim, border: `1px solid ${DS.colors.accent}22`,
          borderRadius: DS.radius.md, padding: "12px 16px", marginBottom: "24px",
          fontSize: "13px", color: DS.colors.accent, lineHeight: 1.5,
        }}>
          Once frozen, these terms become immutable. The Event Log records this commitment permanently.
        </div>

        <Input label="Target Name / Email" value={form.target} onChange={v => update("target", v)} placeholder="elena@company.com" />
        <Input label="Purpose" value={form.purpose} onChange={v => update("purpose", v)} options={[
          { value: "HIRING", label: "Hiring" }, { value: "PARTNERSHIP", label: "Partnership" },
          { value: "INVESTMENT", label: "Investment" }, { value: "SALES", label: "Sales" },
        ]} />
        <Input label="Success Condition" value={form.success_condition} onChange={v => update("success_condition", v)} options={[
          { value: "HIRE_MADE", label: "Hire Made" }, { value: "CONTRACT_SIGNED", label: "Contract Signed" },
          { value: "DEAL_CLOSED", label: "Deal Closed" }, { value: "MEETING_HELD", label: "Meeting Held" },
        ]} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <Input label="Value Min ($)" value={form.value_min} onChange={v => update("value_min", v)} placeholder="50000" type="number" />
          <Input label="Value Max ($)" value={form.value_max} onChange={v => update("value_max", v)} placeholder="200000" type="number" />
        </div>
        <Input label="Time Window (Days)" value={form.time_window_days} onChange={v => update("time_window_days", v)} type="number" />

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button variant="primary" onClick={() => { onCreate(form); onClose(); }} style={{ flex: 1 }}>
            Create & Freeze
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────

function Sidebar({ active, onNavigate }) {
  const items = [
    { id: "dashboard", icon: "◎", label: "Dashboard" },
    { id: "snapshots", icon: "◇", label: "Snapshots" },
    { id: "events", icon: "≡", label: "Event Log" },
    { id: "state-machine", icon: "⎔", label: "State Machine" },
    { id: "health", icon: "♡", label: "System Health" },
  ];

  return (
    <div style={{
      width: "220px", minHeight: "100vh", background: DS.colors.surface,
      borderRight: `1px solid ${DS.colors.border}`, padding: "0",
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: "24px 20px", borderBottom: `1px solid ${DS.colors.borderSubtle}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: DS.radius.md,
            background: `linear-gradient(135deg, ${DS.colors.accent}, ${DS.colors.info})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: 800, color: "#000",
          }}>IF</div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: DS.colors.text, letterSpacing: "-0.01em" }}>IntroFlow</div>
            <div style={{ fontSize: "11px", color: DS.colors.textTertiary, fontFamily: DS.font.mono }}>Trust Engine v1</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "12px 8px", flex: 1 }}>
        {items.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 14px", marginBottom: "2px",
            background: active === item.id ? DS.colors.surfaceActive : "transparent",
            border: active === item.id ? `1px solid ${DS.colors.border}` : "1px solid transparent",
            borderRadius: DS.radius.md, cursor: "pointer", transition: DS.transition,
            color: active === item.id ? DS.colors.text : DS.colors.textSecondary,
            fontFamily: DS.font.sans, fontSize: "13px", fontWeight: 500,
            textAlign: "left",
          }}>
            <span style={{ fontSize: "16px", width: "20px", textAlign: "center", opacity: active === item.id ? 1 : 0.6 }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: "16px 20px", borderTop: `1px solid ${DS.colors.borderSubtle}`,
        fontSize: "11px", color: DS.colors.textTertiary, fontFamily: DS.font.mono,
      }}>
        RC_1.0_0 · 72 tests ✓
      </div>
    </div>
  );
}

// ─── MAIN VIEWS ──────────────────────────────────────────────────

function DashboardView({ snapshots, onNavigate }) {
  const active = snapshots.filter(s => !["OUTCOME_VERIFIED_SUCCESS", "OUTCOME_VERIFIED_FAIL", "TIMED_OUT", "RESOLVED"].includes(s.state));
  const completed = snapshots.filter(s => ["OUTCOME_VERIFIED_SUCCESS", "RESOLVED"].includes(s.state));
  const disputed = snapshots.filter(s => s.state === "DISPUTED");

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ margin: "0 0 4px 0", fontSize: "28px", fontWeight: 800, color: DS.colors.text, letterSpacing: "-0.02em" }}>
          Trust Engine
        </h1>
        <p style={{ margin: 0, fontSize: "14px", color: DS.colors.textSecondary }}>
          Behavioral validation — Sprint 1
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "32px" }}>
        <StatCard label="Active Referrals" value={active.length} sub="In progress" color={DS.colors.info} />
        <StatCard label="Verified Success" value={completed.length} sub="Outcomes confirmed" color={DS.colors.accent} />
        <StatCard label="Open Disputes" value={disputed.length} sub="Awaiting resolution" color={DS.colors.danger} />
        <StatCard label="Total Events" value={snapshots.reduce((a, s) => a + s.events.length, 0)} sub="Immutable log entries" color={DS.colors.purple} />
      </div>

      {/* Pipeline */}
      <div style={{
        background: DS.colors.surface, border: `1px solid ${DS.colors.border}`,
        borderRadius: DS.radius.lg, padding: "24px", marginBottom: "24px",
      }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "14px", fontWeight: 700, color: DS.colors.text, letterSpacing: "0.02em" }}>
          TRUST PIPELINE
        </h3>
        <div style={{ display: "flex", gap: "2px", borderRadius: DS.radius.md, overflow: "hidden", height: "36px" }}>
          {Object.keys(STATES).map(state => {
            const count = snapshots.filter(s => s.state === state).length;
            if (count === 0) return null;
            const st = STATES[state];
            return (
              <div key={state} style={{
                flex: count, background: st.bg, display: "flex", alignItems: "center",
                justifyContent: "center", gap: "4px", fontSize: "11px",
                fontWeight: 600, color: st.color, minWidth: "60px",
                borderTop: `2px solid ${st.color}`,
              }}>
                {st.icon} {count}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Events */}
      <div style={{
        background: DS.colors.surface, border: `1px solid ${DS.colors.border}`,
        borderRadius: DS.radius.lg, padding: "24px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: DS.colors.text }}>RECENT EVENTS</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("events")}>View all →</Button>
        </div>
        {MOCK_EVENTS_GLOBAL.slice(0, 5).map(evt => (
          <div key={evt.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 0", borderBottom: `1px solid ${DS.colors.borderSubtle}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontFamily: DS.font.mono, color: DS.colors.textTertiary }}>{evt.id}</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: DS.colors.text }}>{evt.type.replace(/([A-Z])/g, " $1").trim()}</span>
            </div>
            <div style={{ fontSize: "12px", color: DS.colors.textTertiary }}>
              {evt.actor} · {new Date(evt.time).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SnapshotsView({ snapshots, onSelect }) {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter === "ALL" ? snapshots : snapshots.filter(s => s.state === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: DS.colors.text }}>Snapshots</h1>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
        {["ALL", ...Object.keys(STATES)].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "6px 12px", borderRadius: DS.radius.full,
            background: filter === s ? DS.colors.surfaceActive : "transparent",
            border: `1px solid ${filter === s ? DS.colors.border : DS.colors.borderSubtle}`,
            color: filter === s ? DS.colors.text : DS.colors.textTertiary,
            fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: DS.font.sans,
          }}>
            {s === "ALL" ? "All" : (STATES[s]?.label || s)}
          </button>
        ))}
      </div>

      {/* Snapshot cards */}
      {filtered.map(snap => (
        <div key={snap.id} onClick={() => onSelect(snap)} style={{
          background: DS.colors.surface, border: `1px solid ${DS.colors.border}`,
          borderRadius: DS.radius.lg, padding: "20px", marginBottom: "10px",
          cursor: "pointer", transition: DS.transition,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = DS.colors.accent + "44"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = DS.colors.border; }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span style={{ fontFamily: DS.font.mono, fontSize: "12px", color: DS.colors.textTertiary }}>{snap.id}</span>
                <Badge state={snap.state} />
              </div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: DS.colors.text }}>
                {snap.introducer} → {snap.target}
              </div>
              <div style={{ fontSize: "13px", color: DS.colors.textSecondary, marginTop: "4px" }}>
                {snap.purpose} · {snap.success_condition.replace(/_/g, " ")} · {snap.value_range}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: DS.colors.textTertiary }}>{snap.events.length} events</div>
              <div style={{ fontSize: "12px", color: DS.colors.textTertiary, fontFamily: DS.font.mono, marginTop: "2px" }}>
                {snap.time_window_days}d window
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventLogView() {
  const allEvents = MOCK_SNAPSHOTS.flatMap(s => s.events.map(e => ({ ...e, snapshot_id: s.id })))
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: 800, color: DS.colors.text }}>Event Log</h1>
        <p style={{ margin: 0, fontSize: "13px", color: DS.colors.textTertiary }}>
          Immutable, append-only, hash-chained — primary system of record
        </p>
      </div>

      <div style={{
        background: DS.colors.surface, border: `1px solid ${DS.colors.border}`,
        borderRadius: DS.radius.lg, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "100px 1fr 120px 100px 180px",
          padding: "12px 20px", background: DS.colors.surfaceActive,
          borderBottom: `1px solid ${DS.colors.border}`,
          fontSize: "11px", fontWeight: 700, color: DS.colors.textTertiary,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          <span>Snapshot</span><span>Event Type</span><span>Actor</span><span>Hash</span><span>Timestamp</span>
        </div>

        {allEvents.map((evt, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "100px 1fr 120px 100px 180px",
            padding: "12px 20px", borderBottom: `1px solid ${DS.colors.borderSubtle}`,
            fontSize: "13px", alignItems: "center",
            transition: DS.transition,
          }}
            onMouseEnter={e => e.currentTarget.style.background = DS.colors.surfaceHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ fontFamily: DS.font.mono, color: DS.colors.textTertiary, fontSize: "12px" }}>{evt.snapshot_id}</span>
            <span style={{ fontWeight: 600, color: DS.colors.text }}>{evt.type.replace(/([A-Z])/g, " $1").trim()}</span>
            <span style={{ color: DS.colors.textSecondary }}>{evt.actor}</span>
            <span style={{ fontFamily: DS.font.mono, color: DS.colors.textTertiary, fontSize: "11px" }}>
              {Math.random().toString(36).substring(2, 8)}…
            </span>
            <span style={{ fontFamily: DS.font.mono, color: DS.colors.textTertiary, fontSize: "12px" }}>
              {new Date(evt.time).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HealthView() {
  const checks = [
    { name: "Database (PostgreSQL)", status: "ok", latency: "3ms" },
    { name: "Event Log Integrity", status: "ok", latency: "12ms" },
    { name: "Hash Chain Valid", status: "ok", latency: "8ms" },
    { name: "Doctor.py Gate", status: "ok", latency: "—" },
    { name: "Pytest Suite", status: "ok", latency: "72/72 pass" },
  ];

  return (
    <div>
      <h1 style={{ margin: "0 0 24px 0", fontSize: "24px", fontWeight: 800, color: DS.colors.text }}>System Health</h1>

      <div style={{
        background: DS.colors.surface, border: `1px solid ${DS.colors.accent}33`,
        borderRadius: DS.radius.lg, padding: "28px", marginBottom: "24px",
        borderLeft: `4px solid ${DS.colors.accent}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "50%",
            background: DS.colors.accentDim, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "20px",
            boxShadow: `0 0 16px ${DS.colors.accentGlow}`,
          }}>✓</div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: DS.colors.accent }}>All Systems Operational</div>
            <div style={{ fontSize: "13px", color: DS.colors.textSecondary, fontFamily: DS.font.mono }}>
              v1.0.0 · RC_1.0_0 · {new Date().toISOString().slice(0, 19)}Z
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background: DS.colors.surface, border: `1px solid ${DS.colors.border}`,
        borderRadius: DS.radius.lg, overflow: "hidden",
      }}>
        {checks.map((c, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 24px", borderBottom: i < checks.length - 1 ? `1px solid ${DS.colors.borderSubtle}` : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: c.status === "ok" ? DS.colors.accent : DS.colors.danger,
                boxShadow: `0 0 6px ${c.status === "ok" ? DS.colors.accentGlow : DS.colors.danger}44`,
              }} />
              <span style={{ fontSize: "14px", fontWeight: 500, color: DS.colors.text }}>{c.name}</span>
            </div>
            <span style={{ fontSize: "13px", fontFamily: DS.font.mono, color: DS.colors.textTertiary }}>{c.latency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("dashboard");
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [snapshots, setSnapshots] = useState(MOCK_SNAPSHOTS);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleAction = (action, snapshotId) => {
    const labels = {
      claim: "Intro Claimed — IntroClaimed event appended",
      confirm: "Intro Confirmed — IntroConfirmed event appended",
      outcome: "Outcome Submitted — OutcomeSubmitted event appended",
      verify: "Outcome Verified — OutcomeVerifiedSuccess event appended",
      dispute: "Dispute Opened — DisputeOpened event appended",
    };
    showToast(labels[action] || `${action} executed on ${snapshotId}`);
  };

  const handleCreate = (form) => {
    showToast("Snapshot Created & Frozen — 2 events appended to Event Log");
  };

  const navigate = (v) => { setView(v); setSelectedSnapshot(null); };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: DS.colors.bg, fontFamily: DS.font.sans, color: DS.colors.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; background: ${DS.colors.bg}; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${DS.colors.border}; border-radius: 3px; }
        ::selection { background: ${DS.colors.accentDim}; color: ${DS.colors.accent}; }
      `}</style>

      <Sidebar active={view} onNavigate={navigate} />

      <main style={{ flex: 1, padding: "32px 40px", maxWidth: "1000px", overflow: "auto" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px", gap: "10px" }}>
          <Button variant="primary" onClick={() => setShowCreate(true)}>+ Create Snapshot</Button>
        </div>

        {view === "dashboard" && <DashboardView snapshots={snapshots} onNavigate={navigate} />}
        {view === "snapshots" && !selectedSnapshot && (
          <SnapshotsView snapshots={snapshots} onSelect={s => { setSelectedSnapshot(s); }} />
        )}
        {view === "snapshots" && selectedSnapshot && (
          <SnapshotDetail snapshot={selectedSnapshot} onBack={() => setSelectedSnapshot(null)} onAction={handleAction} />
        )}
        {view === "events" && <EventLogView />}
        {view === "state-machine" && (
          <div>
            <h1 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: 800, color: DS.colors.text }}>State Machine</h1>
            <p style={{ margin: "0 0 24px 0", fontSize: "13px", color: DS.colors.textTertiary }}>
              Deterministic transitions derived from Event Log — no direct state mutation
            </p>
            <div style={{ background: DS.colors.surface, border: `1px solid ${DS.colors.border}`, borderRadius: DS.radius.lg, padding: "24px" }}>
              <StateMachineView />
            </div>
            <div style={{ marginTop: "24px", background: DS.colors.surface, border: `1px solid ${DS.colors.border}`, borderRadius: DS.radius.lg, padding: "24px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "14px", fontWeight: 700, color: DS.colors.text }}>TRANSITION RULES</h3>
              {[
                { from: "SNAPSHOT_FROZEN", to: "INTRO_CLAIMED", trigger: "Introducer claims intro sent", actor: "INTRODUCER" },
                { from: "INTRO_CLAIMED", to: "INTRO_CONFIRMED", trigger: "Target/Requester confirms receipt", actor: "TARGET / REQUESTER" },
                { from: "INTRO_CLAIMED", to: "TIMED_OUT", trigger: "7-day confirmation window expires", actor: "SYSTEM" },
                { from: "INTRO_CONFIRMED", to: "OUTCOME_SUBMITTED", trigger: "Evidence submitted", actor: "REQUESTER / TARGET" },
                { from: "OUTCOME_SUBMITTED", to: "OUTCOME_VERIFIED_SUCCESS", trigger: "Mutual/Admin verification", actor: "MUTUAL / ADMIN" },
                { from: "OUTCOME_SUBMITTED", to: "OUTCOME_VERIFIED_FAIL", trigger: "Verification fails", actor: "MUTUAL / ADMIN" },
                { from: "OUTCOME_SUBMITTED", to: "DISPUTED", trigger: "Outcome contested", actor: "ANY PARTY" },
                { from: "DISPUTED", to: "RESOLVED", trigger: "Admin applies immutable rule", actor: "ADMIN" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", borderBottom: `1px solid ${DS.colors.borderSubtle}`, flexWrap: "wrap" }}>
                  <Badge state={r.from} />
                  <span style={{ color: DS.colors.textTertiary }}>→</span>
                  <Badge state={r.to} />
                  <span style={{ flex: 1, fontSize: "13px", color: DS.colors.textSecondary, marginLeft: "8px" }}>{r.trigger}</span>
                  <span style={{ fontSize: "11px", fontFamily: DS.font.mono, color: DS.colors.textTertiary }}>{r.actor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === "health" && <HealthView />}
      </main>

      {showCreate && <CreateSnapshotForm onClose={() => setShowCreate(false)} onCreate={handleCreate} />}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 2000,
          background: toast.type === "success" ? DS.colors.accentDim : DS.colors.dangerDim,
          border: `1px solid ${toast.type === "success" ? DS.colors.accent : DS.colors.danger}33`,
          color: toast.type === "success" ? DS.colors.accent : DS.colors.danger,
          padding: "14px 20px", borderRadius: DS.radius.md,
          fontSize: "13px", fontWeight: 600, boxShadow: DS.shadow.lg,
          animation: "fadeIn 0.2s ease", maxWidth: "440px",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}