# Terraform — AWS Go-Live (ECS + ACM + CloudFront)

This is a minimal scaffold using community modules. Fill `terraform.tfvars` then:

```
terraform init
terraform apply
```

- Creates ECS cluster & services (Fargate) for: api, ai-core, points
- Provisions ACM certificate (for CloudFront) and a distribution with ALB origin

**Note:** This is a skeleton for production hardening.
