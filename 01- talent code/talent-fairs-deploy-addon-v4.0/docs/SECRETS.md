# GitHub `production` Environment

## Variables
- `AWS_REGION`
- `AWS_ACCOUNT_ID`
- `ECR_REPOSITORY`             # e.g., talent-fairs/api
- `TF_VAR_PROJECT`            # e.g., talent-fairs
- `TF_VAR_DOMAIN_NAME`        # e.g., talent.example.com
- `ALB_SECRET_HEADER_NAME`    # e.g., X-ALB-Secret

## Secrets
- `ROLE_TO_ASSUME_ARN`        # IAM role trusted for GitHub OIDC
- `ALB_SECRET_HEADER_VALUE`   # long random string

> Use GitHub → Settings → Environments → production.
