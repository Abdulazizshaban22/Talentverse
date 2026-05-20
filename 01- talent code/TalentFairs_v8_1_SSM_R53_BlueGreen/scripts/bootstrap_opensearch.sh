
#!/usr/bin/env bash
set -euo pipefail
pushd "$(dirname "$0")/../services/api" >/dev/null
npm i --omit=dev
npm run bootstrap:os
popd >/dev/null
