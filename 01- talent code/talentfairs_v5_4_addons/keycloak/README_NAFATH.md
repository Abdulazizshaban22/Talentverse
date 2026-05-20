# Keycloak — Nafath OIDC Identity Provider (Import-Ready)

1) افتح لوحة Keycloak (Realm: talent-prod) ← **Identity Providers** ← **OpenID Connect v1.0**.
2) بدلاً من تعبئة يدويًا، استورد الملف:
   - `keycloak/realm-talent-prod-nafath.json`
   - أو استخدم `kcadm.sh`:
```bash
/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --user admin --password admin
/opt/keycloak/bin/kcadm.sh update realms/talent-prod -f keycloak/realm-talent-prod-nafath.json
```
3) استبدل قيم الـ endpoints بالروابط الرسمية لـ **Nafath** (issuer/authorize/token/userinfo/jwks).
4) ضع `NAFATH_CLIENT_ID` و `NAFATH_CLIENT_SECRET` كمتغيرات بيئة في بود/خدمة الـKeycloak.
5) تأكد من صحة **Redirect URIs**:
   - Web: `https://app.talentfairs.sa/*` و `http://localhost:3000/*` للتطوير.
   - Mobile: `com.talentfairs.app://cb` (Scheme للتطبيق) و `exp://*` لـ Expo أثناء التطوير.
6) عيّن **First Broker Login Flow** إلى `first broker login` (الافتراضي)، أو أنشئ Flow مخصصًا لربط المستخدمين الحاليين.
