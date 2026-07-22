import 'package:flutter/material.dart';

/// الطباعة المشتركة لكل الثيمات.
///
/// ملاحظة: خط «IBM Plex Sans Arabic» سيُضاف كأصل (asset) في مرحلة لاحقة؛
/// حتى ذلك الحين نبقي [fontFamily] فارغًا فيستخدم خط النظام. أهم قاعدة عربية:
/// لا نطبّق `letterSpacing` على النص العربي لأنه يكسر اتّصال الحروف.
abstract final class AppTypography {
  /// اسم عائلة الخط المقصودة (تُفعَّل عند إضافة أصل الخط).
  static const String? fontFamily = null;

  /// يبني [TextTheme] فوق الافتراضي مع تصفير التباعد وضبط الارتفاعات
  /// لقراءة عربية مريحة (أوسع قليلاً من الافتراضي اللاتيني).
  static TextTheme textThemeFor(Brightness brightness) {
    final base = brightness == Brightness.dark
        ? Typography.material2021().white
        : Typography.material2021().black;

    return base
        .apply(fontFamily: fontFamily)
        .copyWith(
          displayLarge: base.displayLarge?.copyWith(letterSpacing: 0, height: 1.2),
          headlineMedium:
              base.headlineMedium?.copyWith(letterSpacing: 0, height: 1.35),
          titleLarge: base.titleLarge?.copyWith(letterSpacing: 0, height: 1.35),
          bodyLarge: base.bodyLarge?.copyWith(letterSpacing: 0, height: 1.55),
          bodyMedium: base.bodyMedium?.copyWith(letterSpacing: 0, height: 1.55),
          labelLarge: base.labelLarge?.copyWith(letterSpacing: 0),
        );
  }
}
