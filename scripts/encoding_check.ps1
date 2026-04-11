$ErrorActionPreference = 'Stop'

# Checks: .py/.ini/.toml/.md/.ps1 are UTF-8 WITHOUT BOM
$exts = @('.py','.pyi','.ini','.toml','.md','.ps1')
$bad = New-Object System.Collections.Generic.List[string]

Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
  ($exts -contains $_.Extension.ToLower()) -and
  ($_.FullName -notmatch '\\\.venv\\|\\\.git\\|\\node_modules\\|\\dist\\|\\build\\')
} | ForEach-Object {
  $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    [void]$bad.Add($_.FullName)
  }
}

if ($bad.Count -gt 0) {
  Write-Host "FAIL: UTF-8 BOM detected in:" -ForegroundColor Red
  $bad | ForEach-Object { Write-Host (" - " + $_) }
  exit 1
}

Write-Host "PASS: No UTF-8 BOM detected in tracked text files."
exit 0