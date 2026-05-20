#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 1 ]; then
  echo "Usage: $0 <DISTRIBUTION_ID>" >&2
  exit 1
fi
DIST_ID="$1"
aws cloudfront get-distribution --id "$DIST_ID" > dist-${DIST_ID}-live.json
echo "Saved live distribution → dist-${DIST_ID}-live.json"
jq '.Distribution.DistributionConfig.Origins.Items' dist-${DIST_ID}-live.json
