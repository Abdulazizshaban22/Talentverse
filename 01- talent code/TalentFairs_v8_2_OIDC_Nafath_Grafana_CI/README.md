
# TalentFairs v8.2 — OIDC (Keycloak + Nafath template) + Grafana CI + Dual Environments

هذه الحزمة تُكمل v8.1 عبر:
- **OIDC جاهز**: ملفات Realm + عميل OIDC للويب + قالب مزوّد هوية (IdP) باسم **nafath** (Placeholders للـissuer/urls).
- **سكربتات Keycloak**: استيراد IdP والعميل عبر REST (kcadm/curl).
- **Grafana CI**: استيراد لوحات تلقائيًا (CloudWatch + OpenSearch) باستخدام API Token.
- **Workflows ثنائية**: `staging` و`production` بمتغيرات بيئة منفصلة.

> استبدل القِيَم الوهمية (issuer/clientId/secret/urls) بنسختك الرسمية من مزوّد الهوية الوطني.
