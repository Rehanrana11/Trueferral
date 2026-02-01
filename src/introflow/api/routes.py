from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from introflow.domain.contracts import AuthContext
from introflow.service.core_loop import CreateIntroReceiptCommand, CreateIntroReceiptService
from introflow.service.errors import ServiceError, UnauthorizedError, ValidationError

from .deps import get_auth_context, get_intro_receipt_service
from .schemas import IntroReceiptCreateRequest, IntroReceiptResponse


router = APIRouter(prefix="/v1", tags=["v1"])


@router.post("/intro-receipts", status_code=status.HTTP_200_OK)
def create_intro_receipt(
    req: IntroReceiptCreateRequest,
    svc: CreateIntroReceiptService = Depends(get_intro_receipt_service),
    auth: AuthContext = Depends(get_auth_context),
):
    """
    Step 46: Minimal API skeleton endpoint.
    Returns IntroReceiptResponse on success.
    """
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