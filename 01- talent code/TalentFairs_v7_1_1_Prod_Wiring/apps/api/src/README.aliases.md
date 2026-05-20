# استخدام الـaliases في الكود
اضبط متغيرات البيئة هكذا:
- OS_INDEX_POSTS=tf_posts@write
- OS_INDEX_PEOPLE=tf_people@write
- OS_INDEX_JOBS=tf_jobs@write
- OS_INDEX_COURSE=tf_courses@write

وعند الاستعلام استخدم المقابل للقراءة:
- OS_ALIAS_POSTS_READ=tf_posts@read
... إلخ

> رولوڤر لاحقًا: أنشئ tf_posts-000002 واضبط is_write_index عليه عبر Update Aliases API، دون تغييرات على الكود.
