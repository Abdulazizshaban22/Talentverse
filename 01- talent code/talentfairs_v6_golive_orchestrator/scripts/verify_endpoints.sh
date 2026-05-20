#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-https://api.talentfairs.sa}"
echo "[/health]"; curl -fsS "$BASE/health" || true; echo
echo "[/ai/whatif]"; curl -fsS -X POST "$BASE/ai/whatif" -H 'Content-Type: application/json' -d '{"ltr_weight":0.6,"graph_weight":0.4,"sample":[{"id":"c1","ltr":0.7,"graph":0.3},{"id":"c2","ltr":0.6,"graph":0.55}]}' || true; echo
echo "[/privacy/redact]"; curl -fsS -X POST "$BASE/privacy/redact" -H 'Content-Type: application/json' -d '{"text":"user@example.com 1xxxxxxxxx +9665xxxxxxx"}' || true; echo
echo "[/loyalty/balance]"; curl -fsS "$BASE/loyalty/balance?userId=demo" || true; echo
echo "[/edutwin/metrics/engagement]"; curl -fsS "$BASE/edutwin/metrics/engagement?learnerId=demo" || true; echo
