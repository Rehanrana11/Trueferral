$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$dir = "handoffs"
if (!(Test-Path $dir)) { mkdir $dir }

$file = "$dir/handoff_$timestamp.md"

@"
# Handoff $timestamp

Branch: $(git branch --show-current)
Commit: $(git rev-parse --short HEAD)

## Phase 4: 75% (6/8 complete)
- [x] Steps 33-38 DONE
- [ ] Step 39: Secrets Management NEXT
- [ ] Step 40: Rails Ready Tag

## Last Work
Step 38: CI Pipeline - All passing on GitHub

## Status
- Tests: 16 passing
- CI: Active
- Quality: HIGH

## Next
1. Upload this file to new Claude session
2. Say: "Resume from handoff"
3. Continue with Step 39

Git Status:
$(git status --short)

Recent Commits:
$(git log --oneline -5)
"@ | Out-File $file -Encoding UTF8

Write-Host "Created: $file" -ForegroundColor Green
Write-Host "Upload this to Claude when starting new session!" -ForegroundColor Cyan