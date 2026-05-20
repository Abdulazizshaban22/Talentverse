#!/usr/bin/env bash
set -euo pipefail

: "${OPENSEARCH_NODE:?OPENSEARCH_NODE not set}"
AUTH="${OPENSEARCH_AUTH:-}"
SSL="${OPENSEARCH_SSL:-false}"
CURL_OPTS="-sS"
if [ "$SSL" = "true" ]; then CURL_OPTS="$CURL_OPTS -k"; fi
if [ -n "$AUTH" ]; then AUTH_OPT="-u $AUTH"; else AUTH_OPT=""; fi

for A in tf_posts@read tf_posts@write tf_people@read tf_people@write tf_jobs@read tf_jobs@write tf_courses@read tf_courses@write; do
  echo "== GET alias $A =="
  curl $CURL_OPTS $AUTH_OPT -XGET "$OPENSEARCH_NODE/_alias/$A" | jq .
done
