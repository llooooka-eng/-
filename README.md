# تألق (Talluq) — تطبيق حجز مواعيد الصالونات

تطبيق **Expo / React Native** لحجز مواعيد صالونات الحلاقة والتجميل (رجال، نساء،
أطفال، وخدمة منزلية). عربي أولاً (RTL) بهوية لؤلؤية/حبرية مع لمسة ذهبية «تألق».

بُني بدمج ملف التصميم (`docs/DESIGN.md`) مع أكواد الواجهة والخدمات المرفقة،
ثم أُكمِل ليصبح تطبيقاً متكاملاً يعمل مباشرة.

## التشغيل

```bash
npm install
npm start        # ثم امسح رمز QR بتطبيق Expo Go
# أو
npm run ios
npm run android
```

> يعمل التطبيق في **وضع العرض** مباشرة دون أي خادم — كل البيانات محلية عبر
> `AsyncStorage`. سجّل الدخول بأي رقم جوال سعودي (5XXXXXXXX) وأي رمز تحقق من 4 أرقام.

## البنية

```
app/                      شاشات expo-router (توجيه بالملفات)
  _layout.tsx             الجذر: الخطوط + RTL + المزوّدات + حارس الدخول
  (auth)/                 الترحيب · تسجيل الدخول · رمز التحقق
  (tabs)/                 الرئيسية · حجوزاتي · المحفظة · حسابي
  salon/[id].tsx          تفاصيل الصالون
  booking/new.tsx         تدفّق الحجز (خدمة/حلاق/وقت/موقع)
  booking/confirm.tsx     التأكيد والدفع (وضع العرض)
  rate/[id].tsx           تقييم التجربة
  dashboard.tsx           لوحة صاحب الصالون (إدارة الخدمات)
components/               مكوّنات الواجهة (ui, wallet, SalonCard, Logo, payment/)
constants/               theme.ts (نظام التصميم) + sampleData.ts (بيانات العيّنة)
context/AuthContext.tsx  المتجر المركزي: مصادقة + بيانات محلية (talluq_db_v1)
services/                عميل Supabase + خدمات الحجز/المحفظة (مسار الإنتاج)
hooks/useWallet.ts       hook المحفظة (مسار الإنتاج)
lib/format.ts            تنسيق الريال والتواريخ
types/database.ts        أنواع البيانات المشتركة
integrations/backend/    شاشة الدفع بنسخة Supabase + Moyasar (مرجع)
docs/DESIGN.md           دليل التصميم الكامل
```

## وضعان للتشغيل

| | وضع العرض (افتراضي) | مسار الإنتاج |
|---|---|---|
| البيانات | `AsyncStorage` محلياً | Supabase (Postgres + RLS) |
| المصادقة | رقم جوال + أي رمز | Supabase Auth (OTP) |
| الدفع | محاكاة فورية | Moyasar (مدى/Apple Pay) + Edge Functions |
| الملفات | `context/AuthContext.tsx` وشاشات `app/` | `services/*`, `hooks/useWallet`, `integrations/backend/` |

### تفعيل مسار الإنتاج (اختياري)

1. أضف بيانات Supabase في `app.json` ضمن `expo.extra`:
   ```json
   "extra": { "supabaseUrl": "https://xxx.supabase.co", "supabaseAnonKey": "..." }
   ```
   أو عبر متغيّرات البيئة `EXPO_PUBLIC_SUPABASE_URL` و `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
2. جهّز الجداول والدوال (`bookings`, `wallets`, `wallet_transactions`,
   `payment_transactions`, ودوال `create-payment` / `refund-payment` / `evaluate_refund`).
3. ثبّت الحزمة الأصلية للدفع وابنِ Development Build (Apple Pay لا يعمل في Expo Go):
   ```bash
   npx expo install react-native-moyasar-sdk
   npx expo run:ios
   ```
4. استبدل شاشة `app/booking/confirm.tsx` بنسخة الخادم من
   `integrations/backend/ConfirmBookingBackend.tsx`، ووصّل شاشة المحفظة بـ
   `hooks/useWallet` بدل المتجر المحلي.

## نظام التصميم

كل الألوان والمسافات والزوايا والخطوط معرّفة في `constants/theme.ts` ومستمدّة من
`docs/DESIGN.md`. الخط الأساسي `IBM Plex Sans Arabic`. الذهبي مقتصد للإبراز فقط.
