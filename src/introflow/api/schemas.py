from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class IntroReceiptCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    counterparty: str = Field(..., min_length=1, description="Who the intro is for (free-form, v0)")
    note: Optional[str] = Field(None, description="Optional note")


class IntroReceiptResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    receipt_id: str
    created_at: str
    created_by: str
    counterparty: str
    note: Optional[str] = None