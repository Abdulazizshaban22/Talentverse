#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 /absolute/path/to/repo" >&2
  exit 1
fi

REPO="$1"
cd "$REPO"

# Load vars
if [ ! -f "./infra/prod.tfvars" ]; then
  echo "⚠️  Please create ./infra/prod.tfvars (copy from prod.tfvars.example)"; exit 2
fi

# Extract region and ECR repos (optional)
REGION=$(grep -E '^region' infra/prod.tfvars | awk -F\" '{print $2}')
[ -z "${REGION:-}" ] && REGION="me-central-1"

echo "🔧 Installing dependencies (web/api)…"
( cd apps/api && npm i )
( cd apps/web && npm i && npm run build || true )

echo "🧱 Terraform init/apply…"
( cd infra/terraform && terraform init -input=false && terraform apply -auto-approve -input=false -var-file="../prod.tfvars" )

echo "✅ Base infrastructure applied. Next steps:"
echo "  - Create or Import CloudFront VPC Origin and re-run 'terraform apply'"
echo "  - Point DNS CNAME for ${REGION} CloudFront domain to your ${DOMAIN}"
