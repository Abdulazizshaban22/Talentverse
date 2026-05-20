
# v5.4 Installation Notes
- تم دمج v5.2 + v5.3.
- Route PKCS#11: POST /compliance/zatca/sign (uses pkcs11js and env: PKCS11_LIB_PATH, PKCS11_PIN, PKCS11_KEY_LABEL).
- أضف web_acl_id إلى CloudFront لربط WAF. أنشئ VPC Origin من الكونسول ثم import إلى Terraform.
