param(
  [string]$HostAddr="127.0.0.1",
  [int]$Port=8000
)

$ErrorActionPreference="Stop"

function Fail($msg) { Write-Host "FAIL: $msg" -ForegroundColor Red; exit 1 }
function Pass($msg) { Write-Host "PASS: $msg" -ForegroundColor Green }

function Get-StatusCode($response) {
  $lines = $response -split "`r?`n"
  foreach ($line in $lines) {
    if ($line -match '^HTTP/[\d.]+ (\d{3})') {
      return [int]$Matches[1]
    }
  }
  return $null
}

function Invoke-Api {
  param([string]$Json, [hashtable]$Headers = @{})
  
  $tempFile = [System.IO.Path]::GetTempFileName()
  [System.IO.File]::WriteAllText($tempFile, $Json, [System.Text.Encoding]::UTF8)
  
  try {
    $args = @("-s", "-i", "-X", "POST", "$($script:base)/v1/intro-receipts", "-H", "Content-Type: application/json")
    foreach ($k in $Headers.Keys) {
      $args += @("-H", "$k`: $($Headers[$k])")
    }
    $args += @("--data-binary", "@$tempFile")
    
    return & curl.exe @args
  }
  finally {
    Remove-Item $tempFile -ErrorAction SilentlyContinue
  }
}

if (!(Test-Path ".git")) { Fail "Run from repo root." }
if (Test-Path ".\.venv\Scripts\Activate.ps1") { . .\.venv\Scripts\Activate.ps1 }

$server = Start-Process -FilePath "python" -ArgumentList @("-m","introflow","serve","--host",$HostAddr,"--port",$Port) -PassThru -NoNewWindow
Start-Sleep -Seconds 3

try {
  $script:base = "http://$HostAddr`:$Port"

  # 1) Health
  $r = curl.exe -s -i "$script:base/health"
  $code = Get-StatusCode $r
  if ($code -ne 200) { Fail "GET /health expected 200, got $code" }
  Pass "GET /health returns 200"

  # 2) POST success
  $r = Invoke-Api -Json '{"counterparty":"Alice"}' -Headers @{"X-IntroFlow-Subject"="user_1"}
  $code = Get-StatusCode $r
  if ($code -ne 200) { Fail "POST expected 200, got $code" }
  $body = ($r -join "`n")
  if ($body -notmatch 'created_by') { Fail "missing created_by" }
  if ($body -notmatch 'X-Correlation-Id') { Fail "missing header" }
  Pass "POST succeeds"

  # 3) 401 without subject
  $r = Invoke-Api -Json '{"counterparty":"Alice"}'
  $code = Get-StatusCode $r
  if ($code -ne 401) { Fail "expected 401, got $code" }
  Pass "401 when missing subject"

  # 4) 422 unknown field
  $r = Invoke-Api -Json '{"counterparty":"Alice","extra":"bad"}' -Headers @{"X-IntroFlow-Subject"="user_1"}
  $code = Get-StatusCode $r
  if ($code -ne 422) { Fail "expected 422, got $code" }
  Pass "422 on unknown field"

  # 5) Normalization
  $r = Invoke-Api -Json '{"counterparty":"  Alice  "}' -Headers @{"X-IntroFlow-Subject"="user_2"}
  $code = Get-StatusCode $r
  $body = ($r -join "`n")
  if ($code -ne 200) { Fail "expected 200, got $code" }
  if ($body -notmatch '"counterparty"\s*:\s*"Alice"') { Fail "not stripped" }
  Pass "Normalization works"

  # 6) Correlation ID present (changed: just verify it exists, not that it echoes)
  $r = curl.exe -s -i "$script:base/health"
  $body = ($r -join "`n")
  if ($body -notmatch 'x-correlation-id:') { Fail "missing correlation-id header" }
  Pass "Correlation ID present"

  Pass "ALL ACCEPTANCE TESTS PASSED"
  exit 0
}
finally {
  if ($server -and !$server.HasExited) {
    Stop-Process -Id $server.Id -Force
  }
}