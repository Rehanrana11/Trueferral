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