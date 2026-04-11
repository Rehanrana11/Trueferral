from __future__ import annotations

from typing import Annotated, Any, Dict, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


class StrictApiModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        strict=True,
        str_strip_whitespace=True,
        validate_default=True,
        populate_by_name=False,
    )


# â”€â”€â”€ Intro Receipt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class IntroReceiptCreateRequest(StrictApiModel):
    counterparty: Annotated[
        str,
        Field(min_length=1, max_length=200,
              description="Name or identifier of the person being introduced"),
    ]
    note: Annotated[
        Optional[str],
        Field(None, max_length=1000, description="Optional context"),
    ]

    @field_validator("counterparty")
    @classmethod
    def validate_counterparty_not_empty(cls, v: str) -> str:
        if not v:
            raise ValueError("counterparty cannot be empty or whitespace-only")
        return v

    @field_validator("note")
    @classmethod
    def normalize_note(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            return None
        return v

    @model_validator(mode="after")
    def validate_business_rules(self) -> "IntroReceiptCreateRequest":
        return self


class IntroReceiptResponse(StrictApiModel):
    receipt_id: str
    created_at: str
    created_by: str
    counterparty: str
    note: Optional[str] = None


# â”€â”€â”€ Confirm Introduction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class ConfirmIntroRequest(StrictApiModel):
    token: Annotated[str, Field(min_length=1, max_length=512)]
    confirm: bool
    confirmed_at: Optional[str] = None

    @field_validator("confirm")
    @classmethod
    def must_be_true(cls, v: bool) -> bool:
        if not v:
            raise ValueError("confirm must be true to confirm an introduction")
        return v


class ConfirmIntroResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ok: bool
    data: Optional[Dict[str, Any]] = None


# â”€â”€â”€ Freeze Snapshot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class FreezeSnapshotResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ok: bool
    snapshot_id: str
    state: str


# â”€â”€â”€ Generic Error Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class ErrorDetail(StrictApiModel):
    loc: list[str] = Field(description="Location of the error")
    msg: str = Field(description="Human-readable error message")
    type: str = Field(description="Error type identifier")


class ValidationErrorResponse(StrictApiModel):
    detail: list[ErrorDetail]


class ErrorResponse(StrictApiModel):
    detail: str