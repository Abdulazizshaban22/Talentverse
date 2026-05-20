#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 2 ]; then echo "Usage: $0 <DISTRIBUTION_ID> <VPC_ORIGIN_ARN>"; exit 1; fi
DIST="$1"; ORN="$2"
curl -fsSL -o /tmp/cf_import.sh https://raw.githubusercontent.com/placeholder/talentfairs/main/infra/terraform/scripts/import.sh || true
# Fallback to local copy if repo not accessible — expect user to place the v5.4 add-ons script in ./addons
if [ -f "./addons/infra/terraform/scripts/import.sh" ]; then
  bash ./addons/infra/terraform/scripts/import.sh "$DIST" "$ORN"
else
  echo "Please run the import script from v5.4 Add-ons (import.sh) with: $DIST $ORN"
fi
