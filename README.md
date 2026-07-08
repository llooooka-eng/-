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

> يضبط ملف `.npmrc` الخيار `legacy-peer-deps=true` تلقائياً (بسبب تعارض أقران بين
> `expo-router` و `expo-constants` في الإصدارات المثبّتة)، فلا حاجة لتمريره يدوياً.

## الفحص والاختبارات

```bash
npm run typecheck   # فحص TypeScript (tsc --noEmit)
npm test            # اختبارات Jest
npm run test:watch  # وضع المراقبة
```

اختبارات الوحدة تغطّي منطق الأعمال النقي في `lib/` (تنسيق المبالغ والتواريخ في
`lib/format.ts`، ومُحوّلات المتجر في `lib/store.ts`: الحجز، الإلغاء والاسترداد،
حساب المحفظة، التقييم). يشغّل GitHub Actions (`.github/workflows/ci.yml`) الفحص
والاختبارات على كل دفع وطلب دمج.

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
context/AuthContext.tsx  غلاف React للمتجر: مصادقة + تخزين محلي (talluq_db_v1)
lib/store.ts             منطق الأعمال النقي (مُحوّلات قابلة للاختبار)
__tests__/               اختبارات Jest (format + store)
services/                عميل Supabase + خدمات الحجز/المحفظة (مسار الإنتاج)
hooks/useWallet.ts       hook المحفظة (مسار الإنتاج)
lib/format.ts            تنسيق الريال والتواريخ
types/database.ts        أنواع البيانات المشتركة
integrations/backend/    شاشة الدفع بنسخة Supabase + Moyasar (مرجع)
supabase/                مخطط القاعدة + RLS + الدوال + Edge Functions (الإنتاج)
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
2. طبّق `supabase/schema.sql` وانشر الدوال في `supabase/functions/` — التفاصيل في
   `supabase/README.md`.
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

### تنبيهات وحركة

- **تذكير بالحجز**: عند تأكيد الحجز يُجدَّل إشعار محلي قبل الموعد بساعة عبر
  `expo-notifications` (يُلغى عند إلغاء الحجز). كل شيء محميّ فلا يُعطِب التطبيق
  إن رُفض الإذن أو لم تُدعم المنصّة.
- **حركة الافتتاح**: ظهور تدريجي وطفو خفيف لميدالية اللوقو، ويحترم إعداد «تقليل
  الحركة» في الجهاز.

### ملاحظة الاتجاه (RTL)

التطبيق يفرض RTL عبر `I18nManager.forceRTL(true)` (يحتاج إعادة تشغيل واحدة عند
أول إقلاع). صفوف العرض تستخدم `row-reverse` عمداً لضبط ترتيب القراءة العربي؛
عند أول تشغيل على جهاز تحقّق من الاتجاه وأعد التحميل مرة إن ظهرت العناصر معكوسة.

### الثيم الفاتح/الداكن

يدعم التطبيق ثيمين (لوحتان بنفس المفاتيح: `lightColors` / `darkColors`). تقرأ
المكوّنات اللوحة النشطة عبر `useTheme()` و `useThemedStyles(makeStyles)` من
`context/ThemeContext.tsx`. الوضع (فاتح/داكن/تلقائي حسب الجهاز) يُبدَّل من شاشة
«حسابي» ويُحفظ محلياً تحت `talluq_theme`.
