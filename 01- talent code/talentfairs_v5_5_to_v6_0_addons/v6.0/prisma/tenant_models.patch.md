أضف حقل tenant_id لأغلب الجداول الحساسة (Org، User، SchoolClass، Enrollment، AuditLog، Event، KpiSnapshot).
نمذجة سريعة (مثال Prisma):
```
model User {
  id        String @id @default(cuid())
  tenant_id String
  sourcedId String @unique
  givenName String
  familyName String
  role      String
  @@index([tenant_id, role])
}
```
