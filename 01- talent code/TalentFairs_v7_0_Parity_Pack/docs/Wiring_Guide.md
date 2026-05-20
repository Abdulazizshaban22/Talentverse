# Wiring Guide — دمج v7.0 مع v6.x

1) في `apps/api/src/main.js` أضف الراوترات من `apps/api/src/main.patch.note.txt`.
2) في الويب (Next.js): أضف روابط:
   - `/feed`، `/u/[id]`، `/learn/course/[id]`
3) إن كنت تستخدم Neo4j/OpenSearch في v6.x:
   - استبدل search_stub و`scorePost` بوصلات فعلية إلى الفهارس وGraph GDS.
4) فعّل **Nafath** على Keycloak واعتمد ختم "Verified" للملفات.
5) اربط Marketplace بالدفع (HyperPay/Tap) لتفعيل شراء الدورات.
