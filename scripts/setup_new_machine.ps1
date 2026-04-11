param(
  [switch]$SkipTests
)

$ErrorActionPreference = "Stop"

function Fail($msg) {
  Write-Host "FAIL: $msg" -ForegroundColor Red
  exit 1
}

# Must run from repo root
if (!(Test-Path ".git")) { Fail "Run this from repo root ('.git' not found)." }

# Print environment
Write-Host "== IntroFlow New Machine Setup ==" -ForegroundColor Cyan
Write-Host ("Repo: {0}" -f (Get-Location))
Write-Host ("PSVersion: {0}" -f $PSVersionTable.PSVersion)

# Python must exist
$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) { Fail "Python not found in PATH. Install Python 3.11+ and reopen PowerShell." }

# Create venv if missing
if (!(Test-Path ".venv")) {
  Write-Host "Creating venv (.venv)..." -ForegroundColor Yellow
  python -m venv .venv
}

# Activate venv
Write-Host "Activating venv..." -ForegroundColor Yellow
. .\.venv\Scripts\Activate.ps1

# Upgrade pip (safe, common drift reducer)
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip | Out-Null

# Install deps
if (Test-Path "requirements.txt") {
  Write-Host "Installing dependencies (requirements.txt)..." -ForegroundColor Yellow
  pip install -r requirements.txt
} else {
  Fail "requirements.txt not found. If you use pyproject/uv later, update this script in a future step."
}

# Guard: do not allow secrets / env files
$bad = @(".env", ".env.local", ".env.prod", ".env.test")
foreach ($f in $bad) {
  if (Test-Path $f) { Fail "Secret risk: found $f in repo root. Do not keep env files in repo." }
}

# Run deterministic gates
Write-Host "Running doctor.py..." -ForegroundColor Yellow
python .\scripts\doctor.py
if ($LASTEXITCODE -ne 0) { Fail "doctor.py failed (exit $LASTEXITCODE)" }

if (-not $SkipTests) {
  Write-Host "Running pytest..." -ForegroundColor Yellow
  pytest -q
  if ($LASTEXITCODE -ne 0) { Fail "pytest failed (exit $LASTEXITCODE)" }
} else {
  Write-Host "Skipping tests (SkipTests=true)..." -ForegroundColor Yellow
}

# Hygiene check (informational, not blocking here)
Write-Host "Checking git status..." -ForegroundColor Yellow
git status --porcelain=v1

Write-Host "PASS: New machine setup complete." -ForegroundColor Green
exit 0