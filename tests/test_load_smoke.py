from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi.testclient import TestClient
from introflow.app import app

def _post_once(i: int) -> None:
    cid = f"cid_smoke_{i:03d}"
    with TestClient(app) as c:
        r = c.post(
            "/v1/intro-receipts",
            json={"counterparty": "Mike", "note": "hi"},
            headers={"X-IntroFlow-Subject": "user_load_smoke", "X-Correlation-Id": cid},
        )
    assert r.status_code == 200, r.text
    assert r.headers.get("X-Correlation-Id") == cid
    dur = r.headers.get("X-Request-Duration-Ms")
    assert dur is not None and int(dur) >= 0
    body = r.json()
    for k in ("receipt_id", "created_at", "created_by", "counterparty", "note"):
        assert k in body
    assert body["created_by"] == "user_load_smoke"

def test_load_smoke_sequential_burst():
    for i in range(50):
        _post_once(i)

def test_load_smoke_tiny_concurrent_burst():
    with ThreadPoolExecutor(max_workers=5) as ex:
        futures = [ex.submit(_post_once, i) for i in range(20)]
        for f in as_completed(futures):
            f.result()