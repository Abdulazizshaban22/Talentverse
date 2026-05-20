
#!/usr/bin/env bash
set -euo pipefail

# Load .env if exists
if [ -f .env ]; then
  set -a; source .env; set +a
fi

echo "▶ Bringing up containers..."
docker compose up -d --build

echo "▶ Waiting for Postgres..."
until docker exec $(docker compose ps -q db) pg_isready -U postgres >/dev/null 2>&1; do sleep 2; done

DB_URL="postgresql://postgres:postgres@localhost:5432/talentverse"

echo "▶ Applying migrations..."
psql "$DB_URL" -f data/migrations/011_ingestion_edu.sql
psql "$DB_URL" -f data/migrations/012_ingestion_sports.sql
psql "$DB_URL" -f data/migrations/013_ingestion_hr.sql
# older feature migrations if present
for f in 007_verified_recruiters.sql 008_apply.sql 009_salary_explorer.sql 010_badges.sql; do
  if [ -f data/migrations/$f ]; then psql "$DB_URL" -f data/migrations/$f; fi
done

echo "▶ Seeding demo data..."
psql "$DB_URL" -f data/seed/seed.sql

echo "▶ Waiting for Keycloak..."
until curl -sSf http://localhost:8081/realms/master/.well-known/openid-configuration >/dev/null; do sleep 3; done

echo "▶ Configuring Keycloak realm & clients..."
ADMIN_TOKEN=$(curl -s -d "client_id=admin-cli" -d "username=admin" -d "password=admin" -d "grant_type=password" http://localhost:8081/realms/master/protocol/openid-connect/token | jq -r .access_token)

# Create realm if not exists
if ! curl -s -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8081/admin/realms | jq -e '.[] | select(.realm=="talentverse")' >/dev/null; then
  curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json"     -d '{"realm":"talentverse","enabled":true}' http://localhost:8081/admin/realms >/dev/null
fi

# Create clients
create_client () {
  local cid="$1"; local secret="$2"; local accessType="${3:-CONFIDENTIAL}"
  if ! curl -s -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8081/admin/realms/talentverse/clients | jq -e '.[] | select(.clientId=="'${cid}'")' >/dev/null; then
    curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json"       -d '{"clientId":"'"${cid}"'","enabled":true,"publicClient":false,"protocol":"openid-connect","redirectUris":["*"],"serviceAccountsEnabled":true,"standardFlowEnabled":true,"directAccessGrantsEnabled":true,"clientAuthenticatorType":"client-secret"}'       http://localhost:8081/admin/realms/talentverse/clients >/dev/null
    # set secret
    ID=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8081/admin/realms/talentverse/clients | jq -r '.[] | select(.clientId=="'${cid}'") | .id')
    curl -s -X PUT -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json"       -d '{"type":"secret","value":"'"${secret}"'"}'       http://localhost:8081/admin/realms/talentverse/clients/${ID}/client-secret >/dev/null
  fi
}

create_client "api-gateway" "changeme"
create_client "web-app" "changeme"

echo "✅ Deploy complete."
echo "URLs:"
echo "  • Talent (web-talent): http://localhost:3000"
echo "  • Orgs (web-org):     http://localhost:3001"
echo "  • GovDash:            http://localhost:3003"
echo "  • Mobile PWA:         http://localhost:3004"
echo "  • API Gateway:        http://localhost:8000"
echo "  • Keycloak:           http://localhost:8081"
