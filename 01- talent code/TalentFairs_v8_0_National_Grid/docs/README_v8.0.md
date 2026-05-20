# TalentFairs v8.0 — National Talent Graph Grid

هذا الإصدار يربط المدارس والجامعات وسوق العمل في شبكة موهبة وطنية واحدة (Multi‑Tenant).
يرتكز على:
- OneRoster 1.2 لبيانات الفصول والتسجيلات (CSV/REST).
- ESCO للمهارات والوظائف.
- Europass (CV/EDC) للتصدير.
- Open Badges 2.1 للـMicro‑credentials.
- PDPL للامتثال وسيادة البيانات.

## اللبنات
- **Tenant Layer**: دعم المستأجرين (schools/universities/employers) بعزل بيانات صارم.
- **Talent Graph**: Neo4j (أشخاص، مهارات، فصول، دورات، وظائف، شهادات، بادجات).
- **Search/LTR**: OpenSearch (فهرس people/jobs/courses/posts) مع LTR + ILM.
- **Identity**: Keycloak (Teacher/Guardian/Student/Employer/Admin) + IdP خارجي (Nafath).
- **Credentials**: تصدير Europass XML/JSON + إصدار OpenBadges Assertions.
- **Observability**: Grafana لوحات الاعتماد والتبنّي + nDCG + صحة الواردات.

## المسارات السريعة
- **/integrations/oneroster**: استيراد CSV/REST وتعبئة الجداول/الجراف.
- **/integrations/esco**: مزامنة المهارات والوظائف إلى graph/search.
- **/integrations/europass**: توليد ملف CV/EDC للتصدير.
- **/integrations/openbadges**: إنشاء Assertion 2.1 (JSON‑LD).
- **/ops/runbooks/go_live_v8.md**: خطوات الإطلاق الوطني.
