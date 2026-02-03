from __future__ import annotations

"""
Step 48: Input Validation Hardening

Security & Quality Goals:
1. Reject unknown fields (prevents parameter pollution attacks)
2. Strict type checking (prevents silent coercion bugs)
3. Deterministic normalization (aligns with service layer)
4. Clear, actionable error messages
5. Defense in depth (validation at API boundary + service layer)

Hard rules:
- No DB/ORM imports
- No silent data transformations
- Fail fast with clear errors
"""

from typing import Annotated, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)


class StrictApiModel(BaseModel):
    """
    Strict base model for all API schemas.
    
    Security properties:
    - extra="forbid": Reject unknown fields (prevents injection)
    - strict=True: No silent type coercion (prevents bugs)
    - str_strip_whitespace=True: Normalize input deterministically
    """
    model_config = ConfigDict(
        extra="forbid",
        strict=True,
        str_strip_whitespace=True,
        validate_default=True,
        populate_by_name=False,
    )


class IntroReceiptCreateRequest(StrictApiModel):
    """
    Request to create an intro receipt.
    
    Validation rules:
    - counterparty: Required, min 1 char after strip, max 200 chars
    - note: Optional, max 1000 chars if provided
    """
    counterparty: Annotated[
        str,
        Field(
            min_length=1,
            max_length=200,
            description="Name or identifier of the person being introduced",
            examples=["Alice Chen", "Bob (from Stanford)"],
        )
    ]
    
    note: Annotated[
        Optional[str],
        Field(
            None,
            max_length=1000,
            description="Optional context or message about the introduction",
            examples=["Met at tech conference", "Interested in AI research"],
        )
    ]

    @field_validator("counterparty")
    @classmethod
    def validate_counterparty_not_empty(cls, v: str) -> str:
        """
        Ensure counterparty is not empty after normalization.
        
        This aligns with Step 45 service layer validation.
        Pydantic's str_strip_whitespace handles the strip automatically.
        """
        if not v:
            raise ValueError("counterparty cannot be empty or whitespace-only")
        return v
    
    @field_validator("note")
    @classmethod
    def validate_note_if_present(cls, v: Optional[str]) -> Optional[str]:
        """
        If note is provided, ensure it's not just whitespace.
        Return None for empty notes (deterministic normalization).
        """
        if v is not None and not v.strip():
            return None
        return v

    @model_validator(mode="after")
    def validate_business_rules(self):
        """
        Additional business rule validation.
        (Placeholder for future cross-field validations)
        """
        return self


class IntroReceiptResponse(StrictApiModel):
    """
    Response containing created intro receipt data.
    
    All fields are required (no Optional except note).
    """
    receipt_id: Annotated[
        str,
        Field(
            description="Unique identifier for this receipt",
            examples=["eid_abc123"],
        )
    ]
    
    created_at: Annotated[
        str,
        Field(
            description="ISO 8601 timestamp of creation",
            examples=["2026-02-01T12:00:00+00:00"],
        )
    ]
    
    created_by: Annotated[
        str,
        Field(
            description="Subject identifier who created this receipt",
            examples=["user_xyz"],
        )
    ]
    
    counterparty: Annotated[
        str,
        Field(
            description="Name or identifier of the person being introduced",
            examples=["Alice Chen"],
        )
    ]
    
    note: Annotated[
        Optional[str],
        Field(
            None,
            description="Optional context or message about the introduction",
        )
    ]


# ============================================================
# ERROR RESPONSE SCHEMAS (for documentation/consistency)
# ============================================================

class ErrorDetail(StrictApiModel):
    """Standard error detail format."""
    loc: list[str] = Field(description="Location of the error (field path)")
    msg: str = Field(description="Human-readable error message")
    type: str = Field(description="Error type identifier")


class ValidationErrorResponse(StrictApiModel):
    """422 Validation Error response format."""
    detail: list[ErrorDetail] = Field(description="List of validation errors")


class ErrorResponse(StrictApiModel):
    """Generic error response format."""
    detail: str = Field(description="Error message")