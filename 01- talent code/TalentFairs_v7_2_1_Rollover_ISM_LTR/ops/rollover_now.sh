#!/usr/bin/env bash
set -euo pipefail

: "${OPENSEARCH_NODE:?OPENSEARCH_NODE not set}"
AUTH="${OPENSEARCH_AUTH:-}"
SSL="${OPENSEARCH_SSL:-false}"
CURL_OPTS="-sS"
if [ "$SSL" = "true" ]; then CURL_OPTS="$CURL_OPTS -k"; fi
if [ -n "$AUTH" ]; then AUTH_OPT="-u $AUTH"; else AUTH_OPT=""; fi

ALIASES=("tf_posts@write" "tf_people@write" "tf_jobs@write" "tf_courses@write")

for A in "${ALIASES[@]}"; do
  echo "== Rollover $A → create *-000002 (forcing via condition max_docs) =="
  curl $CURL_OPTS $AUTH_OPT -XPOST "$OPENSEARCH_NODE/$A/_rollover" \
    -H "Content-Type: application/json" \
    -d '{"conditions":{"max_docs":1}}' | jq .
done
