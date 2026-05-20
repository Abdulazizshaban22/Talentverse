
# Frontends
- apps/web-talent (Next.js App Router) — للمواهب
- apps/web-org (Next.js App Router) — للجهات

## Auth (Auth.js / NextAuth) مع Keycloak
- إعداد المزود Keycloak في ملف route.ts ضمن `/app/api/auth/[...nextauth]`.
- راجع التوثيق: App Router (Next.js) و Keycloak Provider في Auth.js.

## Push Notifications
- صفحة `/push` تقوم بتسجيل Service Worker والاشتراك في Web Push (تجريبي).
- يتطلب VAPID keys وخادم Push يرسل رسائل إلى endpoint.

## Realtime
- صفحة `/realtime` تتصل ببوابة Socket.IO في API Gateway.
