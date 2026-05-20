#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 1 ]; then echo "Usage: $0 /path/to/v5.2-monorepo" >&2; exit 1; fi
TARGET="$1"
rsync -a apps/api/src/ "$TARGET/apps/api/src/"
rsync -a prisma/ "$TARGET/prisma/"
rsync -a docker/ "$TARGET/docker/"
rsync -a keycloak/ "$TARGET/keycloak/"
rsync -a postman/ "$TARGET/postman/"
rsync -a .github/workflows/ "$TARGET/.github/workflows/"
rsync -a docs/ "$TARGET/docs/"
echo "✅ Applied v5.3 Booster to: $TARGET"
