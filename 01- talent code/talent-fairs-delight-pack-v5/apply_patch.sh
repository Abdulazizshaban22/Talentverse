#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 1 ]; then echo "Usage: $0 /path/to/unified-monorepo" >&2; exit 1; fi
TARGET="$1"
rsync -a apps/web/ "$TARGET/apps/web/"
rsync -a services/api/src/ "$TARGET/services/api/src/"
mkdir -p "$TARGET/infra/grafana/dashboards" "$TARGET/infra/waf"
rsync -a infra/grafana/ "$TARGET/infra/grafana/"
rsync -a infra/waf/ "$TARGET/infra/waf/"
echo "✅ Delight Pack v5 applied to: $TARGET"
