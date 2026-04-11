"""
pytest configuration and shared fixtures.

Ensures src/ is on sys.path so all tests can import introflow
without the package needing to be pip-installed.
"""
from __future__ import annotations

import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "src")
if SRC not in sys.path:
    sys.path.insert(0, SRC)