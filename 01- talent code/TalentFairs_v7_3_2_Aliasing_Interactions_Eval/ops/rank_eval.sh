#!/usr/bin/env bash
set -euo pipefail
: "${1:?Usage: rank_eval.sh <domain>}"
K="${2:-10}"
DOMAIN="$1"
mkdir -p metrics

node ops/rank_eval.js "$DOMAIN" "$K" > metrics/latest.json
echo "$(date -Is)\t$DOMAIN\t$(cat metrics/latest.json)" >> metrics/history.jsonl
echo "Saved metrics/latest.json and appended history.jsonl"
