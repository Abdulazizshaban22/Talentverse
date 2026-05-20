#!/usr/bin/env bash
set -euo pipefail

# ===== Config =====
: "${OPENSEARCH_NODE:?}"
: "${KEYCLOAK_BASE:?}"           # e.g., https://keycloak.example.com
: "${KEYCLOAK_REALM:?}"          # e.g., talentfairs
: "${KEYCLOAK_ADMIN_USER:?}"
: "${KEYCLOAK_ADMIN_PASS:?}"
: "${NAFATH_ISSUER:?}"           # e.g., https://nafath.gov.sa/oauth
: "${NAFATH_CLIENT_ID:?}"
: "${NAFATH_CLIENT_SECRET:?}"
: "${APP_DOMAIN:?}"              # e.g., app.talentfairs.sa
: "${API_DOMAIN:?}"              # e.g., api.talentfairs.sa
: "${TAP_SECRET_KEY:?}"
: "${TAP_WEBHOOK_SECRET:?}"
: "${HYPERPAY_BASE:=https://eu-prod.oppwa.com}"
: "${HYPERPAY_USER_ID:?}"
: "${HYPERPAY_PASSWORD:?}"
: "${HYPERPAY_ENTITY_ID:?}"

echo "=== (1) OpenSearch bootstrap templates + aliases ==="
pushd apps/api >/dev/null
node scripts/opensearch_bootstrap.js
popd >/dev/null

echo "=== (2) Keycloak: get admin token ==="
KC_TOKEN=$(curl -sS -X POST "$KEYCLOAK_BASE/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=admin-cli&username=$KEYCLOAK_ADMIN_USER&password=$KEYCLOAK_ADMIN_PASS" \
  | jq -r .access_token)

echo "=== (3) Keycloak: import Nafath IdP (OIDC broker) ==="
cat > /tmp/nafath-idp.json <<JSON
{
  "alias": "nafath",
  "displayName": "Nafath",
  "providerId": "oidc",
  "enabled": true,
  "trustEmail": true,
  "storeToken": true,
  "firstBrokerLoginFlowAlias": "first broker login",
  "config": {
    "useJwksUrl": "true",
    "authorizationUrl": "$NAFATH_ISSUER/authorize",
    "tokenUrl": "$NAFATH_ISSUER/token",
    "jwksUrl": "$NAFATH_ISSUER/.well-known/jwks.json",
    "clientId": "$NAFATH_CLIENT_ID",
    "clientSecret": "$NAFATH_CLIENT_SECRET",
    "clientAuthMethod": "client_secret_post",
    "defaultScope": "openid profile national_id",
    "uiLocales": "ar en"
  }
}
JSON

curl -sS -X POST "$KEYCLOAK_BASE/admin/realms/$KEYCLOAK_REALM/identity-provider/instances" \
  -H "Authorization: Bearer $KC_TOKEN" -H "Content-Type: application/json" \
  --data-binary @/tmp/nafath-idp.json

echo ">> Register this Redirect URI at Nafath:"
echo "   $KEYCLOAK_BASE/realms/$KEYCLOAK_REALM/broker/nafath/endpoint"

echo "=== (4) Register Webhooks ==="
# Tap
curl -sS -X POST "https://api.tap.company/v2/webhooks" \
  -H "Authorization: Bearer $TAP_SECRET_KEY" -H "Content-Type: application/json" \
  -d "{\"url\":\"https://$API_DOMAIN/webhooks/tap\",\"enabled_events\":[\"charge.captured\",\"charge.failed\"],\"hashstring\":\"$TAP_WEBHOOK_SECRET\"}" || true

# HyperPay: Use /webhooks/hyperpay as a custom handler that will GET payment status
echo ">> HyperPay webhook endpoint: https://$API_DOMAIN/webhooks/hyperpay"

echo "=== (5) Smoke tests ==="
curl -sS "https://$API_DOMAIN/health" || true
curl -sS "https://$API_DOMAIN/identity/status" || true
