ضع في GitHub → Environments/Secrets:
- AWS_ROLE_ARN, AWS_REGION
- CF_CERT_ARN (اختياري إن أردت تمريره كسرّ بدل tfvars)
- (اختياري) مفاتيح ECR إذا استخدمت بناء صور عبر Actions
أسرار المنتج:
- KEYCLOAK_URL, KEYCLOAK_REALM, NAFATH_* (CLIENT_ID/SECRET/ENDPOINTS)
- HYPERPAY_* , TAP_WEBHOOK_SECRET
- ZATCA_CERT_SERIAL, PKCS11_* , DATABASE_URL
