
#!/usr/bin/env bash
set -euo pipefail
# Expect AWS CLI configured; ECR repos will be created by Terraform (apply once before pushing).
ACCOUNT_ID="${ACCOUNT_ID:-123456789012}"
REGION="${REGION:-me-central-1}"
PROJECT="${PROJECT:-talentfairs}"

aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# API
docker build -t $PROJECT-api:8.0.0 ../../services/api
docker tag  $PROJECT-api:8.0.0 $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$PROJECT/api:8.0.0
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$PROJECT/api:8.0.0

# WEB
docker build -t $PROJECT-web:8.0.0 ../../services/web
docker tag  $PROJECT-web:8.0.0 $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$PROJECT/web:8.0.0
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$PROJECT/web:8.0.0
