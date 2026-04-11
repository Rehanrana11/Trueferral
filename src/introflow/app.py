from __future__ import annotations

from fastapi import FastAPI

from introflow.health import health_payload
from introflow.version import __version__
from introflow.api.routes import router as v1_router
from introflow.observability.middleware import ObservabilityMiddleware
from introflow.routes.video_calls import (
    availability_router,
    rating_router,
    router as video_router,
)

app = FastAPI(
    title="IntroFlow / Trueferral",
    version=__version__,
    description="Trust-based professional introduction platform.",
)

app.add_middleware(ObservabilityMiddleware)

app.include_router(v1_router)
app.include_router(video_router)
app.include_router(availability_router)
app.include_router(rating_router)


@app.get("/health", tags=["meta"])
def health() -> dict:
    return health_payload(__version__)