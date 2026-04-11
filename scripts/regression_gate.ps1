$ErrorActionPreference="Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REGRESSION GATE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (!(Test-Path ".git")) {
  Write-Host "FAIL: Must run from repo root" -ForegroundColor Red
  exit 1
}

Write-Host "`n1) Running doctor.py..." -ForegroundColor Yellow
python .\scripts\doctor.py
if ($LASTEXITCODE -ne 0) {
  Write-Host "FAIL: doctor.py failed (exit $LASTEXITCODE)" -ForegroundColor Red
  exit 1
}
Write-Host "PASS: doctor.py" -ForegroundColor Green

Write-Host "`n2) Running pytest..." -ForegroundColor Yellow
pytest -q
if ($LASTEXITCODE -ne 0) {
  Write-Host "FAIL: pytest failed (exit $LASTEXITCODE)" -ForegroundColor Red
  exit 1
}
Write-Host "PASS: pytest" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✓✓✓ REGRESSION GATE PASSED ✓✓✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
exit 0