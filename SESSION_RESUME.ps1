$latest = Get-ChildItem handoffs -Filter "*.md" | Sort LastWriteTime -Desc | Select -First 1
if ($latest) {
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host "LATEST HANDOFF: $($latest.Name)" -ForegroundColor Cyan
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host ""
  Get-Content $latest.FullName
  Write-Host ""
  Write-Host "========================================" -ForegroundColor Green
  Write-Host "Copy this output to Claude to resume!" -ForegroundColor Green
  Write-Host "========================================" -ForegroundColor Green
} else {
  Write-Host "No handoffs found. Run SESSION_HANDOFF.ps1 first" -ForegroundColor Yellow
}