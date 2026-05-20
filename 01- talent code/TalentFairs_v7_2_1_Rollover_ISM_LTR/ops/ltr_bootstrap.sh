#!/usr/bin/env bash
set -euo pipefail

: "${OPENSEARCH_NODE:?OPENSEARCH_NODE not set}"
AUTH="${OPENSEARCH_AUTH:-}"
SSL="${OPENSEARCH_SSL:-false}"
CURL_OPTS="-sS"
if [ "$SSL" = "true" ]; then CURL_OPTS="$CURL_OPTS -k"; fi
if [ -n "$AUTH" ]; then AUTH_OPT="-u $AUTH"; else AUTH_OPT=""; fi

echo "== Init LTR store =="
curl $CURL_OPTS $AUTH_OPT -XPUT "$OPENSEARCH_NODE/_ltr" | jq .

echo "== Create FeatureSets (posts/people/jobs/courses) =="
for NAME in tf_features_posts tf_features_people tf_features_jobs tf_features_courses; do
  echo "-> $NAME"
  curl $CURL_OPTS $AUTH_OPT -XPUT "$OPENSEARCH_NODE/_ltr/_featureset/$NAME" \
    -H "Content-Type: application/json" \
    --data-binary "@$(dirname "$0")/ltr_features/${NAME}.json" | jq .
done

echo "== Ready to log features using 'sltr' and 'ext.ltr_log' =="
