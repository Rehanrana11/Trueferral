"""
API layer (Step 46): FastAPI router + schemas + dependency providers.

Hard rules:
- API may import FastAPI/Pydantic.
- API MUST NOT import DB engine, SQLAlchemy, Alembic, or run any IO.
- All IO boundaries are via service/repo protocols and dependency overrides.
"""