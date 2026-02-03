param(
  [string]$HostAddr="127.0.0.1",
  [int]$Port=8000
)

$ErrorActionPreference="Stop"

function Fail($msg) { Write-Host "FAIL: $msg" -ForegroundColor Red; exit 1 }
function Pass($msg) { Write-Host "PASS: $msg" -ForegroundColor Green }

if (!(Test-Path ".git")) { Fail "Run from repo root." }

if (Test-Path ".\.venv\Scripts\Activate.ps1") { . .\.venv\Scripts\Activate.ps1 }

Write-Host "Starting server on $HostAddr`:$Port..." -ForegroundColor Yellow
$server = Start-Process -FilePath "python" -ArgumentList @("-m","introflow","serve","--host",$HostAddr,"--port",$Port) -PassThru -NoNewWindow -RedirectStandardError "server_error.log"

Write-Host "Waiting for server to start (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if server is still running
if ($server.HasExited) {
  $errLog = Get-Content "server_error.log" -Raw -ErrorAction SilentlyContinue
  Fail "Server crashed immediately. Error log: $errLog"
}

try {
  $base = "http://$HostAddr`:$Port"

  Write-Host "Testing health endpoint..." -ForegroundColor Yellow
  $r = curl.exe -s -i "$base/health" 2>&1
  Write-Host "Response: $r" -ForegroundColor Gray
  
  if ($r -notmatch "HTTP/1\.1 200") { Fail "GET /health not 200" }
  Pass "GET /health returns 200"

  $body = '{"counterparty":"Alice","note":"hi"}'
  $r = curl.exe -s -i -X POST "$base/v1/intro-receipts" -H "Content-Type: application/json" -H "X-IntroFlow-Subject: user_1" -d $body
  if ($r -notmatch "HTTP/1\.1 200") { Fail "POST expected 200" }
  if ($r -notmatch '"created_by"\s*:\s*"user_1"') { Fail "created_by mismatch" }
  if ($r -notmatch '"counterparty"\s*:\s*"Alice"') { Fail "counterparty mismatch" }
  if ($r -notmatch "X-Correlation-Id:") { Fail "missing X-Correlation-Id" }
  if ($r -notmatch "X-Request-Duration-Ms:") { Fail "missing X-Request-Duration-Ms" }
  Pass "POST succeeds + headers present"

  $r = curl.exe -s -i -X POST "$base/v1/intro-receipts" -H "Content-Type: application/json" -d $body
  if ($r -notmatch "HTTP/1\.1 401") { Fail "expected 401" }
  Pass "401 when missing subject"

  $bad = '{"counterparty":"Alice","note":"hi","extra":"nope"}'
  $r = curl.exe -s -i -X POST "$base/v1/intro-receipts" -H "Content-Type: application/json" -H "X-IntroFlow-Subject: user_1" -d $bad
  if ($r -notmatch "HTTP/1\.1 422") { Fail "expected 422" }
  Pass "422 on unknown field"

  $norm = '{"counterparty":"  Alice  ","note":"   "}'
  $r = curl.exe -s -i -X POST "$base/v1/intro-receipts" -H "Content-Type: application/json" -H "X-IntroFlow-Subject: user_2" -d $norm
  if ($r -notmatch "HTTP/1\.1 200") { Fail "expected 200" }
  if ($r -notmatch '"counterparty"\s*:\s*"Alice"') { Fail "not stripped" }
  if ($r -notmatch '"note"\s*:\s*null') { Fail "not null" }
  Pass "Normalization works"

  $cid="abcDEF12._:-"
  $r = curl.exe -s -i "$base/health" -H "X-Correlation-Id: $cid"
  if ($r -notmatch "X-Correlation-Id:\s*$cid") { Fail "not echoed" }
  Pass "Correlation echoed"

  Pass "ALL ACCEPTANCE TESTS PASSED"
  exit 0
}
finally {
  if ($server -and !$server.HasExited) {
    Write-Host "Stopping server..." -ForegroundColor Yellow
    Stop-Process -Id $server.Id -Force
  }
  Remove-Item -ErrorAction SilentlyContinue "server_error.log"
}