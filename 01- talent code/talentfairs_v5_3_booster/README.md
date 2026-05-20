# TalentFairs v5.3 — Production Booster (Overlay for v5.2)

هذه الحزمة تُدمَج فوق v5.2 وتضيف مكوّنات إنتاجية (PKCS#11، OneRoster CLI، Compose dev، Realm Keycloak، Postman، CI Tests…).

## الدمج
```bash
./apply_booster.sh /path/to/TalentFairs_v5.2_Unified_GoLive_Bundle
```

## حزم npm المطلوبة (أضفها في `apps/api`):
```bash
npm i pkcs11js adm-zip csv-parse
npm i -D jest @types/jest ts-jest
```
