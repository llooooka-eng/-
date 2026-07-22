# تألق · Talluq

منصة حجز مواعيد لصالونات الحلاقة والتجميل والمساج للسوق السعودي — تطبيق Flutter
احترافي قابل للتوسّع (App Store / Google Play).

> **حجز مواعيد الحلاقة والتجميل للرجال والنساء والأطفال** — صالونات رجال/نساء/أطفال،
> مراكز تجميل، مساج، سبا، وخدمة منزلية.

## التقنيات

Flutter · Dart · Riverpod · GoRouter · Supabase (PostgreSQL + RLS) · Material 3 —
بمعمارية Clean Architecture + MVVM + Repository Pattern (Feature-First).

## المزايا الأساسية

- لغتان: العربية (RTL) والإنجليزية (LTR) — تبديل فوري بلا إعادة تشغيل.
- أربعة ثيمات: Light / Dark / Pink Light / Pink Dark — تُختار وتُحفظ محليًا.
- نوعا مستخدم: العميل وصاحب المنشأة (لا حساب مستقل للموظفين).

## البدء

```bash
cp .env.example .env      # ثم املأ SUPABASE_URL و SUPABASE_ANON_KEY
flutter pub get
flutter run
```

## التوثيق

- المعمارية والاتفاقيات: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- نظام التصميم (ألوان/خطوط/مكوّنات): [`Talluq-Design.md`](Talluq-Design.md)
- إرشادات العمل داخل المستودع: [`CLAUDE.md`](CLAUDE.md)

## الأوامر

```bash
flutter analyze     # فحص ثابت (يجب أن يمرّ بلا أخطاء)
flutter test        # الاختبارات
flutter gen-l10n    # توليد كود التوطين بعد تعديل lib/l10n/*.arb
```
