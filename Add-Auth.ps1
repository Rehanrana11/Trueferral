# =============================================================================
# Add-Auth.ps1
# Adds real login/signup backend + connects frontend to it
# Run from: C:\Users\devel\OneDrive\Documents\Software\Trueferral-main
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
Write-Host "  Adding Real Auth + Connecting Frontend" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# =============================================================================
# BACKEND — Auth Service (stdlib only, no new packages)
# =============================================================================
Write-Host "STEP 1: Auth service (password hashing + JWT)" -ForegroundColor White

Write-UTF8 "$Root\src\introflow\services\auth_service.py" @'
"""
Auth Service - password hashing and JWT tokens using stdlib only.
No new packages required.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
import uuid
from typing import Optional


def _hash_password(password: str, salt: str) -> str:
    return hmac.new(salt.encode(), password.encode(), hashlib.sha256).hexdigest()


def hash_password(password: str) -> str:
    """Return  salt$hash"""
    salt = os.urandom(32).hex()
    return f"{salt}${_hash_password(password, salt)}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, expected = stored.split("$", 1)
        return hmac.compare_digest(_hash_password(password, salt), expected)
    except Exception:
        return False


def _b64(data: str) -> str:
    return base64.urlsafe_b64encode(data.encode()).decode().rstrip("=")


def _unb64(data: str) -> str:
    padding = 4 - len(data) % 4
    return base64.urlsafe_b64decode(data + "=" * padding).decode()


def create_token(user_id: str, email: str, secret: str, expires_hours: int = 72) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": int(time.time()) + expires_hours * 3600,
               "iat": int(time.time())}
    header = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}))
    body = _b64(json.dumps(payload))
    sig = hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).hexdigest()
    return f"{header}.{body}.{sig}"


def verify_token(token: str, secret: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, body, sig = parts
        expected = hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(_unb64(body))
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


def new_user_id() -> str:
    return str(uuid.uuid4())
'@

# =============================================================================
# BACKEND — Auth Routes
# =============================================================================
Write-Host "STEP 2: Auth routes (/auth/register, /auth/login, /auth/me)" -ForegroundColor White

Write-UTF8 "$Root\src\introflow\routes\auth.py" @'
"""
Auth Routes - register, login, me, logout
"""
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import text
from sqlalchemy.orm import Session
from introflow.db.engine import create_engine_from_settings
from introflow.services.auth_service import create_token, hash_password, new_user_id, verify_password, verify_token
from introflow.config.settings import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])
_engine = None

def _get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine_from_settings()
    return _engine

def get_db():
    from sqlalchemy.orm import sessionmaker
    db = sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())()
    try:
        yield db
    finally:
        db.close()

def ensure_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS tf_users (
            id VARCHAR(36) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(100) UNIQUE NOT NULL,
            full_name VARCHAR(255) DEFAULT '',
            company VARCHAR(255) DEFAULT '',
            password_hash TEXT NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP NOT NULL DEFAULT now(),
            updated_at TIMESTAMP NOT NULL DEFAULT now()
        )
    """))
    db.commit()

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    username: str = Field(..., min_length=2, max_length=50)
    full_name: Optional[str] = None
    company: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    username: str
    full_name: Optional[str] = None
    company: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: UserProfile

def _by_email(db, email):
    r = db.execute(text("SELECT * FROM tf_users WHERE email=:e"), {"e": email}).fetchone()
    return dict(r._mapping) if r else None

def _by_id(db, uid):
    r = db.execute(text("SELECT * FROM tf_users WHERE id=:id"), {"id": uid}).fetchone()
    return dict(r._mapping) if r else None

def _secret():
    return get_settings().secret_key

def _token_from(request: Request):
    auth = request.headers.get("Authorization", "")
    return auth[7:].strip() if auth.startswith("Bearer ") else None

@router.post("/register", response_model=AuthResponse, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    ensure_table(db)
    email = req.email.lower().strip()
    username = req.username.lower().strip()
    if _by_email(db, email):
        raise HTTPException(409, detail="Email already registered.")
    if db.execute(text("SELECT id FROM tf_users WHERE username=:u"), {"u": username}).fetchone():
        raise HTTPException(409, detail="Username already taken.")
    uid = new_user_id()
    db.execute(text("""
        INSERT INTO tf_users (id,email,username,full_name,company,password_hash)
        VALUES (:id,:email,:username,:fn,:co,:pw)
    """), {"id": uid, "email": email, "username": username,
           "fn": req.full_name or "", "co": req.company or "",
           "pw": hash_password(req.password)})
    db.commit()
    return AuthResponse(token=create_token(uid, email, _secret()),
                        user=UserProfile(id=uid, email=email, username=username,
                                         full_name=req.full_name, company=req.company))

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    ensure_table(db)
    email = req.email.lower().strip()
    user = _by_email(db, email)
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(401, detail="Invalid email or password.")
    if not user["is_active"]:
        raise HTTPException(403, detail="Account deactivated.")
    return AuthResponse(token=create_token(user["id"], email, _secret()),
                        user=UserProfile(id=user["id"], email=user["email"],
                                         username=user["username"],
                                         full_name=user.get("full_name"),
                                         company=user.get("company")))

@router.get("/me", response_model=UserProfile)
def me(request: Request, db: Session = Depends(get_db)):
    ensure_table(db)
    token = _token_from(request)
    if not token:
        raise HTTPException(401, detail="Missing Authorization: Bearer <token>")
    payload = verify_token(token, _secret())
    if not payload:
        raise HTTPException(401, detail="Invalid or expired token.")
    user = _by_id(db, payload["sub"])
    if not user:
        raise HTTPException(404, detail="User not found.")
    return UserProfile(id=user["id"], email=user["email"], username=user["username"],
                       full_name=user.get("full_name"), company=user.get("company"))

@router.post("/logout")
def logout():
    return {"ok": True, "message": "Logged out."}
'@

# =============================================================================
# BACKEND — Update app.py to include auth router + CORS
# =============================================================================
Write-Host "STEP 3: Update app.py with auth router + CORS" -ForegroundColor White

Write-UTF8 "$Root\src\introflow\app.py" @'
from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from introflow.health import health_payload
from introflow.version import __version__
from introflow.api.routes import router as v1_router
from introflow.observability.middleware import ObservabilityMiddleware
from introflow.routes.video_calls import availability_router, rating_router, router as video_router
from introflow.routes.auth import router as auth_router

app = FastAPI(
    title="IntroFlow / Trueferral",
    version=__version__,
    description="Trust-based professional introduction platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://trueferral-sage.vercel.app",
        "https://trueferral.vercel.app",
        "https://trueferral-app.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(ObservabilityMiddleware)
app.include_router(auth_router)
app.include_router(v1_router)
app.include_router(video_router)
app.include_router(availability_router)
app.include_router(rating_router)

@app.get("/health", tags=["meta"])
def health() -> dict:
    return health_payload(__version__)
'@

# =============================================================================
# FRONTEND — Update page.jsx login/signup to call real backend
# =============================================================================
Write-Host "STEP 4: Update frontend login/signup to use real API" -ForegroundColor White

$loginPage = "$Root\frontend\src\app\page.jsx"
$loginContent = [System.IO.File]::ReadAllText($loginPage)

# Replace the LoginPage component with real API calls
$oldLogin = 'function LoginPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");'

$newLogin = 'function LoginPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "https://trueferral.onrender.com";

  async function handleAuth() {
    setError("");
    setLoading(true);
    try {
      const endpoint = tab === "login" ? "/auth/login" : "/auth/register";
      const body = tab === "login"
        ? { email, password }
        : { email, password, username, full_name: "", company };
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } catch (e) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }'

$loginContent = $loginContent.Replace($oldLogin, $newLogin)

# Replace the button onClick
$loginContent = $loginContent.Replace(
    'onClick={onLogin}',
    'onClick={handleAuth} disabled={loading}'
)

# Replace button text
$loginContent = $loginContent.Replace(
    '{tab === "login" ? "Sign In to Dashboard" : "Create Account"}',
    '{loading ? "Please wait..." : tab === "login" ? "Sign In to Dashboard" : "Create Account"}'
)

# Add error display before button (find the button and add error before it)
$loginContent = $loginContent.Replace(
    '<button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: 14, marginTop: 4 }}',
    '{error && <div style={{ color: COLORS.red, fontSize: 13, marginBottom: 10, padding: "8px 12px", background: "#ff4d6a15", borderRadius: 6, border: "1px solid #ff4d6a33" }}>{error}</div>}
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "11px", fontSize: 14, marginTop: 4 }}'
)

# Add username field for signup
$loginContent = $loginContent.Replace(
    '{tab === "signup" && (
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input className="form-input" type="text" placeholder="Acme Corp" />
          </div>
        )}',
    '{tab === "signup" && (
          <>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" type="text" placeholder="johndoe" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="form-input" type="text" placeholder="Acme Corp" value={company} onChange={e => setCompany(e.target.value)} />
            </div>
          </>
        )}'
)

[System.IO.File]::WriteAllText($loginPage, $loginContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "  [FIXED] frontend login page with real auth" -ForegroundColor Green

# =============================================================================
# FRONTEND — Update App shell to pass user + handle logout
# =============================================================================
Write-Host "STEP 5: Update App shell with user state + logout" -ForegroundColor White

# Fix the App default export to accept user from login
$loginContent = [System.IO.File]::ReadAllText($loginPage)
$loginContent = $loginContent.Replace(
    'export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");

  if (!loggedIn) return (
    <>
      <style>{styles}</style>
      <LoginPage onLogin={() => setLoggedIn(true)} />
    </>
  );',
    'export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  function handleLogin(userData) {
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem("tf_token");
    localStorage.removeItem("tf_user");
    setUser(null);
  }

  if (!user) return (
    <>
      <style>{styles}</style>
      <LoginPage onLogin={handleLogin} />
    </>
  );'
)

# Fix logout button
$loginContent = $loginContent.Replace(
    'onClick={() => setLoggedIn(false)}',
    'onClick={handleLogout}'
)

# Fix user display in sidebar
$loginContent = $loginContent.Replace(
    '<div className="user-name">Mike Thompson</div>
              <div className="user-role">Admin · Pro</div>',
    '<div className="user-name">{user?.username || user?.email || "User"}</div>
              <div className="user-role">{user?.company || "Trueferral"}</div>'
)

# Fix avatar initials
$loginContent = $loginContent.Replace(
    '<div className="avatar">MT</div>',
    '<div className="avatar">{(user?.username || "U")[0].toUpperCase()}</div>'
)

[System.IO.File]::WriteAllText($loginPage, $loginContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "  [FIXED] App shell with user state" -ForegroundColor Green

# =============================================================================
# FRONTEND — Fix intro page to use real API + auth token
# =============================================================================
Write-Host "STEP 6: Fix intro page API URL + auth header" -ForegroundColor White

$introFile = "$Root\frontend\src\app\intro\[id]\page.tsx"
$introContent = [System.IO.File]::ReadAllText($introFile)

# Fix API URL
$introContent = $introContent.Replace(
    'const res = await fetch("/v1/intro-receipts"',
    'const API = process.env.NEXT_PUBLIC_API_URL || "https://trueferral.onrender.com";
      const token = typeof window !== "undefined" ? localStorage.getItem("tf_token") : null;
      const res = await fetch(`${API}/v1/intro-receipts`'
)

# Fix headers to include auth
$introContent = $introContent.Replace(
    'headers: { "Content-Type": "application/json" },',
    'headers: { "Content-Type": "application/json", "X-IntroFlow-Subject": token || "demo-user", ...(token ? { "Authorization": `Bearer ${token}` } : {}) },'
)

[System.IO.File]::WriteAllText($introFile, $introContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "  [FIXED] intro page API" -ForegroundColor Green

# =============================================================================
# FRONTEND — Fix confirm page to use real API
# =============================================================================
Write-Host "STEP 7: Fix confirm page API URL" -ForegroundColor White

$confirmFile = "$Root\frontend\src\app\confirm\[token]\page.tsx"
$confirmContent = [System.IO.File]::ReadAllText($confirmFile)
$confirmContent = $confirmContent.Replace(
    'const res = await fetch("/v1/confirm/intro"',
    'const API = process.env.NEXT_PUBLIC_API_URL || "https://trueferral.onrender.com";
      const res = await fetch(`${API}/v1/confirm/intro`'
)
[System.IO.File]::WriteAllText($confirmFile, $confirmContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "  [FIXED] confirm page API" -ForegroundColor Green

# =============================================================================
# FRONTEND — Fix snapshot/risk lock page
# =============================================================================
Write-Host "STEP 8: Fix snapshot page API URL" -ForegroundColor White

$snapFile = "$Root\frontend\src\app\snapshot\[id]\review\page.tsx"
$snapContent = [System.IO.File]::ReadAllText($snapFile)
$snapContent = $snapContent.Replace(
    'const res = await fetch(`/v1/snapshots/${id}/freeze`',
    'const API = process.env.NEXT_PUBLIC_API_URL || "https://trueferral.onrender.com";
      const token = typeof window !== "undefined" ? localStorage.getItem("tf_token") : null;
      const res = await fetch(`${API}/v1/snapshots/${id}/freeze`'
)
$snapContent = $snapContent.Replace(
    'headers: { "Content-Type": "application/json" },',
    'headers: { "Content-Type": "application/json", ...(token ? { "X-IntroFlow-Subject": token, "Authorization": `Bearer ${token}` } : { "X-IntroFlow-Subject": "demo-user" }) },'
)
[System.IO.File]::WriteAllText($snapFile, $snapContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "  [FIXED] snapshot page API" -ForegroundColor Green

# =============================================================================
# FRONTEND — Add .env.local with API URL
# =============================================================================
Write-Host "STEP 9: Create .env.local for local dev" -ForegroundColor White

Write-UTF8 "$Root\frontend\.env.local" @'
NEXT_PUBLIC_API_URL=https://trueferral.onrender.com
'@

# =============================================================================
# GIT — Commit and push everything
# =============================================================================
Write-Host ""
Write-Host "STEP 10: Commit and push to GitHub" -ForegroundColor White

Set-Location $Root
git add -A
git commit -m "feat: add real login/signup auth + connect frontend to backend"
git push origin main

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Done! Now redeploy frontend on Vercel" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run this next:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor Yellow
Write-Host "  vercel --prod" -ForegroundColor Yellow
Write-Host "  (link to existing project: trueferral)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Auth endpoints now live at:" -ForegroundColor White
Write-Host "  POST https://trueferral.onrender.com/auth/register" -ForegroundColor Gray
Write-Host "  POST https://trueferral.onrender.com/auth/login" -ForegroundColor Gray
Write-Host "  GET  https://trueferral.onrender.com/auth/me" -ForegroundColor Gray
Write-Host ""
