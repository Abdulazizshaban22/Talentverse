#!/usr/bin/env bash
set -euo pipefail
: "${OPENSEARCH_NODE:?OPENSEARCH_NODE not set}"

curl -sS -XGET "$OPENSEARCH_NODE/_alias/tf_posts@read"
curl -sS -XGET "$OPENSEARCH_NODE/_alias/tf_posts@write"
