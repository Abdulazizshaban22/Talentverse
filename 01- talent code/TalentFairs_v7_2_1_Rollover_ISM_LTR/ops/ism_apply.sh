#!/usr/bin/env bash
set -euo pipefail

: "${OPENSEARCH_NODE:?OPENSEARCH_NODE not set}"
AUTH="${OPENSEARCH_AUTH:-}"
SSL="${OPENSEARCH_SSL:-false}"
CURL_OPTS="-sS"
if [ "$SSL" = "true" ]; then CURL_OPTS="$CURL_OPTS -k"; fi
if [ -n "$AUTH" ]; then AUTH_OPT="-u $AUTH"; else AUTH_OPT=""; fi

echo "== Apply ISM policies =="
for P in tf_posts_policy tf_people_policy tf_jobs_policy tf_courses_policy; do
  echo "-> $P"
  curl $CURL_OPTS $AUTH_OPT -XPUT "$OPENSEARCH_NODE/_plugins/_ism/policies/$P" \
     -H "Content-Type: application/json" \
     --data-binary "@$(dirname "$0")/ism_policies.json" | jq . > /dev/null || true
done

echo "== Attach policies to current indices (000001) =="
for IDX in tf_posts-000001 tf_people-000001 tf_jobs-000001 tf_courses-000001; do
  POL="${IDX%%-*}_policy"
  echo "-> attach $POL to $IDX"
  curl $CURL_OPTS $AUTH_OPT -XPOST "$OPENSEARCH_NODE/_plugins/_ism/add/$IDX" \
    -H "Content-Type: application/json" \
    -d "{\"policy_id\":\"$POL\"}" | jq . > /dev/null || true
done

echo "Done ISM apply."
