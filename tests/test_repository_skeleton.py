def test_repository_layer_import_is_pure():
    """Repository layer should not import frameworks."""
    import sys
    
    # Snapshot before
    before = set(sys.modules.keys())
    
    # Clear repository modules to test fresh import
    repo_mods = [k for k in sys.modules if k.startswith("introflow.repository")]
    for mod in repo_mods:
        del sys.modules[mod]
    
    # Fresh import
    import introflow.repository  # noqa: F401
    
    # Snapshot after
    after = set(sys.modules.keys())
    
    # What did repository import?
    new_imports = after - before
    
    # Framework prefixes that should NOT be imported by repository
    forbidden = ("sqlalchemy", "fastapi", "alembic", "psycopg", "uvicorn")
    
    # Check if repository imported any frameworks
    framework_imports = [m for m in new_imports if m.startswith(forbidden)]
    
    assert framework_imports == [], (
        f"Repository layer imported frameworks: {framework_imports}. "
        "Repository must remain pure (no framework dependencies)."
    )


def test_repository_crud_protocol_exists():
    """Verify CrudRepository protocol is available."""
    from introflow.repository import CrudRepository
    
    # Check required methods
    required = ["get", "list", "add", "update", "delete"]
    for method in required:
        assert hasattr(CrudRepository, method), f"Missing method: {method}"