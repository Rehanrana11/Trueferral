from __future__ import annotations

from fastapi import FastAPI

from introflow.health import health_payload
from introflow.version import __version__
from introflow.api.routes import router as v1_router
from introflow.observability.middleware import ObservabilityMiddleware

app = FastAPI(title="IntroFlow", version=__version__)
app.add_middleware(ObservabilityMiddleware)
app.include_router(v1_router)

@app.get("/health")
def health():
    return health_payload(__version__)