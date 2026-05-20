#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 /path/to/TalentFairs_v5.4_Installed_repo" >&2
  exit 1
fi

REPO="$1"
TF_DIR="$REPO/infra/terraform"

# Check tools
for t in aws terraform docker jq; do
  command -v $t >/dev/null || { echo "Missing tool: $t" >&2; exit 2; }
done

# Load prod vars
if [ ! -f "./infra/prod.tfvars" ]; then
  echo "⚠️  Provide ./infra/prod.tfvars (copy from prod.tfvars.example)" >&2
fi

echo "🔐 Logging in to ECR…"
AWS_REGION=$(jq -r '.region // empty' ./infra/prod.tfvars 2>/dev/null || echo "")
if [ -z "$AWS_REGION" ]; then AWS_REGION="me-central-1"; fi
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$(awk -F/ '{print $1}' <<< $(jq -r '.ecr_api_repo' ./infra/prod.tfvars))"

echo "🧱 Building & pushing API…"
ECR_API=$(jq -r '.ecr_api_repo' ./infra/prod.tfvars)
docker build -t tf-api:latest -f "$REPO/apps/api/Dockerfile" "$REPO"
docker tag tf-api:latest "$ECR_API:latest"
docker push "$ECR_API:latest"

echo "🧱 Building & pushing Web…"
ECR_WEB=$(jq -r '.ecr_web_repo' ./infra/prod.tfvars)
docker build -t tf-web:latest -f "$REPO/apps/web/Dockerfile" "$REPO/apps/web"
docker tag tf-web:latest "$ECR_WEB:latest"
docker push "$ECR_WEB:latest"

echo "🚀 Terraform apply…"
pushd "$TF_DIR" >/dev/null
terraform init -input=false
terraform apply -auto-approve -input=false -var-file "../../../infra/prod.tfvars"
popd >/dev/null

echo "✅ Go-Live base apply complete."
echo "Next (optional):"
echo "  - ./scripts/cf_import.sh <DIST_ID> <VPC_ORIGIN_ARN>"
echo "  - ./scripts/cf_attach_waf.sh <DIST_ID> <WEB_ACL_ARN>"
