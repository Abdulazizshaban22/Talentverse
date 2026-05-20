# AWS Go‑Live (Terraform) — Notes
- يفضّل استخدام **CloudFront VPC Origins** لربط ALB خاص داخل VPC مباشرة بدون انترنت. بعد الإنشاء من الكونسول، يمكنك **import** في Terraform.
- إن لم يكن مفعّل لديك بعد، استخدم التوزيع الحالي مع ALB internal وNAT/Private link حسب سياستك.
- فعّل **WAF** وربطه بالتوزيع من الكونسول أو عبر Terraform module منفصل.
