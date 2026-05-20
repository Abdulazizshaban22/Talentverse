
#!/usr/bin/env bash
set -euo pipefail
ACCOUNT_ID="${ACCOUNT_ID:-123456789012}"
REGION="${REGION:-me-central-1}"
PROJECT="${PROJECT:-talentfairs}"

aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# API
docker build -t $PROJECT-api-blue:8.1.0 ../../services/api
docker tag  $PROJECT-api-blue:8.1.0 $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$PROJECT/api:8.1.0-blue
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$PROJECT/api:8.1.0-blue

docker build -t $PROJECT-api-green:8.1.0 ../../services/api
docker tag  $PROJECT-api-green:8.1.0 $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$PROJECT/api:8.1.0-green
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$PROJECT/api:8.1.0-green

# WEB
docker build -t $PROJECT-web-blue:8.1.0 ../../services/web
docker tag  $PROJECT-web-blue:8.1.0 $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$PROJECT/web:8.1.0-blue
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$PROJECT/web:8.1.0-blue

docker build -t $PROJECT-web-green:8.1.0 ../../services/web
docker tag  $PROJECT-web-green:8.1.0 $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$PROJECT/web:8.1.0-green
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$PROJECT/web:8.1.0-green
