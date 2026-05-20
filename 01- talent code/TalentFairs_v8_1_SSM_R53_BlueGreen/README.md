
# TalentFairs v8.1 — SSM + Route53/ACM + Monitors + Staging + Blue/Green

تضيف هذه الحزمة فوق v8.0:
1) **SSM Parameter Store** + خرائط Secrets تلقائية لقراءة المتغيّرات داخل حاويات ECS.
2) **Route53 + ACM issuance** تلقائي (DNS validation) لـ CloudFront (us‑east‑1) و ALB (منطقة التطبيق).
3) **Monitors & Alerts**: إنذارات CloudFront/ALB إلى SNS (Email).
4) **Staging** ببيئة كاملة (staging.<domain>) مع توجيه HostHeader.
5) **Blue/Green** على الإنتاج عبر ALB Weighted Target Groups + سكربت قلب حركة.

> الخطوات السريعة: شغّل `scripts/ssm_seed.sh` ثم `scripts/go-live-prod.sh`. لتغيير اللون: `scripts/blue_green_switch.sh 0 100` (أزرق→أخضر).
