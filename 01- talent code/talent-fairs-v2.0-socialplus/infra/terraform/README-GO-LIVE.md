1) Build & push images to ECR, update images in ecs_alb_cloudfront.tf
2) Fill terraform.tfvars:
name="talent-fairs"
region="me-central-1"
domain="app.example.com"
vpc_id="vpc-xxxx"
subnet_ids=["subnet-a","subnet-b"]
origin_secret="generate-secret"
3) terraform init && terraform apply
4) CNAME your domain to CloudFront
