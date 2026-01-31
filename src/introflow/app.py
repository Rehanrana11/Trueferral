from __future__ import annotations

from fastapi import FastAPI

from introflow.health import health_payload
from introflow.version import __version__

app = FastAPI(title="IntroFlow", version=__version__)

@app.get("/health")
def health():
    return health_payload(__version__)