Stop = 'Stop'

Write-Host "Bootstrap: create venv + install baseline tools..."
if (!(Test-Path .\.venv)) { python -m venv .\.venv }

. .\.venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
python -m pip install pytest

Write-Host "Bootstrap complete."
Write-Host "Next: python scripts\doctor.py"