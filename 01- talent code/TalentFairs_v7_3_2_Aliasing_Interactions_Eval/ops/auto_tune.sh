#!/usr/bin/env bash
set -euo pipefail
: "${1:?Usage: auto_tune.sh <domain: posts|people|jobs|courses>}"
DOMAIN="$1"
mkdir -p data/ltr/judgments out metrics

# 1) Export judgments from real interactions (choose PG or CSV via env)
if [ -n "${PG_CONN_STR:-}" ]; then
  python ops/judgments_from_interactions.py --domain "$DOMAIN" --out "data/ltr/judgments/${DOMAIN}.tsv" --pg "$PG_CONN_STR"
elif [ -n "${INTERACTIONS_CSV:-}" ]; then
  python ops/judgments_from_interactions.py --domain "$DOMAIN" --out "data/ltr/judgments/${DOMAIN}.tsv" --csv "$INTERACTIONS_CSV"
else
  echo "Set PG_CONN_STR or INTERACTIONS_CSV"; exit 2
fi

# 2) Fetch feature logs for training vectors (sampled)
node ops/os_fetch_ltr_logs.js "$DOMAIN"

# 3) Train model (LambdaMART/Rank:pairwise) — placeholder demo that expects you to map features
python ops/train_ltr_xgb.py "data/ltr/judgments/${DOMAIN}.tsv" "out/model_${DOMAIN}.json"

# 4) Upload model and switch alias: DOMAIN@staging -> new model, then atomically flip prod
bash ops/ltr_upload_model.sh "$DOMAIN" "out/model_${DOMAIN}.json"
node ops/model_alias_set.js "${DOMAIN}@prod" "tf_ltr_${DOMAIN}_xgb"
