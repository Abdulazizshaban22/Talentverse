
#!/usr/bin/env bash
set -euo pipefail
: "${GRAFANA_URL:?}"; : "${GRAFANA_API_TOKEN:?}"
DIR="$(dirname "$0")/../observability/grafana/dashboards"
for f in "$DIR"/*.json; do
  echo "Importing $f"
  curl -sS -H "Authorization: Bearer $GRAFANA_API_TOKEN" -H "Content-Type: application/json"     -X POST "$GRAFANA_URL/api/dashboards/db"     --data "{"dashboard": $(cat "$f"), "overwrite": true, "folderUid": null}"
done
echo "Done importing Grafana dashboards."
