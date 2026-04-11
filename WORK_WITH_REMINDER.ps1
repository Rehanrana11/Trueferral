# WORK_WITH_REMINDER.ps1
# Use this instead of working directly - it reminds you automatically!

param(
    [string]$Message = "Starting work session"
)

Write-Host "`n🚀 $Message" -ForegroundColor Cyan
Write-Host "Running handoff reminder check..." -ForegroundColor Yellow

# Check handoff status
.\REMINDER.ps1

Write-Host "`n✓ Reminder check complete" -ForegroundColor Green
Write-Host "You can now continue working safely!" -ForegroundColor Cyan
