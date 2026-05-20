
#!/usr/bin/env bash
set -euo pipefail
pushd "$(dirname "$0")/../services/api" >/dev/null
npm i --omit=dev
npm run bootstrap:os
# Example: set alias for posts
node src/model_alias_set.js posts@prod tf_ltr_posts_xgb_v1
popd >/dev/null
