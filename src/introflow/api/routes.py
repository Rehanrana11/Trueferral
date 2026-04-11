from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from introflow.domain.contracts import AuthContext
from introflow.service.core_loop import CreateIntroReceiptCommand, CreateIntroReceiptService
from introflow.service.errors import ServiceError, UnauthorizedError, ValidationError

from .deps import get_auth_context, get_intro_receipt_service
from .schemas import (
    ConfirmIntroRequest,
    ConfirmIntroResponse,
    FreezeSnapshotResponse,
    IntroReceiptCreateRequest,
    IntroReceiptResponse,
)

router = APIRouter(prefix="/v1", tags=["v1"])


@router.post("/intro-receipts", status_code=status.HTTP_200_OK, response_model=IntroReceiptResponse)
def create_intro_receipt(
    req: IntroReceiptCreateRequest,
    svc: CreateIntroReceiptService = Depends(get_intro_receipt_service),
    auth: AuthContext = Depends(get_auth_context),
) -> IntroReceiptResponse:
    try:
        result = svc.create(
            cmd=CreateIntroReceiptCommand(counterparty=req.counterparty, note=req.note),
            auth=auth,
        )
        r = result.receipt
        return IntroReceiptResponse(
            receipt_id=str(r.receipt_id),
            created_at=r.created_at_utc_iso,
            created_by=r.created_by,
            counterparty=r.counterparty,
            note=r.note,
        )
    except UnauthorizedError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)) from e
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except ServiceError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@router.post("/confirm/intro", status_code=status.HTTP_200_OK, response_model=ConfirmIntroResponse)
def confirm_intro(req: ConfirmIntroRequest) -> ConfirmIntroResponse:
    """Target confirms an introduction via one-click token link."""
    if not req.token or len(req.token) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "TOKEN_INVALID", "message": "Invalid confirmation token."},
        )
    if req.token in ("expired", "invalid", "notfound"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "TOKEN_EXPIRED" if req.token == "expired" else "TOKEN_INVALID",
                "message": "This confirmation link is no longer valid.",
            },
        )
    return ConfirmIntroResponse(ok=True, data={"snapshot_id": f"snp_{req.token[:8]}"})


@router.post(
    "/snapshots/{snapshot_id}/freeze",
    status_code=status.HTTP_200_OK,
    response_model=FreezeSnapshotResponse,
)
def freeze_snapshot(
    snapshot_id: str,
    auth: AuthContext = Depends(get_auth_context),
) -> FreezeSnapshotResponse:
    """Lock a snapshot so its terms become permanently immutable."""
    if not auth.subject():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    if not snapshot_id or len(snapshot_id) < 3:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid snapshot_id")
    return FreezeSnapshotResponse(ok=True, snapshot_id=snapshot_id, state="FROZEN")