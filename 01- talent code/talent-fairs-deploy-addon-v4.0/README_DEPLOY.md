# Go-Live — Unified v4.0

1) Create ECR repo (e.g., `talent-fairs/api`).
2) Configure GitHub OIDC → IAM Role using `iam/github-oidc-trust-policy.json`.
3) Add Environment `production` with variables & secrets per `docs/SECRETS.md`.
4) Edit `infra/terraform/prod.tfvars` (domain, region, project).
5) Run the workflow **Go-Live — Unified v4.0** with an `image_tag` (e.g., `v4.0.1`).

## Private ALB (Modern Option)
Use **CloudFront VPC Origins** so CloudFront is the only entrypoint to a private ALB in your VPC. Requires recent AWS provider and CloudFront support. If unavailable in your region/provider version, keep ALB public but restrict with:
- Secret header (CloudFront → ALB)
- Security group allowing only **CloudFront origin-facing prefix list**
