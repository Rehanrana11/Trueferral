# ============================================================
# IntroFlow Environment Diagnostic
# Paste this ENTIRE block into PowerShell and press Enter
# Then copy ALL the output and paste it back to Claude
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " IntroFlow Environment Diagnostic" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Windows version
Write-Host "--- WINDOWS ---" -ForegroundColor Yellow
Write-Host "OS: $([System.Environment]::OSVersion.VersionString)"
Write-Host ""

# 2. Python
Write-Host "--- PYTHON ---" -ForegroundColor Yellow
try { $pyVer = python --version 2>&1; Write-Host "Python: $pyVer" } catch { Write-Host "Python: NOT FOUND" -ForegroundColor Red }
try { $pipVer = pip --version 2>&1; Write-Host "Pip: $pipVer" } catch { Write-Host "Pip: NOT FOUND" -ForegroundColor Red }
Write-Host ""

# 3. Node.js / npm
Write-Host "--- NODE.JS ---" -ForegroundColor Yellow
try { $nodeVer = node --version 2>&1; Write-Host "Node: $nodeVer" } catch { Write-Host "Node: NOT FOUND" -ForegroundColor Red }
try { $npmVer = npm --version 2>&1; Write-Host "npm: $npmVer" } catch { Write-Host "npm: NOT FOUND" -ForegroundColor Red }
try { $npxVer = npx --version 2>&1; Write-Host "npx: $npxVer" } catch { Write-Host "npx: NOT FOUND" -ForegroundColor Red }
Write-Host ""

# 4. Git
Write-Host "--- GIT ---" -ForegroundColor Yellow
try { $gitVer = git --version 2>&1; Write-Host "Git: $gitVer" } catch { Write-Host "Git: NOT FOUND" -ForegroundColor Red }
Write-Host ""

# 5. PostgreSQL
Write-Host "--- POSTGRESQL ---" -ForegroundColor Yellow
try { $pgVer = psql --version 2>&1; Write-Host "psql: $pgVer" } catch { Write-Host "psql: NOT FOUND (may still be running as service)" -ForegroundColor DarkYellow }
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) { Write-Host "PG Service: $($pgService.Status) ($($pgService.Name))" } else { Write-Host "PG Service: NOT FOUND" -ForegroundColor Red }
Write-Host ""

# 6. Docker (optional)
Write-Host "--- DOCKER ---" -ForegroundColor Yellow
try { $dkVer = docker --version 2>&1; Write-Host "Docker: $dkVer" } catch { Write-Host "Docker: NOT INSTALLED" -ForegroundColor DarkYellow }
Write-Host ""

# 7. Find IntroFlow project
Write-Host "--- INTROFLOW PROJECT ---" -ForegroundColor Yellow
$searchPaths = @(
    "$env:USERPROFILE\introflow",
    "$env:USERPROFILE\IntroFlow",
    "$env:USERPROFILE\trueferral",
    "$env:USERPROFILE\Trueferral",
    "$env:USERPROFILE\Documents\introflow",
    "$env:USERPROFILE\Documents\IntroFlow",
    "$env:USERPROFILE\Desktop\introflow",
    "$env:USERPROFILE\Desktop\IntroFlow",
    "$env:USERPROFILE\projects\introflow",
    "$env:USERPROFILE\repos\introflow",
    "C:\introflow",
    "C:\IntroFlow"
)

$projectDir = $null
foreach ($p in $searchPaths) {
    if (Test-Path $p) {
        $projectDir = $p
        Write-Host "Project found: $p" -ForegroundColor Green
        break
    }
}

# Also search for any folder with doctor.py
if (-not $projectDir) {
    Write-Host "Searching for doctor.py..." -ForegroundColor DarkYellow
    $found = Get-ChildItem -Path "$env:USERPROFILE" -Recurse -Filter "doctor.py" -ErrorAction SilentlyContinue -Depth 4 | Select-Object -First 1
    if ($found) {
        $projectDir = Split-Path (Split-Path $found.FullName)
        Write-Host "Project found via doctor.py: $projectDir" -ForegroundColor Green
    } else {
        Write-Host "Project: NOT FOUND in common locations" -ForegroundColor Red
        Write-Host "  Please tell Claude your project folder path" -ForegroundColor DarkYellow
    }
}

# 8. If project found, inspect it
if ($projectDir) {
    Write-Host ""
    Write-Host "--- PROJECT STRUCTURE ---" -ForegroundColor Yellow
    
    # Top-level files
    Write-Host "Root files:"
    Get-ChildItem -Path $projectDir -File -Depth 0 | ForEach-Object { Write-Host "  $($_.Name)" }
    
    Write-Host ""
    Write-Host "Root folders:"
    Get-ChildItem -Path $projectDir -Directory -Depth 0 | ForEach-Object { Write-Host "  $($_.Name)/" }
    
    # Check for key files
    Write-Host ""
    Write-Host "--- KEY FILES CHECK ---" -ForegroundColor Yellow
    $keyFiles = @(
        "scripts/doctor.py",
        "pyproject.toml",
        "pytest.ini",
        "requirements.txt",
        ".env",
        ".env.example",
        "src/main.py",
        "src/app.py",
        "src/__init__.py",
        "package.json",
        "frontend/package.json",
        "web/package.json",
        "ui/package.json"
    )
    foreach ($f in $keyFiles) {
        $fullPath = Join-Path $projectDir $f
        if (Test-Path $fullPath) {
            Write-Host "  [YES] $f" -ForegroundColor Green
        } else {
            Write-Host "  [NO]  $f" -ForegroundColor DarkGray
        }
    }
    
    # Check .venv
    Write-Host ""
    Write-Host "--- VIRTUAL ENV ---" -ForegroundColor Yellow
    $venvPath = Join-Path $projectDir ".venv"
    if (Test-Path $venvPath) {
        Write-Host ".venv: EXISTS" -ForegroundColor Green
        $venvPython = Join-Path $venvPath "Scripts\python.exe"
        if (Test-Path $venvPython) {
            $venvPyVer = & $venvPython --version 2>&1
            Write-Host ".venv Python: $venvPyVer"
        }
    } else {
        Write-Host ".venv: NOT FOUND" -ForegroundColor Red
    }
    
    # Check if FastAPI is in deps
    Write-Host ""
    Write-Host "--- INSTALLED PACKAGES (key ones) ---" -ForegroundColor Yellow
    $venvPip = Join-Path $venvPath "Scripts\pip.exe"
    if (Test-Path $venvPip) {
        $packages = & $venvPip list 2>&1
        $keyPkgs = @("fastapi", "uvicorn", "sqlalchemy", "alembic", "psycopg", "structlog", "pydantic", "pytest", "httpx")
        foreach ($pkg in $keyPkgs) {
            $match = $packages | Select-String -Pattern $pkg -SimpleMatch
            if ($match) { Write-Host "  [YES] $match" -ForegroundColor Green }
            else { Write-Host "  [NO]  $pkg" -ForegroundColor DarkGray }
        }
    } else {
        Write-Host "  Cannot check (no .venv/Scripts/pip.exe)" -ForegroundColor DarkYellow
    }
    
    # Run doctor.py if it exists
    Write-Host ""
    Write-Host "--- DOCTOR.PY ---" -ForegroundColor Yellow
    $doctorPath = Join-Path $projectDir "scripts\doctor.py"
    if (Test-Path $doctorPath) {
        Write-Host "Running doctor.py..." -ForegroundColor Cyan
        Push-Location $projectDir
        if (Test-Path $venvPython) {
            & $venvPython $doctorPath 2>&1 | ForEach-Object { Write-Host "  $_" }
        } else {
            python $doctorPath 2>&1 | ForEach-Object { Write-Host "  $_" }
        }
        Pop-Location
    } else {
        Write-Host "doctor.py: NOT FOUND" -ForegroundColor Red
    }
    
    # Check git status
    Write-Host ""
    Write-Host "--- GIT STATUS ---" -ForegroundColor Yellow
    Push-Location $projectDir
    try {
        $gitBranch = git branch --show-current 2>&1
        Write-Host "Branch: $gitBranch"
        $gitTags = git tag --list 2>&1
        Write-Host "Tags: $gitTags"
        $gitStatus = git status --short 2>&1
        if ($gitStatus) { Write-Host "Uncommitted changes: YES" -ForegroundColor DarkYellow }
        else { Write-Host "Uncommitted changes: NONE (clean)" -ForegroundColor Green }
    } catch {
        Write-Host "Git: error reading status" -ForegroundColor Red
    }
    Pop-Location
    
    # Check src folder structure
    Write-Host ""
    Write-Host "--- SRC STRUCTURE (2 levels) ---" -ForegroundColor Yellow
    $srcPath = Join-Path $projectDir "src"
    if (Test-Path $srcPath) {
        Get-ChildItem -Path $srcPath -Depth 2 -Name | ForEach-Object { Write-Host "  src/$_" }
    } else {
        Write-Host "  src/ folder NOT FOUND" -ForegroundColor Red
    }
}

# 9. Port check
Write-Host ""
Write-Host "--- PORTS IN USE ---" -ForegroundColor Yellow
$ports = @(3000, 5173, 8000, 8080, 5432)
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        Write-Host "  Port $port : IN USE (PID $($conn.OwningProcess))" -ForegroundColor Green
    } else {
        Write-Host "  Port $port : FREE" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " DIAGNOSTIC COMPLETE" -ForegroundColor Cyan
Write-Host " Copy everything above and paste to Claude" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
