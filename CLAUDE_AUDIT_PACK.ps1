# CLAUDE_AUDIT_PACK.ps1
$ErrorActionPreference = "Stop"

function Write-Utf8NoBomFile {
  param([string]$Path, [string]$Content)
  $dir = Split-Path -Parent $Path
  if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8)
}

if (!(Test-Path ".git")) { throw "Not in repo root" }

$ts = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$br = (git rev-parse --abbrev-ref HEAD).Trim()
$hd = (git rev-parse --short HEAD).Trim()

git fetch origin --prune 2>&1 | Out-Null

$md = "# Audit Pack - $ts`n`nBranch: $br`nHEAD: $hd`n`n"
$md += "## Git Status`n``````n"
$md += (git status --porcelain)
$md += "`n``````n`n"

$md += "## Recent Commits`n``````n"
$md += (git log --oneline -5)
$md += "`n``````n`n"

$md += "## Quality Gates`n`n"

if (Test-Path .\scripts\encoding_check.ps1) {
  $md += "Encoding:`n``````n"
  $md += (powershell -NoProfile -File .\scripts\encoding_check.ps1 2>&1)
  $md += "`n``````n`n"
}

if (Test-Path .\scripts\doctor.py) {
  $md += "Doctor:`n``````n"
  $md += (python .\scripts\doctor.py 2>&1)
  $md += "`n``````n`n"
}

$md += "Tests:`n``````n"
$md += (pytest -q 2>&1)
$md += "`n``````n"

$dir = "handoffs"
if (!(Test-Path $dir)) { mkdir $dir | Out-Null }

$file = "$dir/auditpack_$ts.md"
Write-Utf8NoBomFile -Path $file -Content $md

Write-Host "Created: $file" -ForegroundColor Green

if (Get-Command Set-Clipboard -ErrorAction SilentlyContinue) {
  $md | Set-Clipboard
  Write-Host "Copied to clipboard!" -ForegroundColor Green
}