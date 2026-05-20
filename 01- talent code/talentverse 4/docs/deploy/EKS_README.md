
# نشر مختصر على EKS (High-level)
1) أنشئ EKS + ALB + RDS عبر `infra/terraform/` (املأ المتغيرات) ثم `terraform apply`.
2) نزّل Argo CD ونفّذ App-of-Apps من `infra/k8s/helm/app-of-apps/argocd-apps.yaml`.
3) زد قيم Helm لكل خدمة بصورة ECR `talentverse/<service>:<tag>`. استخدم CI لديكم (workflow جاهز).
4) Keycloak: استورد realm + authorization JSON، واضبط clients والمابس (groups/roles → token claims).
5) أنشئ Ingress Controller (nginx) وفعّل WAF على الـ ALB (Terraform waf.tf).

> راقب أداء KNN (لوحة Grafana) واضبط نوع الفهرس HNSW/IVFFlat بحسب الحجم والكمون المطلوبين.
