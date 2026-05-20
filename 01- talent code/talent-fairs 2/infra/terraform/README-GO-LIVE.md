# Go-Live Steps (ECS + ALB + CloudFront)

1. Prepare ECR images (api, ai-core, points) and replace images in `ecs_alb_cloudfront.tf`.
2. Fill `terraform.tfvars`:
```
name = "talent-fairs"
region = "me-central-1"
domain = "app.example.com"
vpc_id = "vpc-xxxx"
subnet_ids = ["subnet-a","subnet-b"]
origin_secret = "generate-random-secret"
```
3. `terraform init && terraform apply`
4. Add DNS CNAME to the CloudFront distribution domain.
5. On ALB, restrict access to requests that contain `X-Origin-Secret` only (WAF or listener rule).
