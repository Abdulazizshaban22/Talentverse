# Terraform — AWS (ECS + ALB + CloudFront + WAF + ACM + SSM)
هذا الهيكل يُنشئ:
- ECS Fargate Cluster + Service
- ALB (Public) كأصل (Origin) خلف CloudFront
- CloudFront Distribution + OAC (اختياري) + رأس سرّي لمنع الوصول المباشر للـALB
- AWS WAF مرتبط بـ CloudFront
- ACM Certificate (us-east-1) لشهادة CloudFront
- SSM Parameter Store للأسرار

> ملاحظة: عدّل المتغيرات في variables.tf وterraform.tfvars، ثم:
```bash
terraform init
terraform apply
```
