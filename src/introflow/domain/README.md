# Domain Layer (Step 41)

This package is the **pure business layer**.

## Hard Rules (Non-Negotiable)
- **No IO**: no DB, no network, no file reads/writes.
- **No framework imports**: do not import FastAPI, SQLAlchemy, pydantic-settings, etc.
- **No env reads**: do not access environment variables here.
- Allowed: `typing`, `dataclasses`, `datetime`, `uuid`.

## What belongs here
- Domain primitives (IDs, timestamps)
- Domain entities/value objects (later)
- Domain contracts (protocols) that infra must implement

## What does NOT belong here
- Persistence, migrations, HTTP, CLI, background jobs, config loading