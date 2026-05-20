# Go‑Live Runbook (v5.1 Patch)

1) Keycloak Broker (Nafath)
   - Admin → Identity Providers → OpenID Connect v1.0 → import `nafath-idp.json`
   - Add Redirect URIs per `REDIRECT_URIS.yaml`
2) Payments
   - HyperPay: set HYPERPAY_TOKEN, HYPERPAY_ENTITY_ID; use `/payments/hyperpay/verify`
   - Tap: set TAP_WEBHOOK_SECRET; expose `/payments/tap/webhook` (raw body)
3) ZATCA
   - Replace pkcs11_client with vendor module and point to PKCS#11 .so/.dll
4) OneRoster
   - Upload ZIP and run `importOneRosterZip(path)` via admin job
5) Trust & Safety
   - Apply migration `001_audit_log.sql`; wire `audit_mw` to admin routes
6) Mobile
   - Configure Apple/Android push credentials; set scheme `com.talentfairs.app`
