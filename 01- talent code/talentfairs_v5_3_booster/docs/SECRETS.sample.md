# GitHub → Settings → Secrets and variables → Actions (Environment: prod)
AWS_ROLE_ARN=arn:aws:iam::123456789012:role/gh-oidc-deployer
AWS_REGION=me-central-1
PROJECT=talentfairs
DOMAIN=app.talentfairs.sa
API_DOMAIN=api.talentfairs.sa
VPC_ID=vpc-xxxx
PRIVATE_SUBNETS_JSON=["subnet-aaa","subnet-bbb"]
PUBLIC_SUBNETS_JSON=["subnet-ccc","subnet-ddd"]
CF_CERT_ARN=arn:aws:acm:us-east-1:123:certificate/abc-...
ECR_API_REPO=123.dkr.ecr.me-central-1.amazonaws.com/tf-api
ECR_WEB_REPO=123.dkr.ecr.me-central-1.amazonaws.com/tf-web
