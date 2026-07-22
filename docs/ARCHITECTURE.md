# معمارية تألق (Architecture)

يوثّق هذا الملف الهيكل والاتفاقيات المتّبعة في التطبيق. حدّثه مع كل مرحلة.

## المبادئ

- **Clean Architecture + Feature-First**: كل ميزة معزولة تحت `lib/features/<feature>/`،
  مقسّمة إلى ثلاث طبقات عند الحاجة: `domain` (كيانات + عقود Repository + حالات استخدام)،
  `data` (تنفيذ Repository + مصادر بيانات Supabase + نماذج)، و`presentation`
  (شاشات + مكوّنات + ViewModels عبر Riverpod).
- **MVVM**: طبقة العرض لا تحوي منطق أعمال؛ الحالة تُدار في Notifier/AsyncNotifier
  (الـ ViewModel) وتُعرض بواسطة Widgets.
- **Repository Pattern**: طبقة العرض والدومين لا تعرف Supabase؛ تتعامل مع واجهات
  مجرّدة يُنفّذها `data`.
- **SOLID**: اعتماديات تتّجه للداخل (Presentation → Domain ← Data)، وكل وحدة
  لها مسؤولية واحدة.

## هيكل المجلّدات

```
lib/
├── main.dart                 # نقطة الدخول
├── bootstrap.dart            # تهيئة: .env، Supabase، SharedPreferences، runApp
├── app.dart                  # جذر MaterialApp.router (ثيم + لغة + تنقّل)
├── core/                     # بنية مشتركة عبر كل الميزات
│   ├── config/               # AppConfig (.env)، مزوّد عميل Supabase
│   ├── localization/         # LocaleController + اللغات المدعومة
│   ├── providers/            # مزوّدات مشتركة (SharedPreferences)
│   ├── router/               # GoRouter (routerProvider) + أسماء المسارات
│   └── theme/                # الألوان، الطباعة، بناء الثيمات، ThemeController
├── features/
│   └── splash/
│       └── presentation/     # شاشة الافتتاح ومكوّناتها
└── l10n/                     # ملفات ARB + الكود المولّد (AppLocalizations)
```

## إدارة الحالة (Riverpod)

- `sharedPreferencesProvider`: يُحقن في `bootstrap` عبر `overrideWithValue` بعد
  تهيئته اللاتزامنية، فيصبح متاحًا بشكل متزامن لبقيّة المزوّدات.
- `themeControllerProvider`: يحمل التشكيلة (كلاسيكي/وردي) والوضع (فاتح/داكن/نظام)،
  ويحفظهما محليًا. أي تغيير يعيد بناء `MaterialApp` فورًا.
- `localeControllerProvider`: يحمل اللغة الحالية ويحفظها. تبديل اللغة يغيّر
  الاتجاه والنصوص **دون إعادة تشغيل**.
- `routerProvider`: يوفّر `GoRouter` الوحيد للتطبيق.

## الثيمات الأربعة

`AppFlavor{classic, pink}` × `ThemeMode{light, dark}` = أربع ثيمات:
Light / Dark / Pink Light / Pink Dark. `AppTheme` يبني `ThemeData` بأسلوب
Material 3 من `ColorScheme.fromSeed` مع ضبط الأسطح لهوية تألق.

## التوطين

`flutter gen-l10n` يولّد `AppLocalizations` من `lib/l10n/app_ar.arb` و`app_en.arb`.
العربية هي الافتراضية (RTL). أضف المفاتيح للملفّين معًا ثم أعد التوليد.

## البيئة و Supabase

القيم في `.env` تُقرأ حصريًا عبر `AppConfig`. تهيئة Supabase تحدث في `bootstrap`
فقط عند توفّر `SUPABASE_URL` و`SUPABASE_ANON_KEY` (يبقى التطبيق قابلاً للتشغيل
بدونها أثناء التطوير المبكّر). الحماية تُبنى على Row Level Security في PostgreSQL.

## الأوامر

```bash
flutter pub get          # جلب الاعتماديات
flutter gen-l10n         # توليد كود التوطين بعد تعديل ARB
flutter analyze          # فحص ثابت (يجب أن يمرّ بلا أخطاء)
flutter test             # تشغيل الاختبارات
flutter run              # تشغيل التطبيق
```
