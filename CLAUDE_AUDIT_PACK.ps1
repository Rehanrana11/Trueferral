# =======================
# CLAUDE_AUDIT_PACK.ps1
# One-shot audit pack generator
# SAFE: Redacts secrets, UTF-8 no BOM
# =======================

$ErrorActionPreference = "Stop"

function Write-Utf8NoBomFile {
  param([string]$Path, [string]$Content)
  $dir = Split-Path -Parent $Path
  if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Redact {
  param([string]$s)
  if ($null -eq $s) { return $s }
  $s = $s -replace '(?im)(api[_-]?key\s*[:=]\s*)(.+)$', '$1[REDACTED]'
  $s = $s -replace '(?im)(secret\s*[:=]\s*)(.+)$', '$1[REDACTED]'
  $s = $s -replace '(?im)(token\s*[:=]\s*)(.+)$', '$1[REDACTED]'
  $s = $s -replace '(?im)(password\s*[:=]\s*)(.+)$', '$1[REDACTED]'
  $s = $s -replace '(?i)ghp_[A-Za-z0-9]{20,}', 'ghp_[REDACTED]'
  $s = $s -replace '(?i)github_pat_[A-Za-z0-9_]{20,}', 'github_pat_[REDACTED]'
  return $s
}

function Run-Section {
  param(
    [Parameter(Mandatory=$true)][string]$Title,
    [Parameter(Mandatory=$true)][string]$CmdText,
    [Parameter(Mandatory=$true)][scriptblock]$Script,
    [switch]$AllowFail
  )

  $exit = 0
  $outText = ""

  try {
    $out = & $Script 2>&1
    if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) { $exit = [int]$LASTEXITCODE }
    elseif (-not $?) { $exit = 1 }
    else { $exit = 0 }
    $outText = ($out | Out-String).TrimEnd()
  } catch {
    $exit = 1
    $outText = ($_ | Out-String).TrimEnd()
  }

  $outText = Redact $outText
  if ([string]::IsNullOrWhiteSpace($outText)) { $outText = "(no output)" }

  $section = @"
## $Title

Command: $CmdText

Output:
$outText

ExitCode: $exit

---
"@

  if (-not $AllowFail -and $exit -ne 0) { 
    throw "FAIL: $Title (exit $exit)" 
  }
  
  return $section
}

# Main execution
if (!(Test-Path ".git")) { throw "Not in repo root" }

$ts = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$branch = (git rev-parse --abbrev-ref HEAD).Trim()
$head = (git rev-parse --short HEAD).Trim()

git fetch origin --prune 2>&1 | Out-Null

$md = @"
# Claude Audit Pack - $ts

**Branch:** $branch
**HEAD:** $head
**Project:** IntroFlow (Trueferral) - Phase 4 Complete

## INSTRUCTIONS TO CLAUDE
Analyze this audit pack. Confirm Phase 4 complete and ready for Phase 5.

---

"@

$md += Run-Section "Git Status" "git status --porcelain" { git status --porcelain } -AllowFail
$md += Run-Section "Recent Commits" "git log --oneline -5" { git log --oneline -5 } -AllowFail
$md += Run-Section "Encoding Gate" "encoding_check.ps1" { powershell -NoProfile -File .\scripts\encoding_check.ps1 } -AllowFail
$md += Run-Section "Doctor Gate" "doctor.py" { python .\scripts\doctor.py } -AllowFail
$md += Run-Section "Test Suite" "pytest -q" { pytest -q } -AllowFail

$handoffDir = "handoffs"
if (!(Test-Path $handoffDir)) { mkdir $handoffDir | Out-Null }

$outFile = "$handoffDir/auditpack_$ts.md"
Write-Utf8NoBomFile -Path $outFile -Content $md

Write-Host "Created: $outFile" -ForegroundColor Green

if (Get-Command Set-Clipboard -ErrorAction SilentlyContinue) {
  $md | Set-Clipboard
  Write-Host "Copied to clipboard!" -ForegroundColor Green
}