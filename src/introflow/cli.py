from __future__ import annotations

import argparse
import json
from typing import Optional

from introflow.domain.types import EntityId
from introflow.service.core_loop import (
    CreateIntroReceiptCommand,
    CreateIntroReceiptService,
    IntroReceipt,
)


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="introflow", description="IntroFlow MVP operator entrypoint (Step 50).")
    sub = p.add_subparsers(dest="command", required=True)
    serve = sub.add_parser("serve", help="Run the FastAPI app using uvicorn.")
    serve.add_argument("--host", default="127.0.0.1")
    serve.add_argument("--port", type=int, default=8000)
    serve.add_argument("--reload", action="store_true")
    smoke = sub.add_parser("smoke", help="Deterministic dry-run of core loop (no DB, no HTTP).")
    smoke.add_argument("--counterparty", default="Mike")
    smoke.add_argument("--note", default="hi")
    return p


def _cmd_serve(*, host: str, port: int, reload: bool) -> int:
    import uvicorn
    uvicorn.run("introflow.app:app", host=host, port=port, reload=reload, log_level="info")
    return 0


def _cmd_smoke(*, counterparty: str, note: str) -> int:
    class _FakeClock:
        def now_utc_iso(self) -> str:
            return "2026-02-01T00:00:00+00:00"

    class _FakeIdGen:
        def new_entity_id(self) -> EntityId:
            return EntityId("eid_smoke_123")

    class _FakeRepo:
        def __init__(self) -> None:
            self.added: list[IntroReceipt] = []
        def add(self, entity: IntroReceipt) -> None:
            self.added.append(entity)
        def get(self, entity_id: EntityId) -> Optional[IntroReceipt]:
            return None
        def list(self, *, limit: int = 100, offset: int = 0):
            return ()
        def update(self, entity: IntroReceipt) -> None:
            return None
        def delete(self, entity_id: EntityId) -> None:
            return None

    class _FakeAuth:
        def subject(self) -> Optional[str]:
            return "smoke_user"

    repo = _FakeRepo()
    svc = CreateIntroReceiptService(repo=repo, clock=_FakeClock(), id_generator=_FakeIdGen())
    result = svc.create(cmd=CreateIntroReceiptCommand(counterparty=counterparty, note=note), auth=_FakeAuth())
    r = result.receipt
    payload = {"receipt_id": str(r.receipt_id), "created_at": r.created_at_utc_iso, "created_by": r.created_by, "counterparty": r.counterparty, "note": r.note}
    print(json.dumps(payload, sort_keys=True))
    return 0


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    if args.command == "serve":
        return _cmd_serve(host=args.host, port=args.port, reload=args.reload)
    if args.command == "smoke":
        return _cmd_smoke(counterparty=args.counterparty, note=args.note)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())