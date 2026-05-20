
#!/usr/bin/env bash
set -euo pipefail
: "${KEYCLOAK_BASE:?}"; : "${KEYCLOAK_USER:?}"; : "${KEYCLOAK_PASS:?}"
REALM="${REALM:-talentfairs}"
CLIENT_JSON="${1:-keycloak/realm.json}"
TOKEN=$(curl -sS --fail -d "client_id=admin-cli" -d "username=$KEYCLOAK_USER" -d "password=$KEYCLOAK_PASS" -d "grant_type=password" "$KEYCLOAK_BASE/realms/master/protocol/openid-connect/token" | jq -r .access_token)
# Ensure realm exists (import if not)
HTTP=$(curl -s -o /dev/null -w "%%{http_code}" "$KEYCLOAK_BASE/admin/realms/$REALM")
if [ "$HTTP" != "200" ]; then
  curl -sS --fail -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"     -X POST "$KEYCLOAK_BASE/admin/realms" --data @"$CLIENT_JSON"
  echo "Created realm from $CLIENT_JSON"
else
  echo "Realm exists: $REALM (you can PATCH clients via admin API as needed)"
fi
