"use client";
import { useState } from "react";

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

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'Syne', sans-serif; }
  
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }

  .app { display: flex; height: 100vh; overflow: hidden; }

  /* Sidebar */
  .sidebar {
    width: 220px; min-width: 220px;
    background: ${COLORS.surface};
    border-right: 1px solid ${COLORS.border};
    display: flex; flex-direction: column;
    padding: 0;
    position: relative;
    z-index: 10;
  }
  .sidebar::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 1px; height: 100%;
    background: linear-gradient(to bottom, transparent, ${COLORS.accent}44, transparent);
  }
  .logo {
    padding: 28px 20px 24px;
    display: flex; align-items: center; gap: 10px;
    border-bottom: 1px solid ${COLORS.border};
  }
  .logo-mark {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, ${COLORS.accent}, #9b5de5);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 800; color: white;
    box-shadow: 0 0 16px ${COLORS.accentGlow};
  }
  .logo-text { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
  .logo-text span { color: ${COLORS.accent}; }

  .nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }
  .nav-section { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; color: ${COLORS.muted}; padding: 12px 8px 6px; text-transform: uppercase; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: 8px; cursor: pointer;
    font-size: 13.5px; font-weight: 500; color: ${COLORS.muted};
    transition: all 0.15s ease; position: relative;
  }
  .nav-item:hover { background: ${COLORS.card}; color: ${COLORS.text}; }
  .nav-item.active {
    background: ${COLORS.accentGlow};
    color: ${COLORS.accent};
    font-weight: 600;
  }
  .nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 50%; transform: translateY(-50%);
    width: 3px; height: 18px; border-radius: 0 3px 3px 0;
    background: ${COLORS.accent};
    box-shadow: 0 0 8px ${COLORS.accent};
  }
  .nav-badge {
    margin-left: auto; background: ${COLORS.accent};
    color: white; font-size: 10px; font-weight: 700;
    padding: 1px 6px; border-radius: 10px;
  }

  .sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid ${COLORS.border};
  }
  .user-pill {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 8px; cursor: pointer;
    transition: background 0.15s;
  }
  .user-pill:hover { background: ${COLORS.card}; }
  .avatar {
    width: 30px; height: 30px; border-radius: 50%;
    background: linear-gradient(135deg, ${COLORS.accent}, #9b5de5);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: white; flex-shrink: 0;
  }
  .user-name { font-size: 13px; font-weight: 600; }
  .user-role { font-size: 11px; color: ${COLORS.muted}; }

  /* Main */
  .main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 28px;
    border-bottom: 1px solid ${COLORS.border};
    background: ${COLORS.surface};
    position: sticky; top: 0; z-index: 5;
  }
  .page-title { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
  .topbar-actions { display: flex; align-items: center; gap: 10px; }

  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 8px; font-size: 13px;
    font-family: 'Syne', sans-serif; font-weight: 600; cursor: pointer;
    transition: all 0.15s ease; border: none; outline: none;
  }
  .btn-primary {
    background: ${COLORS.accent};
    color: white;
    box-shadow: 0 0 20px ${COLORS.accentGlow};
  }
  .btn-primary:hover { background: ${COLORS.accentHover}; box-shadow: 0 0 28px ${COLORS.accentGlow}; }
  .btn-ghost {
    background: transparent; color: ${COLORS.muted};
    border: 1px solid ${COLORS.border};
  }
  .btn-ghost:hover { background: ${COLORS.card}; color: ${COLORS.text}; border-color: ${COLORS.subtle}; }

  .content { padding: 28px; flex: 1; }

  /* Cards */
  .card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 12px; padding: 20px;
    transition: border-color 0.2s;
  }
  .card:hover { border-color: ${COLORS.subtle}; }

  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { position: relative; overflow: hidden; }
  .stat-label { font-size: 12px; font-weight: 500; color: ${COLORS.muted}; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.8px; }
  .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -1px; line-height: 1; margin-bottom: 8px; }
  .stat-change { font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 4px; font-family: 'DM Mono', monospace; }
  .stat-change.up { color: ${COLORS.green}; }
  .stat-change.down { color: ${COLORS.red}; }
  .stat-glow {
    position: absolute; top: -30px; right: -30px;
    width: 80px; height: 80px; border-radius: 50%;
    opacity: 0.15; filter: blur(20px);
  }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .grid-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }

  .card-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .card-subtitle { font-size: 12px; color: ${COLORS.muted}; margin-bottom: 18px; }

  /* Chart bars */
  .chart-bars { display: flex; align-items: flex-end; gap: 6px; height: 100px; }
  .bar-group { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
  .bar {
    width: 100%; border-radius: 4px 4px 0 0;
    transition: opacity 0.2s; cursor: pointer;
  }
  .bar:hover { opacity: 0.8; }
  .bar-label { font-size: 10px; color: ${COLORS.muted}; font-family: 'DM Mono', monospace; }

  /* Table */
  .table { width: 100%; border-collapse: collapse; }
  .table th {
    text-align: left; padding: 8px 14px;
    font-size: 11px; font-weight: 600; letter-spacing: 1px;
    color: ${COLORS.muted}; text-transform: uppercase;
    border-bottom: 1px solid ${COLORS.border};
  }
  .table td {
    padding: 12px 14px; font-size: 13.5px;
    border-bottom: 1px solid ${COLORS.border}8a;
  }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: ${COLORS.surface}; }

  .badge {
    display: inline-flex; align-items: center;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; font-family: 'DM Mono', monospace;
  }
  .badge-green { background: ${COLORS.greenGlow}; color: ${COLORS.green}; border: 1px solid ${COLORS.green}33; }
  .badge-yellow { background: #ffd16615; color: ${COLORS.yellow}; border: 1px solid ${COLORS.yellow}33; }
  .badge-red { background: #ff4d6a15; color: ${COLORS.red}; border: 1px solid ${COLORS.red}33; }
  .badge-blue { background: ${COLORS.accentGlow}; color: ${COLORS.accent}; border: 1px solid ${COLORS.accent}33; }

  .mono { font-family: 'DM Mono', monospace; font-size: 12px; color: ${COLORS.muted}; }

  /* Activity feed */
  .activity-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid ${COLORS.border}44; }
  .activity-item:last-child { border-bottom: none; }
  .activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
  .activity-text { font-size: 13px; line-height: 1.4; }
  .activity-time { font-size: 11px; color: ${COLORS.muted}; font-family: 'DM Mono', monospace; margin-top: 2px; }

  /* Progress */
  .progress-track { height: 6px; background: ${COLORS.border}; border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }

  /* Form */
  .form-group { margin-bottom: 18px; }
  .form-label { font-size: 12px; font-weight: 600; color: ${COLORS.muted}; margin-bottom: 6px; display: block; letter-spacing: 0.5px; text-transform: uppercase; }
  .form-input {
    width: 100%; padding: 10px 14px;
    background: ${COLORS.surface}; border: 1px solid ${COLORS.border};
    border-radius: 8px; color: ${COLORS.text};
    font-family: 'Syne', sans-serif; font-size: 14px;
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
  }
  .form-input:focus { border-color: ${COLORS.accent}; box-shadow: 0 0 0 3px ${COLORS.accentGlow}; }
  .form-input::placeholder { color: ${COLORS.muted}; }

  /* Toggle */
  .toggle { position: relative; display: inline-block; width: 38px; height: 20px; }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .slider {
    position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
    background: ${COLORS.border}; border-radius: 20px; transition: 0.2s;
  }
  .slider:before {
    content: ''; position: absolute; height: 14px; width: 14px;
    left: 3px; bottom: 3px; background: ${COLORS.muted};
    border-radius: 50%; transition: 0.2s;
  }
  input:checked + .slider { background: ${COLORS.accent}; box-shadow: 0 0 8px ${COLORS.accentGlow}; }
  input:checked + .slider:before { transform: translateX(18px); background: white; }

  /* Login page */
  .login-page {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: ${COLORS.bg};
    position: relative; overflow: hidden;
  }
  .login-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 0%, ${COLORS.accentGlow}, transparent),
                radial-gradient(ellipse 40% 40% at 80% 80%, #9b5de522, transparent);
  }
  .login-grid {
    position: absolute; inset: 0; opacity: 0.03;
    background-image: linear-gradient(${COLORS.text} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.text} 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .login-card {
    position: relative; z-index: 2;
    width: 400px; padding: 40px;
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 16px;
    box-shadow: 0 40px 80px #00000080, 0 0 0 1px ${COLORS.accentGlow};
  }
  .login-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
  .login-title { font-size: 24px; font-weight: 800; margin-bottom: 6px; letter-spacing: -0.5px; }
  .login-subtitle { font-size: 13px; color: ${COLORS.muted}; margin-bottom: 28px; }
  .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: ${COLORS.muted}; font-size: 12px; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: ${COLORS.border}; }

  /* Referral link box */
  .ref-link {
    display: flex; align-items: center; gap: 0;
    background: ${COLORS.surface}; border: 1px solid ${COLORS.border};
    border-radius: 8px; overflow: hidden;
  }
  .ref-link-text {
    flex: 1; padding: 10px 14px;
    font-family: 'DM Mono', monospace; font-size: 12px; color: ${COLORS.muted};
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .ref-link-btn {
    padding: 10px 14px; background: ${COLORS.accent}22;
    color: ${COLORS.accent}; font-size: 12px; font-weight: 600;
    cursor: pointer; border-left: 1px solid ${COLORS.border};
    transition: background 0.15s; white-space: nowrap;
  }
  .ref-link-btn:hover { background: ${COLORS.accentGlow}; }

  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  
  /* Donut chart */
  .donut-wrap { display: flex; align-items: center; gap: 20px; }
  .donut-legend { display: flex; flex-direction: column; gap: 10px; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
`;

// Icons
const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm4 10v-2a4 4 0 0 0-3-3.87",
    link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0v3m0-12V3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12M1 12h3m16 0h3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12",
    chart: "M18 20V10M12 20V4M6 20v-6",
    bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
    search: "m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z",
    copy: "M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 0 2 2v1",
    plus: "M12 5v14M5 12h14",
    arrow_up: "M18 15l-6-6-6 6",
    arrow_down: "M6 9l6 6 6-6",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    gift: "M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
    key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[name]} />
    </svg>
  );
};

// ─── LOGIN ────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-grid" />
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-mark">TF</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>True<span style={{ color: COLORS.accent }}>ferral</span></div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>Referral Intelligence Platform</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: COLORS.surface, padding: 4, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
          {["login", "signup"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "8px 0", border: "none", borderRadius: 7, cursor: "pointer",
              fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13,
              background: tab === t ? COLORS.accent : "transparent",
              color: tab === t ? "white" : COLORS.muted,
              transition: "all 0.15s",
            }}>
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {tab === "signup" && (
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input className="form-input" type="text" placeholder="Acme Corp" />
          </div>
        )}

        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: 14, marginTop: 4 }} onClick={onLogin}>
          {tab === "login" ? "Sign In to Dashboard" : "Create Account"}
          <Icon name="arrow_down" size={14} />
        </button>

        <div className="divider">or continue with</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Google", "GitHub"].map(p => (
            <button key={p} className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>{p}</button>
          ))}
        </div>

        {tab === "login" && (
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: COLORS.muted }}>
            Forgot password? <span style={{ color: COLORS.accent, cursor: "pointer" }}>Reset it</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────
function Dashboard() {
  const stats = [
    { label: "Total Referrals", value: "2,847", change: "+12.4%", up: true, color: COLORS.accent },
    { label: "Active Referrers", value: "394", change: "+8.1%", up: true, color: COLORS.green },
    { label: "Conversions", value: "1,203", change: "+18.9%", up: true, color: "#9b5de5" },
    { label: "Revenue Attributed", value: "$48.2K", change: "-2.3%", up: false, color: COLORS.yellow },
  ];

  const bars = [
    { label: "Jan", h1: 40, h2: 25 }, { label: "Feb", h1: 65, h2: 40 },
    { label: "Mar", h1: 55, h2: 35 }, { label: "Apr", h1: 80, h2: 50 },
    { label: "May", h1: 70, h2: 60 }, { label: "Jun", h1: 90, h2: 70 },
    { label: "Jul", h1: 75, h2: 55 },
  ];

  const activity = [
    { text: "Sarah K. joined via referral link from Mike T.", time: "2m ago", color: COLORS.green },
    { text: "New conversion: Plan Pro — $99/mo attributed to ref #2847", time: "11m ago", color: COLORS.accent },
    { text: "David L. shared referral link — 3 clicks so far", time: "34m ago", color: "#9b5de5" },
    { text: "Payout processed: $240 to James R.", time: "1h ago", color: COLORS.yellow },
    { text: "Fraud flag: suspicious referral pattern detected on acc #4421", time: "2h ago", color: COLORS.red },
  ];

  const topReferrers = [
    { name: "Mike Thompson", refs: 124, conv: 89, earned: "$2,140" },
    { name: "Sarah Johnson", refs: 98, conv: 72, earned: "$1,890" },
    { name: "James Rodriguez", refs: 87, conv: 65, earned: "$1,650" },
    { name: "Emily Chen", refs: 76, conv: 58, earned: "$1,420" },
  ];

  return (
    <div className="content">
      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div className="card stat-card" key={i}>
            <div className="stat-glow" style={{ background: s.color }} />
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className={`stat-change ${s.up ? "up" : "down"}`}>
              <Icon name={s.up ? "arrow_up" : "arrow_down"} size={12} />
              {s.change} vs last month
            </div>
          </div>
        ))}
      </div>

      <div className="grid-3">
        {/* Chart */}
        <div className="card">
          <div className="card-title">Referral Activity</div>
          <div className="card-subtitle">Referrals vs Conversions — last 7 months</div>
          <div className="chart-bars">
            {bars.map((b, i) => (
              <div className="bar-group" key={i}>
                <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 90 }}>
                  <div className="bar" style={{ height: b.h1, background: COLORS.accent, opacity: 0.9, width: 12 }} />
                  <div className="bar" style={{ height: b.h2, background: "#9b5de5", opacity: 0.7, width: 12 }} />
                </div>
                <div className="bar-label">{b.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.muted }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS.accent }} /> Referrals
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.muted }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "#9b5de5" }} /> Conversions
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="card">
          <div className="card-title">Conversion Funnel</div>
          <div className="card-subtitle">This month</div>
          {[
            { label: "Link Clicks", val: 5840, pct: 100, color: COLORS.accent },
            { label: "Signups", val: 2847, pct: 49, color: "#9b5de5" },
            { label: "Verified", val: 1890, pct: 32, color: COLORS.green },
            { label: "Converted", val: 1203, pct: 21, color: COLORS.yellow },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: COLORS.muted }}>{item.label}</span>
                <span style={{ fontFamily: "DM Mono, monospace", color: item.color }}>{item.val.toLocaleString()}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        {/* Top Referrers */}
        <div className="card">
          <div className="section-header">
            <div>
              <div className="card-title">Top Referrers</div>
              <div className="card-subtitle">This month's performers</div>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 12 }}>View all</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Referrer</th>
                <th>Refs</th>
                <th>Conv.</th>
                <th>Earned</th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.map((r, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                        {r.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span style={{ fontSize: 13 }}>{r.name}</span>
                    </div>
                  </td>
                  <td className="mono">{r.refs}</td>
                  <td className="mono">{r.conv}</td>
                  <td><span style={{ color: COLORS.green, fontFamily: "DM Mono", fontSize: 13 }}>{r.earned}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Activity */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>Live Activity</div>
          <div className="card-subtitle">Real-time referral events</div>
          {activity.map((a, i) => (
            <div className="activity-item" key={i}>
              <div className="activity-dot" style={{ background: a.color, boxShadow: `0 0 6px ${a.color}` }} />
              <div>
                <div className="activity-text">{a.text}</div>
                <div className="activity-time">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REFERRALS TABLE ─────────────────────────────────────
function ReferralsTable() {
  const [filter, setFilter] = useState("all");
  const referrals = [
    { id: "#R-2847", referrer: "Mike Thompson", referred: "Anna Wilson", date: "Feb 21, 2026", status: "converted", reward: "$24.00", channel: "Email" },
    { id: "#R-2846", referrer: "Sarah Johnson", referred: "Tom Baker", date: "Feb 21, 2026", status: "pending", reward: "$12.00", channel: "Link" },
    { id: "#R-2845", referrer: "James Rodriguez", referred: "Lisa Park", date: "Feb 20, 2026", status: "converted", reward: "$24.00", channel: "Social" },
    { id: "#R-2844", referrer: "Emily Chen", referred: "Ryan Scott", date: "Feb 20, 2026", status: "verified", reward: "$12.00", channel: "Email" },
    { id: "#R-2843", referrer: "Mike Thompson", referred: "Nina Patel", date: "Feb 19, 2026", status: "converted", reward: "$24.00", channel: "Link" },
    { id: "#R-2842", referrer: "Chris Lee", referred: "Omar Hassan", date: "Feb 19, 2026", status: "fraud", reward: "$0.00", channel: "Link" },
    { id: "#R-2841", referrer: "Sarah Johnson", referred: "Mia Torres", date: "Feb 18, 2026", status: "converted", reward: "$24.00", channel: "Social" },
    { id: "#R-2840", referrer: "David Kim", referred: "Zoe Clark", date: "Feb 18, 2026", status: "pending", reward: "$12.00", channel: "Email" },
  ];

  const statusBadge = (s) => {
    const map = { converted: "badge-green", pending: "badge-yellow", verified: "badge-blue", fraud: "badge-red" };
    return <span className={`badge ${map[s]}`}>{s}</span>;
  };

  const filtered = filter === "all" ? referrals : referrals.filter(r => r.status === filter);

  return (
    <div className="content">
      {/* Summary row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total", count: 2847, active: "all" },
          { label: "Converted", count: 1203, active: "converted" },
          { label: "Pending", count: 892, active: "pending" },
          { label: "Fraud Flags", count: 28, active: "fraud" },
        ].map((f, i) => (
          <button key={i} onClick={() => setFilter(f.active)} style={{
            padding: "10px 18px", borderRadius: 8, cursor: "pointer",
            fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13,
            border: `1px solid ${filter === f.active ? COLORS.accent : COLORS.border}`,
            background: filter === f.active ? COLORS.accentGlow : COLORS.card,
            color: filter === f.active ? COLORS.accent : COLORS.muted,
            transition: "all 0.15s",
          }}>
            {f.label} <span style={{ marginLeft: 6, opacity: 0.7 }}>{f.count.toLocaleString()}</span>
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Icon name="search" size={14} style={{ position: "absolute" }} />
            <input className="form-input" placeholder="Search referrals..." style={{ paddingLeft: 36, width: 220, height: 40 }} />
          </div>
          <button className="btn btn-primary"><Icon name="plus" size={14} /> Add Referral</button>
        </div>
      </div>

      {/* Referral Link */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="card-title" style={{ marginBottom: 4 }}>Your Referral Link</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>Share this link to start earning rewards</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="ref-link" style={{ width: 340 }}>
              <div className="ref-link-text">trueferral.app/r/mike-thompson-2847</div>
              <div className="ref-link-btn"><Icon name="copy" size={12} /> Copy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Referrer</th>
              <th>Referred User</th>
              <th>Channel</th>
              <th>Date</th>
              <th>Status</th>
              <th>Reward</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td><span className="mono">{r.id}</span></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                      {r.referrer.split(" ").map(n => n[0]).join("")}
                    </div>
                    {r.referrer}
                  </div>
                </td>
                <td style={{ color: COLORS.muted }}>{r.referred}</td>
                <td>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: COLORS.surface, border: `1px solid ${COLORS.border}`, fontFamily: "DM Mono" }}>
                    {r.channel}
                  </span>
                </td>
                <td className="mono">{r.date}</td>
                <td>{statusBadge(r.status)}</td>
                <td><span style={{ color: COLORS.green, fontFamily: "DM Mono", fontSize: 13 }}>{r.reward}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.muted }}>
          <span>Showing {filtered.length} of 2,847 results</span>
          <div style={{ display: "flex", gap: 6 }}>
            {["← Prev", "1", "2", "3", "...", "Next →"].map((p, i) => (
              <button key={i} style={{
                padding: "4px 10px", borderRadius: 6, border: `1px solid ${i === 1 ? COLORS.accent : COLORS.border}`,
                background: i === 1 ? COLORS.accentGlow : "transparent",
                color: i === 1 ? COLORS.accent : COLORS.muted,
                cursor: "pointer", fontFamily: "DM Mono", fontSize: 12,
              }}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────
function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const tabs = ["profile", "notifications", "security", "integrations"];

  return (
    <div className="content">
      <div style={{ display: "flex", gap: 6, marginBottom: 24, background: COLORS.card, padding: 4, borderRadius: 10, border: `1px solid ${COLORS.border}`, width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: "7px 16px", borderRadius: 7, border: "none", cursor: "pointer",
            fontFamily: "Syne", fontWeight: 600, fontSize: 13, textTransform: "capitalize",
            background: activeTab === t ? COLORS.accent : "transparent",
            color: activeTab === t ? "white" : COLORS.muted,
            transition: "all 0.15s",
          }}>{t}</button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Profile Information</div>
            <div className="card-subtitle">Update your personal details</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22, padding: "14px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>MT</div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>Mike Thompson</div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>Admin · Pro Plan</div>
              </div>
              <button className="btn btn-ghost" style={{ marginLeft: "auto", fontSize: 12 }}>Change Photo</button>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" defaultValue="Mike Thompson" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" defaultValue="mike@company.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" defaultValue="Acme Corp" />
            </div>
            <button className="btn btn-primary">Save Changes</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 4 }}>Referral Settings</div>
              <div className="card-subtitle">Configure your program</div>
              <div className="form-group">
                <label className="form-label">Reward Amount</label>
                <input className="form-input" defaultValue="$24.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Reward Type</label>
                <select className="form-input" style={{ cursor: "pointer" }}>
                  <option>Cash Payout</option>
                  <option>Account Credit</option>
                  <option>Gift Card</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cookie Duration (days)</label>
                <input className="form-input" defaultValue="30" type="number" />
              </div>
              <button className="btn btn-primary">Update Program</button>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Quick Toggles</div>
              {[
                { label: "Fraud detection", sub: "Auto-flag suspicious patterns", on: true },
                { label: "Double-sided rewards", sub: "Referrer & referee both earn", on: true },
                { label: "Email notifications", sub: "Get notified on conversions", on: false },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${COLORS.border}44` : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{item.sub}</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked={item.on} />
                    <span className="slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>Notification Preferences</div>
          <div className="card-subtitle">Control what alerts you receive</div>
          {[
            { label: "New referral signup", sub: "When someone signs up via your link", icon: "users" },
            { label: "Conversion achieved", sub: "When a referral converts to paid", icon: "gift" },
            { label: "Payout processed", sub: "When a reward payout is sent", icon: "key" },
            { label: "Fraud alert", sub: "When suspicious activity is detected", icon: "shield" },
            { label: "Weekly digest", sub: "Summary of your referral performance", icon: "chart" },
          ].map((n, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < 4 ? `1px solid ${COLORS.border}44` : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: COLORS.accentGlow, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent, flexShrink: 0 }}>
                <Icon name={n.icon} size={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{n.label}</div>
                <div style={{ fontSize: 11, color: COLORS.muted }}>{n.sub}</div>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked={i < 3} />
                <span className="slider" />
              </label>
            </div>
          ))}
        </div>
      )}

      {activeTab === "security" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 800 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Change Password</div>
            <div className="card-subtitle">Keep your account secure</div>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" placeholder="••••••••" />
            </div>
            <button className="btn btn-primary">Update Password</button>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>API Keys</div>
            <div className="card-subtitle">Manage access tokens</div>
            {[
              { name: "Production Key", key: "tf_live_••••••••4829", created: "Jan 12, 2026" },
              { name: "Test Key", key: "tf_test_••••••••9f3a", created: "Feb 1, 2026" },
            ].map((k, i) => (
              <div key={i} style={{ padding: "12px 0", borderBottom: i < 1 ? `1px solid ${COLORS.border}44` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{k.name}</span>
                  <button className="btn btn-ghost" style={{ fontSize: 11, padding: "2px 8px" }}>Revoke</button>
                </div>
                <div style={{ fontFamily: "DM Mono", fontSize: 12, color: COLORS.muted }}>{k.key}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Created {k.created}</div>
              </div>
            ))}
            <button className="btn btn-ghost" style={{ marginTop: 12, fontSize: 12 }}><Icon name="plus" size={13} /> Generate New Key</button>
          </div>
        </div>
      )}

      {activeTab === "integrations" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { name: "Stripe", desc: "Process payouts automatically", connected: true, icon: "💳" },
            { name: "Slack", desc: "Get referral alerts in Slack", connected: true, icon: "💬" },
            { name: "HubSpot", desc: "Sync referrals to your CRM", connected: false, icon: "🔶" },
            { name: "Mailchimp", desc: "Email referred users", connected: false, icon: "📧" },
            { name: "Zapier", desc: "Connect to 5000+ apps", connected: false, icon: "⚡" },
            { name: "Webhook", desc: "Custom HTTP endpoint", connected: true, icon: "🔗" },
          ].map((int, i) => (
            <div className="card" key={i} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ fontSize: 28 }}>{int.icon}</div>
                <span className={`badge ${int.connected ? "badge-green" : ""}`} style={!int.connected ? { background: COLORS.surface, color: COLORS.muted, border: `1px solid ${COLORS.border}` } : {}}>
                  {int.connected ? "Connected" : "Available"}
                </span>
              </div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{int.name}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14 }}>{int.desc}</div>
              <button className={`btn ${int.connected ? "btn-ghost" : "btn-primary"}`} style={{ fontSize: 12, padding: "7px 14px" }}>
                {int.connected ? "Configure" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");

  if (!loggedIn) return (
    <>
      <style>{styles}</style>
      <LoginPage onLogin={() => setLoggedIn(true)} />
    </>
  );

  const navItems = [
    { id: "dashboard", label: "Overview", icon: "dashboard" },
    { id: "referrals", label: "Referrals", icon: "link", badge: "12" },
    { id: "users", label: "Referrers", icon: "users" },
    { id: "analytics", label: "Analytics", icon: "chart" },
  ];

  const pageTitles = { dashboard: "Dashboard", referrals: "Referrals", users: "Referrers", analytics: "Analytics", settings: "Settings" };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-mark">TF</div>
            <div className="logo-text">True<span>ferral</span></div>
          </div>

          <nav className="nav">
            <div className="nav-section">Main</div>
            {navItems.map(n => (
              <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
                <Icon name={n.icon} size={15} />
                {n.label}
                {n.badge && <span className="nav-badge">{n.badge}</span>}
              </div>
            ))}
            <div className="nav-section" style={{ marginTop: 8 }}>Account</div>
            <div className={`nav-item ${page === "settings" ? "active" : ""}`} onClick={() => setPage("settings")}>
              <Icon name="settings" size={15} /> Settings
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="user-pill">
              <div className="avatar">MT</div>
              <div>
                <div className="user-name">Mike Thompson</div>
                <div className="user-role">Admin · Pro</div>
              </div>
              <div style={{ marginLeft: "auto", color: COLORS.muted, cursor: "pointer" }} onClick={() => setLoggedIn(false)}>
                <Icon name="logout" size={14} />
              </div>
            </div>
          </div>
        </aside>

        <div className="main">
          <div className="topbar">
            <div className="page-title">{pageTitles[page]}</div>
            <div className="topbar-actions">
              <button className="btn btn-ghost" style={{ padding: "7px 10px" }}><Icon name="bell" size={15} /></button>
              <button className="btn btn-ghost" style={{ padding: "7px 10px" }}><Icon name="search" size={15} /></button>
              <button className="btn btn-primary"><Icon name="plus" size={14} /> New Referral</button>
            </div>
          </div>

          {page === "dashboard" && <Dashboard />}
          {page === "referrals" && <ReferralsTable />}
          {page === "settings" && <Settings />}
          {(page === "users" || page === "analytics") && (
            <div className="content" style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minHeight: 400 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{pageTitles[page]} Coming Soon</div>
                <div style={{ color: COLORS.muted, fontSize: 13 }}>This page is under construction</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}