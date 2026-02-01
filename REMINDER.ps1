$ErrorActionPreference = "Stop"
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "HANDOFF REMINDER CHECK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$latest = Get-ChildItem handoffs -Filter "*.md" -ErrorAction SilentlyContinue | Sort LastWriteTime -Desc | Select -First 1
if (!$latest) {
    Write-Host "`nNO HANDOFFS FOUND!" -ForegroundColor Red
    Write-Host "Run: .\SESSION_HANDOFF.ps1" -ForegroundColor Yellow
    exit
}
$elapsed = (Get-Date) - $latest.LastWriteTime
$minutes = [math]::Round($elapsed.TotalMinutes)
Write-Host "`nLast: $($latest.Name)" -ForegroundColor Cyan
Write-Host "Time: $minutes minutes ago" -ForegroundColor White
Write-Host "`nStatus:" -ForegroundColor Cyan
if ($minutes -lt 60) {
    Write-Host "  SAFE ($minutes min)" -ForegroundColor Green
} elseif ($minutes -lt 90) {
    Write-Host "  ATTENTION - Consider handoff" -ForegroundColor Yellow
} elseif ($minutes -lt 120) {
    Write-Host "  WARNING - Create handoff NOW" -ForegroundColor Yellow
} else {
    Write-Host "  URGENT - IMMEDIATE handoff!" -ForegroundColor Red
}
Write-Host "`nCommands:" -ForegroundColor Cyan
Write-Host "  Handoff: .\SESSION_HANDOFF.ps1" -ForegroundColor White
Write-Host "  Resume:  .\SESSION_RESUME.ps1" -ForegroundColor White