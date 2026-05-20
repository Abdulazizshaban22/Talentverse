1) افتح Keycloak → Realm: talent-prod → Identity Providers → OpenID Connect.
2) استورد `realm-talent-prod-nafath.json` أو استخدم `kcadm.sh update realms/talent-prod -f file.json`.
3) استبدل قيم Nafath (issuer/authorize/token/userinfo/jwks) ثم ضع CLIENT_ID/SECRET كمتغيرات بيئة.
4) تأكد من Redirect URIs للويب والموبايل.
