"""
Domain skeleton tests.

These verify the domain module remains pure (no framework dependencies).
"""

def test_domain_import_is_pure():
    """Domain package should import without side-effects."""
    import introflow.domain as d  # noqa: F401
    
    # Basic smoke test
    assert hasattr(d, "EntityId")
    assert hasattr(d, "CorrelationId")
    assert hasattr(d, "UtcNow")


def test_domain_module_has_no_framework_dependencies():
    """
    Verify domain module code does not import frameworks.
    
    This checks the module's own imports, not what's in sys.modules
    from other tests that ran earlier.
    """
    import importlib
    import sys
    
    # Snapshot modules before importing domain
    before = set(sys.modules.keys())
    
    # Import domain in isolation (it's already imported, so reload)
    if "introflow.domain" in sys.modules:
        # Clear domain modules to test fresh import
        domain_mods = [k for k in sys.modules if k.startswith("introflow.domain")]
        for mod in domain_mods:
            del sys.modules[mod]
    
    # Fresh import
    import introflow.domain  # noqa: F401
    
    # Snapshot after
    after = set(sys.modules.keys())
    
    # Find what was imported by domain module
    new_imports = after - before
    
    # Framework prefixes that should NOT be imported by domain
    forbidden = ("fastapi", "sqlalchemy", "alembic", "pydantic_settings", "uvicorn")
    
    # Check if domain imported any frameworks
    framework_imports = [m for m in new_imports if m.startswith(forbidden)]
    
    assert framework_imports == [], (
        f"Domain module imported frameworks: {framework_imports}. "
        "Domain must remain pure (no framework dependencies)."
    )


def test_domain_types_are_usable():
    """Verify domain types work correctly."""
    from introflow.domain import EntityId, CorrelationId, UtcNow
    from introflow.domain.types import NewEntityId, NewCorrelationId, UlidLike
    
    # Test factories
    eid = NewEntityId()
    assert isinstance(eid, str)
    
    cid = NewCorrelationId()
    assert isinstance(cid, str)
    
    # Test UlidLike
    ulid = UlidLike.new()
    assert isinstance(ulid, UlidLike)
    assert len(str(ulid)) > 0
    
    # Test UtcNow
    import datetime
    now = UtcNow()
    assert isinstance(now, datetime.datetime)
    assert now.tzinfo == datetime.timezone.utc