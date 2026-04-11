"""
IntroFlow application entry point.

Used when running directly: python -m introflow
or: uvicorn introflow.main:app
"""
from __future__ import annotations

from introflow.app import app  # re-export for uvicorn

__all__ = ["app"]