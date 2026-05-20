#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 1 ]; then echo "Usage: $0 /path/to/unified-monorepo" >&2; exit 1; fi
TARGET="$1"
rsync -a apps/web/ "$TARGET/apps/web/"
rsync -a services/api/src/ "$TARGET/services/api/src/"
rsync -a apps/mobile/ "$TARGET/apps/mobile/"
mkdir -p "$TARGET/infra/terraform" "$TARGET/infra/grafana/dashboards" "$TARGET/docs"
rsync -a infra/terraform/ "$TARGET/infra/terraform/"
rsync -a infra/grafana/ "$TARGET/infra/grafana/"
rsync -a docs/ "$TARGET/docs/"
echo "✅ Applied v5.0 Gap Pack to: $TARGET"
