from __future__ import annotations

from typing import List, TypedDict, Dict, Any

class DepCheck(TypedDict):
    ok: bool
    missing: List[str]

def check_dependencies() -> DepCheck:
    missing: List[str] = []
    for mod in ("fastapi", "pydantic", "structlog"):
        try:
            __import__(mod)
        except Exception:
            missing.append(mod)
    return {"ok": len(missing) == 0, "missing": missing}

def health_payload(version: str) -> Dict[str, Any]:
    dep = check_dependencies()
    status = "ok" if dep["ok"] else "degraded"
    return {
        "status": status,
        "version": version,
        "dependencies": dep,
    }