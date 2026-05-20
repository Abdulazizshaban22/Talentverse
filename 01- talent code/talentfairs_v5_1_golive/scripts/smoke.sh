#!/usr/bin/env bash
set -euo pipefail
API="${1:-https://api.talentfairs.sa}"

echo "[1/5] Health"
curl -sS ${API}/health || true

echo "[2/5] What-If"
curl -sS -X POST ${API}/ai/whatif -H 'Content-Type: application/json' -d '{"ltr_weight":0.6,"graph_weight":0.4,"sample":[{"id":"c1","ltr":0.7,"graph":0.3},{"id":"c2","ltr":0.6,"graph":0.55}]}'

echo "[3/5] Redaction"
curl -sS -X POST ${API}/privacy/redact -H 'Content-Type: application/json' -d '{"text":"user@example.com +9665xxxxxxx 1xxxxxxxxx"}'

echo "[4/5] Scholarships Match"
curl -sS "${API}/scholarships/match?profileId=demo&skills=python,ml,math"

echo "[5/5] Trust Reports"
curl -sS ${API}/trust/reports
