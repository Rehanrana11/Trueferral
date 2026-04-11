# STEP 39: Secrets Management Rail

## Purpose
Prevent accidental secret commits and enforce keys-only env contract.

## Rules
- Never commit: .env, .env.* (except .env.example), keys/certs, SSH keys
- .env.example contains required keys only with empty values

## Verification
python scripts/doctor.py must print:
- PASS: Step 39 secrets rail OK
- PASS: doctor checks OK