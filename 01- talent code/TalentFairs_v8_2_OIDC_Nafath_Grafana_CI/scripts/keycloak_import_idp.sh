
#!/usr/bin/env bash
set -euo pipefail
: "${KEYCLOAK_BASE:?}"; : "${KEYCLOAK_USER:?}"; : "${KEYCLOAK_PASS:?}"
REALM="${REALM:-talentfairs}"
IDP_JSON="${1:-keycloak/idp/nafath_oidc_template.json}"
TOKEN=$(curl -sS --fail -d "client_id=admin-cli" -d "username=$KEYCLOAK_USER" -d "password=$KEYCLOAK_PASS" -d "grant_type=password" "$KEYCLOAK_BASE/realms/master/protocol/openid-connect/token" | jq -r .access_token)
curl -sS --fail -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"   -X POST "$KEYCLOAK_BASE/admin/realms/$REALM/identity-provider/instances"   --data @"$IDP_JSON"
echo "Imported IdP from $IDP_JSON into realm $REALM"
