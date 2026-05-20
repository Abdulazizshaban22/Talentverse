#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 2 ]; then
  echo "Usage: $0 <DISTRIBUTION_ID> <WEB_ACL_ARN>"
  exit 1
fi
DIST_ID="$1"
WEB_ACL="$2"

# Fetch current ETag and config
CFG=$(aws cloudfront get-distribution-config --id "$DIST_ID")
ETAG=$(echo "$CFG" | jq -r '.ETag')
TMP=$(mktemp)
echo "$CFG" | jq '.DistributionConfig + {WebACLId: "'$WEB_ACL'"}' > "$TMP"

aws cloudfront update-distribution --id "$DIST_ID" --if-match "$ETAG" --distribution-config "file://$TMP" >/dev/null
echo "✅ Attached WAF to distribution: $DIST_ID"
