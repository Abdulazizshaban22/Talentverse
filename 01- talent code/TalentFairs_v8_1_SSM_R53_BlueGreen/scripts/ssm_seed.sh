
#!/usr/bin/env bash
set -euo pipefail
: "${SSM_PREFIX:?SSM_PREFIX is required, e.g., /talentfairs/prod/}"
: "${REGION:?AWS Region required}"
# Provide values via env before running (avoid storing in TF state)
VARS=( OPENSEARCH_NODE OPENSEARCH_AUTH KEYCLOAK_BASE KEYCLOAK_REALM HYPERPAY_ACCESS_TOKEN TAP_SECRET RESEND_API_KEY )
for K in "${VARS[@]}"; do
  V="${!K:-}"
  if [ -z "$V" ]; then echo "WARN: $K is empty — skipping"; continue; fi
  TYPE="SecureString"
  if [ "$K" = "OPENSEARCH_NODE" ] || [ "$K" = "KEYCLOAK_BASE" ] || [ "$K" = "KEYCLOAK_REALM" ]; then TYPE="String"; fi
  aws ssm put-parameter --region "$REGION" --name "${SSM_PREFIX}${K}" --type "$TYPE" --overwrite --value "$V"
  echo "Put ${SSM_PREFIX}${K}"
done
