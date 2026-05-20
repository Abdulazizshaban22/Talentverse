
#!/usr/bin/env bash
set -euo pipefail
: "${1:?Usage: rank_eval_dual.sh <domain> [k]}"
DOMAIN="$1"; K="${2:-10}"
# توقع: data/ltr/judgments/$DOMAIN.tsv موجود
node ops/rank_eval_dual.js "$DOMAIN" "$K"
