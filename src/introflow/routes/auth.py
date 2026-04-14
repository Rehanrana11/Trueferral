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