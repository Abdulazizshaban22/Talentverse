#!/usr/bin/env bash
set -euo pipefail
: "${OPENSEARCH_NODE:?OPENSEARCH_NODE not set}"
: "${1:?Usage: ltr_upload_model.sh <domain> <model.json>}"
: "${2:?Usage: ltr_upload_model.sh <domain> <model.json>}"
DOMAIN="$1"
MODEL_FILE="$2"
AUTH="${OPENSEARCH_AUTH:-}"
SSL="${OPENSEARCH_SSL:-false}"
CURL_OPTS="-sS"
if [ "$SSL" = "true" ]; then CURL_OPTS="$CURL_OPTS -k"; fi
if [ -n "$AUTH" ]; then AUTH_OPT="-u $AUTH"; else AUTH_OPT=""; fi
FEATURESET="tf_features_${DOMAIN}"
MODEL_NAME="tf_ltr_${DOMAIN}_xgb"

PAYLOAD=$(jq -n --arg m "$(cat "$MODEL_FILE")" --arg fs "$FEATURESET"   '{model:{name:"'"$MODEL_NAME"'", model:{type:"model/xgboost+json", definition:$m}, feature_set:$fs}}')

curl $CURL_OPTS $AUTH_OPT -XPOST "$OPENSEARCH_NODE/_ltr/_model/$MODEL_NAME"   -H "Content-Type: application/json"   -d "$PAYLOAD" | jq .
