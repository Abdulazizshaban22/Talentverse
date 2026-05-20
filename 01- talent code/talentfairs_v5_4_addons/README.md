# TalentFairs v5.4 Add-ons

## 1) CloudFront VPC Origin → Terraform import
- `infra/terraform/cloudfront_vpc_origin.tf`: مورد `aws_cloudfront_vpc_origin` + ملاحظات النسخة.
- `infra/terraform/scripts/import.sh`: يستورد الـDistribution + VPC Origin إلى حالة Terraform.
- `infra/terraform/scripts/check.sh`: يفحص الـOrigins الحالية عبر AWS CLI.
- `infra/terraform/STATE_MAPPING.md`: شرح حالة الاستيراد وكيفية نقل السمات إلى HCL.

> تأكد من استخدام **AWS Provider >= 5.82.0** ودعم المنطقة us-east-1 للتحكم بـCloudFront.

## 2) Keycloak Nafath OIDC
- `keycloak/realm-talent-prod-nafath.json`: ملف Realm جاهز يتضمن موصل **Nafath** كـ OIDC IdP + عملاء الويب/الموبايل.
- `keycloak/README_NAFATH.md`: خطوات الاستيراد وضبط Redirect URIs والمفاتيح.

