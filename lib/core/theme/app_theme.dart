import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_typography.dart';

/// تشكيلة الألوان: الكلاسيكية (ذهبي) أو الوردية.
/// تتقاطع مع السطوع (فاتح/داكن) لتُنتج الثيمات الأربعة المطلوبة.
enum AppFlavor { classic, pink }

/// يبني [ThemeData] لكل تركيبة (تشكيلة × سطوع) بأسلوب Material 3.
abstract final class AppTheme {
  static ThemeData light(AppFlavor flavor) =>
      _build(flavor, Brightness.light);

  static ThemeData dark(AppFlavor flavor) => _build(flavor, Brightness.dark);

  static ThemeData _build(AppFlavor flavor, Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final seed = switch (flavor) {
      AppFlavor.classic => AppColors.gold,
      AppFlavor.pink => AppColors.rose,
    };

    final scheme = ColorScheme.fromSeed(
      seedColor: seed,
      brightness: brightness,
    );

    // نضبط الأسطح لتعكس هوية تألق (لؤلؤي دافئ / وردي هادئ / حبري داكن).
    final background = switch ((flavor, isDark)) {
      (AppFlavor.classic, false) => AppColors.pearl,
      (AppFlavor.classic, true) => AppColors.darkBackground,
      (AppFlavor.pink, false) => AppColors.roseTintLight,
      (AppFlavor.pink, true) => AppColors.roseInkDark,
    };
    final surface = isDark ? AppColors.darkSurface : AppColors.pearlCard;

    final tunedScheme = scheme.copyWith(surface: surface);

    return ThemeData(
      useMaterial3: true,
      colorScheme: tunedScheme,
      scaffoldBackgroundColor: background,
      textTheme: AppTypography.textThemeFor(brightness),
      appBarTheme: AppBarTheme(
        backgroundColor: background,
        foregroundColor: tunedScheme.onSurface,
        elevation: 0,
        centerTitle: true,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
    );
  }
}
