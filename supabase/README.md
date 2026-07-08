# مسار الإنتاج — Supabase + Moyasar

هذا المجلد يفعّل الخادم الحقيقي لتألق بدل وضع العرض المحلي.

## الملفات
- `schema.sql` — الجداول، الأنواع، فهارس، سياسات RLS، ودوال `evaluate_refund` و `process_cancellation`.
- `functions/create-payment/` — Edge Function تنشئ نيّة دفع Moyasar بمبلغ خادمي.
- `functions/refund-payment/` — Edge Function تنفّذ الإلغاء والاسترداد ذرّياً.

## خطوات التفعيل

1. **أنشئ مشروع Supabase** وخذ `Project URL` و `anon key`.
2. **طبّق المخطط**: الصق `schema.sql` في محرّر SQL بلوحة Supabase (أو `supabase db push`).
3. **انشر الدوال الطرفية**:
   ```bash
   supabase functions deploy create-payment
   supabase functions deploy refund-payment
   supabase secrets set MOYASAR_PUBLISHABLE_KEY=pk_... MOYASAR_SECRET_KEY=sk_...
   ```
4. **فعّل Realtime** على جدولَي `wallets` و `bookings` (للتحديث اللحظي).
5. **اربط التطبيق**: أضف في `app.json` ضمن `expo.extra`:
   ```json
   "extra": { "supabaseUrl": "https://xxx.supabase.co", "supabaseAnonKey": "..." }
   ```
6. **بدّل الشاشات لمسار الخادم**:
   - استبدل `app/booking/confirm.tsx` بمنطق `integrations/backend/ConfirmBookingBackend.tsx`.
   - وصّل شاشة المحفظة بـ `hooks/useWallet` بدل المتجر المحلي.

## مبادئ الأمان
- العميل **لا** يرسل المبالغ؛ تُحسب من الحجز في `create-payment`.
- القيود المالية (محفظة/استرداد) تتم في دوال `SECURITY DEFINER` داخل القاعدة.
- RLS يقصر كل صف على مالكه؛ الكتالوج (صالونات/خدمات) عام للقراءة فقط.
- مفتاح Moyasar على العميل هو `publishable` فقط؛ السرّي يبقى في الخادم.
