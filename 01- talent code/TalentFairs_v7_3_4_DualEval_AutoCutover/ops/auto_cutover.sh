
#!/usr/bin/env bash
set -euo pipefail
: "${1:?Usage: auto_cutover.sh <domain> [days] [minGain]}"
DOMAIN="$1"; DAYS="${2:-7}"; MINGAIN="${3:-0.03}"
node ops/auto_cutover.js "$DOMAIN" "$DAYS" "$MINGAIN"
