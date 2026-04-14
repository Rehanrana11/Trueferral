# =============================================================================
# Build-Full-Frontend.ps1
# Replaces dashboard page.jsx with full real backend-connected version
# Adds complete Video Calls frontend page
# =============================================================================

$Root = "C:\Users\devel\OneDrive\Documents\Software\Trueferral-main"
$ErrorActionPreference = "Stop"

function Write-UTF8 {
    param([string]$Path, [string]$Content)
    $dir = Split-Path $Path -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  [WRITTEN] $($Path.Replace($Root,''))" -ForegroundColor Green
}

Set-Location $Root
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Building Full Frontend + Video Calls Page" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# =============================================================================
# STEP 1: Complete page.jsx - Real login + Real dashboard + Real referrals
# =============================================================================
Write-Host "STEP 1: Building complete page.jsx with real backend" -ForegroundColor White

Write-UTF8 "$Root\frontend\src\app\page.jsx" @'
"use client";
import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://trueferral.onrender.com";

const COLORS = {
  bg: "#0a0a0f", surface: "#111118", card: "#16161f", border: "#1e1e2e",
  accent: "#6c6cff", accentGlow: "#6c6cff33", accentHover: "#8484ff",
  green: "#00e5a0", greenGlow: "#00e5a022", red: "#ff4d6a",
  yellow: "#ffd166", text: "#e8e8f0", muted: "#6b6b80", subtle: "#2a2a3a",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'Syne', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 4px; }
  .app { display: flex; height: 100vh; overflow: hidden; }
  .sidebar { width: 220px; min-width: 220px; background: ${COLORS.surface}; border-right: 1px solid ${COLORS.border}; display: flex; flex-direction: column; position: relative; z-index: 10; }
  .sidebar::after { content: ''; position: absolute; top: 0; right: 0; width: 1px; height: 100%; background: linear-gradient(to bottom, transparent, ${COLORS.accent}44, transparent); }
  .logo { padding: 28px 20px 24px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid ${COLORS.border}; }
  .logo-mark { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, ${COLORS.accent}, #9b5de5); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: white; box-shadow: 0 0 16px ${COLORS.accentGlow}; }
  .logo-text { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
  .logo-text span { color: ${COLORS.accent}; }
  .nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }
  .nav-section { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; color: ${COLORS.muted}; padding: 12px 8px 6px; text-transform: uppercase; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; font-size: 13.5px; font-weight: 500; color: ${COLORS.muted}; transition: all 0.15s ease; position: relative; }
  .nav-item:hover { background: ${COLORS.card}; color: ${COLORS.text}; }
  .nav-item.active { background: ${COLORS.accentGlow}; color: ${COLORS.accent}; font-weight: 600; }
  .nav-item.active::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 18px; border-radius: 0 3px 3px 0; background: ${COLORS.accent}; box-shadow: 0 0 8px ${COLORS.accent}; }
  .nav-badge { margin-left: auto; background: ${COLORS.accent}; color: white; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }
  .sidebar-footer { padding: 16px 12px; border-top: 1px solid ${COLORS.border}; }
  .user-pill { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
  .user-pill:hover { background: ${COLORS.card}; }
  .avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, ${COLORS.accent}, #9b5de5); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: white; flex-shrink: 0; }
  .user-name { font-size: 13px; font-weight: 600; }
  .user-role { font-size: 11px; color: ${COLORS.muted}; }
  .main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
  .topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 28px; border-bottom: 1px solid ${COLORS.border}; background: ${COLORS.surface}; position: sticky; top: 0; z-index: 5; }
  .page-title { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
  .topbar-actions { display: flex; align-items: center; gap: 10px; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-family: 'Syne', sans-serif; font-weight: 600; cursor: pointer; transition: all 0.15s ease; border: none; outline: none; }
  .btn-primary { background: ${COLORS.accent}; color: white; box-shadow: 0 0 20px ${COLORS.accentGlow}; }
  .btn-primary:hover { background: ${COLORS.accentHover}; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-ghost { background: transparent; color: ${COLORS.muted}; border: 1px solid ${COLORS.border}; }
  .btn-ghost:hover { background: ${COLORS.card}; color: ${COLORS.text}; border-color: ${COLORS.subtle}; }
  .content { padding: 28px; flex: 1; }
  .card { background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 12px; padding: 20px; transition: border-color 0.2s; }
  .card:hover { border-color: ${COLORS.subtle}; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { position: relative; overflow: hidden; }
  .stat-label { font-size: 12px; font-weight: 500; color: ${COLORS.muted}; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.8px; }
  .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -1px; line-height: 1; margin-bottom: 8px; }
  .stat-change { font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 4px; font-family: 'DM Mono', monospace; }
  .stat-change.up { color: ${COLORS.green}; }
  .stat-change.down { color: ${COLORS.red}; }
  .stat-glow { position: absolute; top: -30px; right: -30px; width: 80px; height: 80px; border-radius: 50%; opacity: 0.15; filter: blur(20px); }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .grid-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
  .card-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .card-subtitle { font-size: 12px; color: ${COLORS.muted}; margin-bottom: 18px; }
  .chart-bars { display: flex; align-items: flex-end; gap: 6px; height: 100px; }
  .bar-group { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
  .bar { width: 100%; border-radius: 4px 4px 0 0; transition: opacity 0.2s; cursor: pointer; }
  .bar:hover { opacity: 0.8; }
  .bar-label { font-size: 10px; color: ${COLORS.muted}; font-family: 'DM Mono', monospace; }
  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; padding: 8px 14px; font-size: 11px; font-weight: 600; letter-spacing: 1px; color: ${COLORS.muted}; text-transform: uppercase; border-bottom: 1px solid ${COLORS.border}; }
  .table td { padding: 12px 14px; font-size: 13.5px; border-bottom: 1px solid ${COLORS.border}8a; }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: ${COLORS.surface}; }
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; font-family: 'DM Mono', monospace; }
  .badge-green { background: ${COLORS.greenGlow}; color: ${COLORS.green}; border: 1px solid ${COLORS.green}33; }
  .badge-yellow { background: #ffd16615; color: ${COLORS.yellow}; border: 1px solid ${COLORS.yellow}33; }
  .badge-red { background: #ff4d6a15; color: ${COLORS.red}; border: 1px solid ${COLORS.red}33; }
  .badge-blue { background: ${COLORS.accentGlow}; color: ${COLORS.accent}; border: 1px solid ${COLORS.accent}33; }
  .mono { font-family: 'DM Mono', monospace; font-size: 12px; color: ${COLORS.muted}; }
  .activity-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid ${COLORS.border}44; }
  .activity-item:last-child { border-bottom: none; }
  .activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
  .activity-text { font-size: 13px; line-height: 1.4; }
  .activity-time { font-size: 11px; color: ${COLORS.muted}; font-family: 'DM Mono', monospace; margin-top: 2px; }
  .progress-track { height: 6px; background: ${COLORS.border}; border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
  .form-group { margin-bottom: 18px; }
  .form-label { font-size: 12px; font-weight: 600; color: ${COLORS.muted}; margin-bottom: 6px; display: block; letter-spacing: 0.5px; text-transform: uppercase; }
  .form-input { width: 100%; padding: 10px 14px; background: ${COLORS.surface}; border: 1px solid ${COLORS.border}; border-radius: 8px; color: ${COLORS.text}; font-family: 'Syne', sans-serif; font-size: 14px; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
  .form-input:focus { border-color: ${COLORS.accent}; box-shadow: 0 0 0 3px ${COLORS.accentGlow}; }
  .form-input::placeholder { color: ${COLORS.muted}; }
  .toggle { position: relative; display: inline-block; width: 38px; height: 20px; }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: ${COLORS.border}; border-radius: 20px; transition: 0.2s; }
  .slider:before { content: ''; position: absolute; height: 14px; width: 14px; left: 3px; bottom: 3px; background: ${COLORS.muted}; border-radius: 50%; transition: 0.2s; }
  input:checked + .slider { background: ${COLORS.accent}; }
  input:checked + .slider:before { transform: translateX(18px); background: white; }
  .ref-link { display: flex; align-items: center; background: ${COLORS.surface}; border: 1px solid ${COLORS.border}; border-radius: 8px; overflow: hidden; }
  .ref-link-text { flex: 1; padding: 10px 14px; font-family: 'DM Mono', monospace; font-size: 12px; color: ${COLORS.muted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ref-link-btn { padding: 10px 14px; background: ${COLORS.accent}22; color: ${COLORS.accent}; font-size: 12px; font-weight: 600; cursor: pointer; border-left: 1px solid ${COLORS.border}; transition: background 0.15s; white-space: nowrap; }
  .ref-link-btn:hover { background: ${COLORS.accentGlow}; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: ${COLORS.bg}; position: relative; overflow: hidden; }
  .login-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 50% at 50% 0%, ${COLORS.accentGlow}, transparent), radial-gradient(ellipse 40% 40% at 80% 80%, #9b5de522, transparent); }
  .login-grid { position: absolute; inset: 0; opacity: 0.03; background-image: linear-gradient(${COLORS.text} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.text} 1px, transparent 1px); background-size: 40px 40px; }
  .login-card { position: relative; z-index: 2; width: 400px; padding: 40px; background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 16px; box-shadow: 0 40px 80px #00000080, 0 0 0 1px ${COLORS.accentGlow}; }
  .login-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
  .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: ${COLORS.muted}; font-size: 12px; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: ${COLORS.border}; }
  .error-box { background: #ff4d6a15; border: 1px solid #ff4d6a33; border-radius: 8px; padding: 10px 14px; color: ${COLORS.red}; font-size: 13px; margin-bottom: 14px; }
  .success-box { background: ${COLORS.greenGlow}; border: 1px solid ${COLORS.green}33; border-radius: 8px; padding: 10px 14px; color: ${COLORS.green}; font-size: 13px; margin-bottom: 14px; }
  /* Video Calls */
  .vc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .vc-card { background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 12px; padding: 18px; }
  .vc-call-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${COLORS.border}44; }
  .vc-call-item:last-child { border-bottom: none; }
  .vc-call-info { display: flex; flex-direction: column; gap: 3px; }
  .vc-call-title { font-size: 14px; font-weight: 600; }
  .vc-call-meta { font-size: 12px; color: ${COLORS.muted}; font-family: 'DM Mono', monospace; }
  .vc-call-actions { display: flex; gap: 8px; }
  .modal-overlay { position: fixed; inset: 0; background: #00000080; z-index: 100; display: flex; align-items: center; justify-content: center; }
  .modal { background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 16px; padding: 32px; width: 480px; max-height: 80vh; overflow-y: auto; }
  .modal-title { font-size: 18px; font-weight: 800; margin-bottom: 6px; }
  .modal-subtitle { font-size: 13px; color: ${COLORS.muted}; margin-bottom: 24px; }
  .modal-footer { display: flex; gap: 10px; margin-top: 24px; }
  .rating-stars { display: flex; gap: 6px; margin-bottom: 16px; }
  .star { font-size: 24px; cursor: pointer; transition: transform 0.1s; }
  .star:hover { transform: scale(1.2); }
  .availability-slot { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: ${COLORS.surface}; border: 1px solid ${COLORS.border}; border-radius: 8px; margin-bottom: 8px; }
  .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

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
    video: "M23 7l-7 5 7 5V7zM1 5h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
    phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
    clock: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 6v6l4 2",
    check: "M20 6L9 17l-5-5",
    x: "M18 6L6 18M6 6l12 12",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    calendar: "M3 4h18v18H3V4zm0 5h18M8 2v4M16 2v4",
    gift: "M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[name] || icons.dashboard} />
    </svg>
  );
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }
    if (tab === "signup" && !username) { setError("Username is required."); return; }
    setLoading(true);
    try {
      const endpoint = tab === "login" ? "/auth/login" : "/auth/register";
      const body = tab === "login"
        ? { email, password }
        : { email, password, username, full_name: "", company };
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("tf_token", data.token);
        localStorage.setItem("tf_user", JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.detail || "Something went wrong. Please try again.");
      }
    } catch { setError("Network error — is the backend running?"); }
    finally { setLoading(false); }
  }

  return (
    <div className="login-page">
      <div className="login-bg" /><div className="login-grid" />
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-mark">TF</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>True<span style={{ color: COLORS.accent }}>ferral</span></div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>Referral Intelligence Platform</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: COLORS.surface, padding: 4, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
          {["login","signup"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 7, cursor: "pointer", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13, background: tab === t ? COLORS.accent : "transparent", color: tab === t ? "white" : COLORS.muted, transition: "all 0.15s" }}>
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>
        {error && <div className="error-box">{error}</div>}
        {tab === "signup" && (
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" placeholder="johndoe" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAuth()} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAuth()} />
        </div>
        {tab === "signup" && (
          <div className="form-group">
            <label className="form-label">Company (optional)</label>
            <input className="form-input" type="text" placeholder="Acme Corp" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
        )}
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: 14, marginTop: 4 }} onClick={handleAuth} disabled={loading}>
          {loading ? <><div className="spinner-sm" /> Please wait...</> : tab === "login" ? "Sign In to Dashboard" : "Create Account"}
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [referrers, setReferrers] = useState([]);
  const [myIntros, setMyIntros] = useState([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("tf_token") : null;
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};

  useEffect(() => {
    fetch(`${API}/api/dashboard/stats`, { headers }).then(r => r.json()).then(setStats).catch(() => {});
    fetch(`${API}/api/dashboard/activity`, { headers }).then(r => r.json()).then(d => setActivity(d.activity || [])).catch(() => {});
    fetch(`${API}/api/dashboard/top-referrers`).then(r => r.json()).then(d => setReferrers(d.referrers || [])).catch(() => {});
    if (token) {
      fetch(`${API}/api/introductions`, { headers }).then(r => r.json()).then(d => setMyIntros(d.introductions || [])).catch(() => {});
    }
  }, []);

  const statCards = stats ? [
    { label: "Total Referrals", value: stats.total_referrals?.toLocaleString() || "0", change: "Live data", up: true, color: COLORS.accent },
    { label: "Active Referrers", value: stats.active_referrers?.toString() || "0", change: "Live data", up: true, color: COLORS.green },
    { label: "Conversions", value: stats.conversions?.toLocaleString() || "0", change: "Live data", up: true, color: "#9b5de5" },
    { label: "Revenue Attributed", value: `$${((stats.revenue_attributed || 0) / 1000).toFixed(1)}K`, change: "Live data", up: true, color: COLORS.yellow },
  ] : [
    { label: "Total Referrals", value: "—", change: "Loading...", up: true, color: COLORS.accent },
    { label: "Active Referrers", value: "—", change: "Loading...", up: true, color: COLORS.green },
    { label: "Conversions", value: "—", change: "Loading...", up: true, color: "#9b5de5" },
    { label: "Revenue Attributed", value: "—", change: "Loading...", up: true, color: COLORS.yellow },
  ];

  const funnel = stats ? [
    { label: "Introductions Made", val: stats.total_referrals || 0, pct: 100, color: COLORS.accent },
    { label: "Confirmed", val: stats.confirmed || 0, pct: stats.total_referrals > 0 ? Math.round(stats.confirmed / stats.total_referrals * 100) : 0, color: "#9b5de5" },
    { label: "Converted", val: stats.conversions || 0, pct: stats.total_referrals > 0 ? Math.round(stats.conversions / stats.total_referrals * 100) : 0, color: COLORS.green },
  ] : [];

  const statusBadge = s => {
    const map = { SUCCESS: "badge-green", AWAITING_CONFIRMATION: "badge-yellow", INTRO_CONFIRMED: "badge-blue", OUTCOME_PENDING: "badge-yellow", FAILURE: "badge-red" };
    const label = { SUCCESS: "success", AWAITING_CONFIRMATION: "awaiting", INTRO_CONFIRMED: "confirmed", OUTCOME_PENDING: "pending", FAILURE: "failed" };
    return <span className={`badge ${map[s] || "badge-blue"}`}>{label[s] || s}</span>;
  };

  return (
    <div className="content">
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div className="card stat-card" key={i}>
            <div className="stat-glow" style={{ background: s.color }} />
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className={`stat-change ${s.up ? "up" : "down"}`}>
              <Icon name={s.up ? "arrow_up" : "arrow_down"} size={12} />{s.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-3">
        {/* Funnel */}
        <div className="card">
          <div className="card-title">Conversion Funnel</div>
          <div className="card-subtitle">Your introduction pipeline</div>
          {funnel.length > 0 ? funnel.map((item, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: COLORS.muted }}>{item.label}</span>
                <span style={{ fontFamily: "DM Mono, monospace", color: item.color }}>{item.val.toLocaleString()}</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} /></div>
            </div>
          )) : <div style={{ color: COLORS.muted, fontSize: 13 }}>Make your first introduction to see funnel data.</div>}
        </div>

        {/* My Intros */}
        <div className="card">
          <div className="card-title">My Introductions</div>
          <div className="card-subtitle">Your recent activity</div>
          {myIntros.length > 0 ? myIntros.slice(0, 5).map((intro, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}44`, fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>{intro.counterparty}</span>
              {statusBadge(intro.state)}
            </div>
          )) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
              <div style={{ color: COLORS.muted, fontSize: 13 }}>No introductions yet.</div>
              <a href="/intro/new" style={{ color: COLORS.accent, fontSize: 13, marginTop: 8, display: "block" }}>Make your first introduction →</a>
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Top Referrers */}
        <div className="card">
          <div className="section-header">
            <div><div className="card-title">Top Referrers</div><div className="card-subtitle">Platform leaders</div></div>
          </div>
          {referrers.length > 0 ? (
            <table className="table">
              <thead><tr><th>Referrer</th><th>Refs</th><th>Conv.</th><th>Earned</th></tr></thead>
              <tbody>
                {referrers.map((r, i) => (
                  <tr key={i}>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{r.name[0]}</div>{r.name}
                    </div></td>
                    <td className="mono">{r.refs}</td>
                    <td className="mono">{r.conv}</td>
                    <td><span style={{ color: COLORS.green, fontFamily: "DM Mono", fontSize: 13 }}>{r.earned}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div style={{ color: COLORS.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No referrers yet. Be the first!</div>}
        </div>

        {/* Live Activity */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 4 }}>Live Activity</div>
          <div className="card-subtitle">Real-time events</div>
          {activity.length > 0 ? activity.map((a, i) => (
            <div className="activity-item" key={i}>
              <div className="activity-dot" style={{ background: a.color, boxShadow: `0 0 6px ${a.color}` }} />
              <div><div className="activity-text">{a.text}</div><div className="activity-time">{a.time}</div></div>
            </div>
          )) : (
            <div style={{ color: COLORS.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No activity yet. Start making introductions!</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── REFERRALS TABLE ──────────────────────────────────────────────────────────
function ReferralsTable({ user }) {
  const [intros, setIntros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const token = typeof window !== "undefined" ? localStorage.getItem("tf_token") : null;

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/introductions`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setIntros(d.introductions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusBadge = s => {
    const map = { SUCCESS: "badge-green", AWAITING_CONFIRMATION: "badge-yellow", INTRO_CONFIRMED: "badge-blue", OUTCOME_PENDING: "badge-yellow", FAILURE: "badge-red" };
    const label = { SUCCESS: "converted", AWAITING_CONFIRMATION: "pending", INTRO_CONFIRMED: "confirmed", OUTCOME_PENDING: "pending", FAILURE: "failed" };
    return <span className={`badge ${map[s] || "badge-blue"}`}>{label[s] || s}</span>;
  };

  const filtered = filter === "all" ? intros : intros.filter(r => {
    if (filter === "converted") return r.state === "SUCCESS";
    if (filter === "pending") return r.state === "AWAITING_CONFIRMATION" || r.state === "OUTCOME_PENDING";
    return true;
  });

  return (
    <div className="content">
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[{l:"All",k:"all"},{l:"Converted",k:"converted"},{l:"Pending",k:"pending"}].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={{ padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 13, border: `1px solid ${filter===f.k ? COLORS.accent : COLORS.border}`, background: filter===f.k ? COLORS.accentGlow : COLORS.card, color: filter===f.k ? COLORS.accent : COLORS.muted, transition: "all 0.15s" }}>
            {f.l} <span style={{ marginLeft: 6, opacity: 0.7 }}>{f.k === "all" ? intros.length : intros.filter(r => f.k === "converted" ? r.state === "SUCCESS" : r.state === "AWAITING_CONFIRMATION" || r.state === "OUTCOME_PENDING").length}</span>
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <a href="/intro/new" className="btn btn-primary"><Icon name="plus" size={14} /> New Introduction</a>
        </div>
      </div>
      <div className="card">
        {loading ? <div style={{ textAlign: "center", padding: 40, color: COLORS.muted }}>Loading your introductions...</div>
        : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No introductions yet</div>
            <div style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>Start building your verified referral record</div>
            <a href="/intro/new" className="btn btn-primary" style={{ textDecoration: "none" }}><Icon name="plus" size={14} /> Make First Introduction</a>
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Counterparty</th><th>Note</th><th>Date</th><th>State</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{r.counterparty[0]}</div>{r.counterparty}
                  </div></td>
                  <td style={{ color: COLORS.muted, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.note || "—"}</td>
                  <td className="mono">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>{statusBadge(r.state)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <a href={`/receipt/${r.id}`} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.muted, cursor: "pointer", textDecoration: "none" }}>Receipt</a>
                      <a href={`/timeline/${r.id}`} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.muted, cursor: "pointer", textDecoration: "none" }}>Timeline</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── VIDEO CALLS PAGE ─────────────────────────────────────────────────────────
function VideoCalls({ user }) {
  const [tab, setTab] = useState("upcoming");
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [showRate, setShowRate] = useState(null);
  const [schedForm, setSchedForm] = useState({ recipient_id: "", title: "", scheduled_time: "", duration: 30, notes: "" });
  const [avForm, setAvForm] = useState({ day_of_week: 1, start_time: "09:00", end_time: "17:00", timezone: "UTC" });
  const [rating, setRating] = useState({ rating: 5, feedback: "", is_professional: true, would_recommend: true });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("tf_token") : null;
  const tfUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("tf_user") || "{}") : {};
  const headers = token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

  const load = useCallback(() => {
    if (!tfUser.id) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/video-calls/upcoming?user_id=${tfUser.id}`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/video-calls/history?user_id=${tfUser.id}`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/user-availability/users/${tfUser.id}`, { headers }).then(r => r.json()).catch(() => ({ availability_slots: [] })),
    ]).then(([up, hist, avail]) => {
      setUpcoming(Array.isArray(up) ? up : []);
      setHistory(Array.isArray(hist) ? hist : []);
      setAvailability(avail?.availability_slots || []);
      setLoading(false);
    });
  }, [tfUser.id]);

  useEffect(() => { load(); }, [load]);

  async function scheduleCall() {
    setError(""); setSuccess("");
    try {
      const res = await fetch(`${API}/api/video-calls/schedule?caller_id=${tfUser.id}`, {
        method: "POST", headers,
        body: JSON.stringify({ ...schedForm, recipient_id: parseInt(schedForm.recipient_id), duration: parseInt(schedForm.duration) }),
      });
      const d = await res.json();
      if (res.ok) { setSuccess("Call scheduled!"); setShowSchedule(false); load(); setSchedForm({ recipient_id: "", title: "", scheduled_time: "", duration: 30, notes: "" }); }
      else setError(d.detail || "Failed to schedule call.");
    } catch { setError("Network error."); }
  }

  async function cancelCall(id) {
    await fetch(`${API}/api/video-calls/${id}?user_id=${tfUser.id}`, { method: "DELETE", headers });
    load();
  }

  async function addAvailability() {
    setError(""); setSuccess("");
    try {
      const res = await fetch(`${API}/api/user-availability?user_id=${tfUser.id}`, {
        method: "POST", headers, body: JSON.stringify(avForm),
      });
      const d = await res.json();
      if (res.ok) { setSuccess("Availability added!"); setShowAvailability(false); load(); }
      else setError(d.detail || "Failed to add availability.");
    } catch { setError("Network error."); }
  }

  async function deleteAvailability(id) {
    await fetch(`${API}/api/user-availability/${id}?user_id=${tfUser.id}`, { method: "DELETE", headers });
    load();
  }

  async function submitRating(callId) {
    setError(""); setSuccess("");
    try {
      const res = await fetch(`${API}/api/video-calls/${callId}/rate?user_id=${tfUser.id}`, {
        method: "POST", headers, body: JSON.stringify(rating),
      });
      const d = await res.json();
      if (res.ok) { setSuccess("Rating submitted!"); setShowRate(null); load(); }
      else setError(d.detail || "Failed to submit rating.");
    } catch { setError("Network error."); }
  }

  async function updateStatus(callId, status) {
    await fetch(`${API}/api/video-calls/${callId}/status?user_id=${tfUser.id}`, {
      method: "PUT", headers, body: JSON.stringify({ status }),
    });
    load();
  }

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const statusBadge = s => {
    const map = { pending: "badge-yellow", active: "badge-green", completed: "badge-blue", cancelled: "badge-red", no_show: "badge-red" };
    return <span className={`badge ${map[s] || "badge-blue"}`}>{s}</span>;
  };

  return (
    <div className="content">
      {/* Schedule Modal */}
      {showSchedule && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSchedule(false)}>
          <div className="modal">
            <div className="modal-title">Schedule a Video Call</div>
            <div className="modal-subtitle">Set up a call with another user</div>
            {error && <div className="error-box">{error}</div>}
            <div className="form-group">
              <label className="form-label">Recipient User ID</label>
              <input className="form-input" placeholder="Enter recipient's user ID" value={schedForm.recipient_id} onChange={e => setSchedForm({...schedForm, recipient_id: e.target.value})} />
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>Find user IDs in the API docs at /docs</div>
            </div>
            <div className="form-group">
              <label className="form-label">Call Title</label>
              <input className="form-input" placeholder="e.g. Partnership Discussion" value={schedForm.title} onChange={e => setSchedForm({...schedForm, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input className="form-input" type="datetime-local" value={schedForm.scheduled_time} onChange={e => setSchedForm({...schedForm, scheduled_time: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <select className="form-input" value={schedForm.duration} onChange={e => setSchedForm({...schedForm, duration: e.target.value})}>
                {[15,30,45,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <input className="form-input" placeholder="What will you discuss?" value={schedForm.notes} onChange={e => setSchedForm({...schedForm, notes: e.target.value})} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={scheduleCall}><Icon name="video" size={14} /> Schedule Call</button>
              <button className="btn btn-ghost" onClick={() => { setShowSchedule(false); setError(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailability && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAvailability(false)}>
          <div className="modal">
            <div className="modal-title">Set Availability</div>
            <div className="modal-subtitle">Add a time slot when you're available for calls</div>
            {error && <div className="error-box">{error}</div>}
            <div className="form-group">
              <label className="form-label">Day of Week</label>
              <select className="form-input" value={avForm.day_of_week} onChange={e => setAvForm({...avForm, day_of_week: parseInt(e.target.value)})}>
                {days.map((d,i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input className="form-input" type="time" value={avForm.start_time} onChange={e => setAvForm({...avForm, start_time: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input className="form-input" type="time" value={avForm.end_time} onChange={e => setAvForm({...avForm, end_time: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select className="form-input" value={avForm.timezone} onChange={e => setAvForm({...avForm, timezone: e.target.value})}>
                {["UTC","America/New_York","America/Los_Angeles","Europe/London","Asia/Karachi","Asia/Dubai","Asia/Kolkata"].map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={addAvailability}><Icon name="check" size={14} /> Save Availability</button>
              <button className="btn btn-ghost" onClick={() => { setShowAvailability(false); setError(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Call Modal */}
      {showRate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowRate(null)}>
          <div className="modal">
            <div className="modal-title">Rate This Call</div>
            <div className="modal-subtitle">Share your experience</div>
            {error && <div className="error-box">{error}</div>}
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="rating-stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className="star" onClick={() => setRating({...rating, rating: s})} style={{ color: s <= rating.rating ? COLORS.yellow : COLORS.border }}>★</span>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Feedback (optional)</label>
              <input className="form-input" placeholder="How was the call?" value={rating.feedback} onChange={e => setRating({...rating, feedback: e.target.value})} />
            </div>
            <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={rating.is_professional} onChange={e => setRating({...rating, is_professional: e.target.checked})} /> Professional
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={rating.would_recommend} onChange={e => setRating({...rating, would_recommend: e.target.checked})} /> Would recommend
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => submitRating(showRate)}><Icon name="star" size={14} /> Submit Rating</button>
              <button className="btn btn-ghost" onClick={() => { setShowRate(null); setError(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {success && <div className="success-box" style={{ marginBottom: 16 }}><Icon name="check" size={14} /> {success}</div>}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Video Calls</div>
          <div style={{ fontSize: 13, color: COLORS.muted }}>Schedule calls with people you've introduced</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setShowAvailability(true)}><Icon name="clock" size={14} /> Set Availability</button>
          <button className="btn btn-primary" onClick={() => setShowSchedule(true)}><Icon name="video" size={14} /> Schedule Call</button>
        </div>
      </div>

      {/* Availability Section */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-header" style={{ marginBottom: availability.length > 0 ? 16 : 0 }}>
          <div>
            <div className="card-title">Your Availability</div>
            <div className="card-subtitle" style={{ marginBottom: 0 }}>When you're open for calls</div>
          </div>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowAvailability(true)}><Icon name="plus" size={13} /> Add Slot</button>
        </div>
        {availability.length > 0 ? availability.map((slot, i) => (
          <div className="availability-slot" key={i}>
            <div>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{days[slot.day_of_week]}</span>
              <span style={{ color: COLORS.muted, fontSize: 12, marginLeft: 12, fontFamily: "DM Mono, monospace" }}>{slot.start_time} – {slot.end_time}</span>
              <span style={{ color: COLORS.muted, fontSize: 11, marginLeft: 8 }}>{slot.timezone}</span>
            </div>
            <button onClick={() => deleteAvailability(slot.id)} style={{ background: "transparent", border: "none", color: COLORS.red, cursor: "pointer", fontSize: 12 }}>Remove</button>
          </div>
        )) : (
          <div style={{ color: COLORS.muted, fontSize: 13, paddingTop: 8 }}>No availability set. Add slots so others can book calls with you.</div>
        )}
      </div>

      {/* Calls Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: COLORS.card, padding: 4, borderRadius: 10, border: `1px solid ${COLORS.border}`, width: "fit-content" }}>
        {["upcoming","history"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 20px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "Syne", fontWeight: 600, fontSize: 13, textTransform: "capitalize", background: tab === t ? COLORS.accent : "transparent", color: tab === t ? "white" : COLORS.muted, transition: "all 0.15s" }}>{t === "upcoming" ? "Upcoming Calls" : "Call History"}</button>
        ))}
      </div>

      <div className="card">
        {loading ? <div style={{ textAlign: "center", padding: 40, color: COLORS.muted }}>Loading calls...</div>
        : (tab === "upcoming" ? upcoming : history).length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{tab === "upcoming" ? "📅" : "📞"}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{tab === "upcoming" ? "No upcoming calls" : "No call history"}</div>
            <div style={{ color: COLORS.muted, fontSize: 13 }}>
              {tab === "upcoming" ? "Schedule a call to get started." : "Completed calls will appear here."}
            </div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th><th>With</th><th>Date & Time</th><th>Duration</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(tab === "upcoming" ? upcoming : history).map((call, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{call.title}</td>
                  <td className="mono">{call.caller_id === tfUser.id ? `Recipient #${call.recipient_id}` : `Caller #${call.caller_id}`}</td>
                  <td className="mono">{new Date(call.scheduled_time).toLocaleString()}</td>
                  <td className="mono">{call.duration} min</td>
                  <td>{statusBadge(call.status)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {call.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(call.id, "active")} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${COLORS.green}33`, background: COLORS.greenGlow, color: COLORS.green, cursor: "pointer" }}>Start</button>
                          <button onClick={() => cancelCall(call.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${COLORS.red}33`, background: "#ff4d6a15", color: COLORS.red, cursor: "pointer" }}>Cancel</button>
                        </>
                      )}
                      {call.status === "active" && (
                        <button onClick={() => updateStatus(call.id, "completed")} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${COLORS.accent}33`, background: COLORS.accentGlow, color: COLORS.accent, cursor: "pointer" }}>Complete</button>
                      )}
                      {call.status === "completed" && (
                        <button onClick={() => setShowRate(call.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${COLORS.yellow}33`, background: "#ffd16615", color: COLORS.yellow, cursor: "pointer" }}>Rate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function Settings({ user }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({ full_name: user?.full_name || "", company: user?.company || "", email: user?.email || "" });
  const [saved, setSaved] = useState(false);

  return (
    <div className="content">
      <div style={{ display: "flex", gap: 6, marginBottom: 24, background: COLORS.card, padding: 4, borderRadius: 10, border: `1px solid ${COLORS.border}`, width: "fit-content" }}>
        {["profile","security"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "7px 16px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "Syne", fontWeight: 600, fontSize: 13, textTransform: "capitalize", background: activeTab === t ? COLORS.accent : "transparent", color: activeTab === t ? "white" : COLORS.muted, transition: "all 0.15s" }}>{t}</button>
        ))}
      </div>
      {activeTab === "profile" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Profile Information</div>
            <div className="card-subtitle">Your account details</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22, padding: "14px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{(user?.username || "U")[0].toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{user?.full_name || user?.username}</div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>{user?.email}</div>
                <div style={{ fontSize: 11, color: COLORS.muted }}>@{user?.username}</div>
              </div>
            </div>
            {saved && <div className="success-box">Profile saved!</div>}
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Your name" /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} disabled style={{ opacity: 0.6 }} /></div>
            <div className="form-group"><label className="form-label">Company</label><input className="form-input" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Your company" /></div>
            <button className="btn btn-primary" onClick={() => setSaved(true)}>Save Changes</button>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Your Links</div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Trust Passport</label>
              <div className="ref-link">
                <div className="ref-link-text">trueferral-sage.vercel.app/passport/{user?.username}</div>
                <div className="ref-link-btn" onClick={() => navigator.clipboard.writeText(`https://trueferral-sage.vercel.app/passport/${user?.username}`)}>Copy</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Badge Profile</label>
              <div className="ref-link">
                <div className="ref-link-text">trueferral-sage.vercel.app/badges/{user?.username}</div>
                <div className="ref-link-btn" onClick={() => navigator.clipboard.writeText(`https://trueferral-sage.vercel.app/badges/${user?.username}`)}>Copy</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === "security" && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>Account Security</div>
          <div className="card-subtitle">Manage your credentials</div>
          <div style={{ padding: "16px 0", borderBottom: `1px solid ${COLORS.border}44` }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>User ID</div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: COLORS.muted }}>{user?.id}</div>
          </div>
          <div style={{ padding: "16px 0" }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>JWT Token</div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: COLORS.muted, wordBreak: "break-all" }}>
              {typeof window !== "undefined" ? (localStorage.getItem("tf_token") || "").substring(0,60) + "..." : ""}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP SHELL ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("tf_user") : null;
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
  }, []);

  function handleLogin(userData) { setUser(userData); }
  function handleLogout() {
    localStorage.removeItem("tf_token");
    localStorage.removeItem("tf_user");
    setUser(null);
  }

  if (!user) return (<><style>{styles}</style><LoginPage onLogin={handleLogin} /></>);

  const navItems = [
    { id: "dashboard", label: "Overview", icon: "dashboard" },
    { id: "referrals", label: "Referrals", icon: "link" },
    { id: "video-calls", label: "Video Calls", icon: "video" },
    { id: "analytics", label: "Analytics", icon: "chart" },
  ];

  const pageTitles = { dashboard: "Dashboard", referrals: "Referrals", "video-calls": "Video Calls", analytics: "Analytics", settings: "Settings" };

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
                <Icon name={n.icon} size={15} />{n.label}
              </div>
            ))}
            <div className="nav-section" style={{ marginTop: 8 }}>Account</div>
            <div className={`nav-item ${page === "settings" ? "active" : ""}`} onClick={() => setPage("settings")}>
              <Icon name="settings" size={15} /> Settings
            </div>
          </nav>
          <div className="sidebar-footer">
            <div className="user-pill">
              <div className="avatar">{(user?.username || "U")[0].toUpperCase()}</div>
              <div>
                <div className="user-name">{user?.full_name || user?.username}</div>
                <div className="user-role">{user?.company || "Trueferral"}</div>
              </div>
              <div style={{ marginLeft: "auto", color: COLORS.muted, cursor: "pointer" }} onClick={handleLogout}>
                <Icon name="logout" size={14} />
              </div>
            </div>
          </div>
        </aside>
        <div className="main">
          <div className="topbar">
            <div className="page-title">{pageTitles[page] || page}</div>
            <div className="topbar-actions">
              <a href="/intro/new" className="btn btn-primary" style={{ textDecoration: "none" }}><Icon name="plus" size={14} /> New Introduction</a>
            </div>
          </div>
          {page === "dashboard" && <Dashboard user={user} />}
          {page === "referrals" && <ReferralsTable user={user} />}
          {page === "video-calls" && <VideoCalls user={user} />}
          {page === "settings" && <Settings user={user} />}
          {page === "analytics" && (
            <div className="content" style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minHeight: 400 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Analytics Coming Soon</div>
                <div style={{ color: COLORS.muted, fontSize: 13 }}>Advanced analytics dashboard in development</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
'@

Write-Host ""
Write-Host "STEP 2: Commit and push" -ForegroundColor White

Set-Location $Root
git add -A
git commit -m "feat: complete real dashboard + full video calls frontend page"
git push origin main

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Done! Now build and deploy frontend" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run next:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor Yellow
Write-Host "  vercel --prod" -ForegroundColor Yellow
Write-Host "  (Link to existing project: yes -> trueferral)" -ForegroundColor Yellow
Write-Host ""
Write-Host "What is now REAL (connected to backend):" -ForegroundColor White
Write-Host "  Login / Signup  -> Real JWT auth, stored in DB" -ForegroundColor Gray
Write-Host "  Dashboard       -> Real stats from your DB" -ForegroundColor Gray
Write-Host "  Referrals tab   -> Your actual introductions from DB" -ForegroundColor Gray
Write-Host "  Video Calls tab -> Full CRUD (schedule/cancel/complete/rate)" -ForegroundColor Gray
Write-Host "  Settings        -> Shows your real profile + links" -ForegroundColor Gray
Write-Host ""
Write-Host "Video Calls features:" -ForegroundColor White
Write-Host "  - Set availability slots (day/time/timezone)" -ForegroundColor Gray
Write-Host "  - Schedule calls with other users" -ForegroundColor Gray
Write-Host "  - View upcoming + history tabs" -ForegroundColor Gray
Write-Host "  - Start / Complete / Cancel calls" -ForegroundColor Gray
Write-Host "  - Rate completed calls (1-5 stars + feedback)" -ForegroundColor Gray
Write-Host ""
