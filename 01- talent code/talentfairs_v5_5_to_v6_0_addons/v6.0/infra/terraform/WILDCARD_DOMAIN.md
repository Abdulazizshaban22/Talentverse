لتفعيل نطاقات متعددة المستأجرين:
- استخدم شهادة ACM في us-east-1 لـ `*.talentfairs.sa` وربطها في CloudFront.
- أنشئ CNAME لكل مستأجر: `<tenant>.talentfairs.sa` يشير إلى توزيع CloudFront.
- إن أردت عزل أقوى: وزّع المستأجرين على حسابات/VPC مفصولة أو أطر ECS Services مستقلة.
