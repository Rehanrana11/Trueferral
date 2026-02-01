# =======================
# CLAUDE_AUDIT_PACK.ps1
# One-shot “audit pack” generator for Claude (diff + gates + CI context)
# Safe: never reads .env, never prints secret env values, redacts common patterns.
# =======================

$ErrorActionPreference = "Stop"

function Write-Utf8NoBomFile {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Content
  )
  $dir = Split-Path -Parent $Path
  if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Redact($s) {
  if ($null -eq $s) { return $s }
  $s = $s -replace '(?im)(api[_-]?key\s*[:=]\s*)(.+)$', '$1[REDACTED]'
  $s = $s -replace '(?im)(secret\s*[:=]\s*)(.+)$', '$1[REDACTED]'
  $s = $s -replace '(?im)(token\s*[:=]\s*)(.+)$', '$1[REDACTED]'
  $s = $s -replace '(?im)(password\s*[:=]\s*)(.+)$', '$1[REDACTED]'
  $s = $s -replace '(?im)(bearer\s+)[A-Za-z0-9\-\._~\+\/]+=*', '$1[REDACTED]'
  $s = $s -replace '(?i)ghp_[A-Za-z0-9]{20,}', 'ghp_[REDACTED]'
  $s = $s -replace '(?i)github_pat_[A-Za-z0-9_]{20,}', 'github_pat_[REDACTED]'
  return $s
}

function Run-Cmd {
  param([string]$Title, [string]$Cmd, [switch]$AllowFail)

  $sb = New-Object System.Text.StringBuilder
  $null = $sb.AppendLine("## $Title")
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("```")
  $null = $sb.AppendLine("> $Cmd")
  $null = $sb.AppendLine("```")
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("```text")

  $out = & powershell -NoProfile -ExecutionPolicy Bypass -Command $Cmd 2>&1
  $code = $LASTEXITCODE
  $txt = Redact (($out | Out-String).TrimEnd())
  $null = $sb.AppendLine($txt)
  $null = $sb.AppendLine("")
  $null = $sb.AppendLine("ExitCode: $code")
  $null = $sb.AppendLine("```")
  $null = $sb.AppendLine("")

  if (-not $AllowFail -and $code -ne 0) { throw "FAIL: $Title (exit $code)" }
  return $sb.ToString()
}

if (!(Test-Path ".git")) { throw "FAIL: .git not found. Run from repo root." }

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$repoPath  = (Get-Location).Path
$branch    = (git rev-parse --abbrev-ref HEAD).Trim()
$headSha   = (git rev-parse HEAD).Trim()

git fetch origin --prune | Out-Null
$remoteDefault = "UNKNOWN"
foreach ($b in @("main","master")) {
  git rev-parse "origin/$b" 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { $remoteDefault = $b; break }
}
$remoteSha = if ($remoteDefault -ne "UNKNOWN") { (git rev-parse "origin/$remoteDefault").Trim() } else { "UNKNOWN" }

$md = New-Object System.Text.StringBuilder
$null = $md.AppendLine("# Claude Audit Pack — $timestamp")
$null = $md.AppendLine("")
$null = $md.AppendLine("**RepoPath:** $repoPath")
$null = $md.AppendLine("**Branch:** $branch")
$null = $md.AppendLine("**HEAD:** $headSha")
$null = $md.AppendLine("**RemoteDefault:** $remoteDefault")
$null = $md.AppendLine("**RemoteSHA:** $remoteSha")
$null = $md.AppendLine("")
$null = $md.AppendLine("## Claude instruction")
$null = $md.AppendLine("Approve/Reject in ONE response. If reject: list exact blockers + exact fixes. No new scope.")
$null = $md.AppendLine("")

$null = $md.AppendLine((Run-Cmd "Git Status (porcelain)" 'git status --porcelain=v1' -AllowFail))
$null = $md.AppendLine((Run-Cmd "Recent Commits (last 10)" 'git --no-pager log -n 10 --date=iso --pretty=format:"%h | %ad | %an | %s"' -AllowFail))
$null = $md.AppendLine((Run-Cmd "Git Diff (working tree vs HEAD)" 'git --no-pager diff' -AllowFail))
$null = $md.AppendLine((Run-Cmd "Git Diff (staged vs HEAD)" 'git --no-pager diff --cached' -AllowFail))

if (Test-Path ".\scripts\encoding_check.ps1") {
  $null = $md.AppendLine((Run-Cmd "Encoding Gate" 'powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\encoding_check.ps1' -AllowFail))
} else {
  $null = $md.AppendLine("## Encoding Gate`n`n(MISSING: .\scripts\encoding_check.ps1)`n")
}

if (Test-Path ".\scripts\doctor.py") {
  $null = $md.AppendLine((Run-Cmd "Doctor Gate" 'python .\scripts\doctor.py' -AllowFail))
} else {
  $null = $md.AppendLine("## Doctor Gate`n`n(MISSING: .\scripts\doctor.py)`n")
}

$null = $md.AppendLine((Run-Cmd "Pytest" 'pytest -v' -AllowFail))

$wfDir = ".github/workflows"
if (Test-Path $wfDir) {
  $wfFiles = Get-ChildItem $wfDir -Filter "*.yml" -ErrorAction SilentlyContinue
  foreach ($f in $wfFiles) {
    $raw = Get-Content $f.FullName -Raw
    if ($raw -match "doctor\.py|pytest|pip install|python -m venv|actions/checkout|setup-python") {
      $safe = Redact $raw
      $null = $md.AppendLine("## Workflow: $($f.Name)")
      $null = $md.AppendLine("")
      $null = $md.AppendLine("```yaml")
      $null = $md.AppendLine($safe.TrimEnd())
      $null = $md.AppendLine("```")
      $null = $md.AppendLine("")
    }
  }
}

$handoffDir = "handoffs"
if (!(Test-Path $handoffDir)) { New-Item -ItemType Directory -Force $handoffDir | Out-Null }
$outPath = Join-Path $handoffDir "auditpack_$timestamp.md"
Write-Utf8NoBomFile -Path $outPath -Content $md.ToString()

Write-Host "Created audit pack:" -ForegroundColor Green
Write-Host "  $outPath" -ForegroundColor Yellow

if (Get-Command Set-Clipboard -ErrorAction SilentlyContinue) {
  $md.ToString() | Set-Clipboard
  Write-Host "Copied audit pack to clipboard." -ForegroundColor Green
} else {
  Write-Host "Clipboard not available. Upload/paste file content to Claude." -ForegroundColor Yellow
}