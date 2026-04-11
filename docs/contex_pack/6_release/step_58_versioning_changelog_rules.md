# STEP 58: Versioning & Changelog Rules (SemVer)

**Project:** IntroFlow / Trueferral  
**Step:** 58 of 72  
**Timestamp:** 2026-02-03 15:03:57

## Versioning: SemVer (MAJOR.MINOR.PATCH)

- MAJOR: Breaking changes to public API
- MINOR: Backward-compatible new features
- PATCH: Backward-compatible fixes

## Public Surface (Breaking Changes)
- API contracts (endpoints, request/response)
- Domain/service invariants
- CLI interface
- Config contract (env vars)

## Changelog Format
- Keep a Changelog format
- Unreleased section at top
- Categories: Added, Changed, Fixed, Security, Deprecated, Removed

## Release Tags
- Release Candidate: RC_1.0_0
- Final: v1.0.0

## Release Notes Requirements
- Version + date
- Short summary
- Categorized changes
- Reference to quality gates