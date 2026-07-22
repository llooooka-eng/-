import 'package:flutter/material.dart';

/// توكنات الألوان لتطبيق تألق.
///
/// تشكيلتان (flavors): الكلاسيكية (ذهبي/حبري/لؤلؤي) والوردية، ولكلٍّ منهما
/// نسختان فاتحة وداكنة — أي أربع ثيمات. القيم مستمدّة من دليل تصميم تألق.
abstract final class AppColors {
  // ── الكلاسيكية: ذهبي «تألق» + حبري + لؤلؤي ──
  static const Color gold = Color(0xFFC4A032); // الإبراز الرئيسي
  static const Color goldDark = Color(0xFFA8851C);
  static const Color ink = Color(0xFF16181E); // شبه أسود دافئ
  static const Color pearl = Color(0xFFFAF9F6); // خلفية فاتحة دافئة
  static const Color pearlCard = Color(0xFFFFFFFF);

  // ── الوردية ──
  static const Color rose = Color(0xFFE84A8A); // إبراز وردي
  static const Color roseDark = Color(0xFFC63A72);
  static const Color roseTintLight = Color(0xFFFFF5F8); // خلفية فاتحة وردية
  static const Color roseCardLight = Color(0xFFFFFFFF);
  static const Color roseInkDark = Color(0xFF1E1418); // خلفية داكنة بميل وردي

  // ── محايدات داكنة مشتركة ──
  static const Color darkSurface = Color(0xFF1F222A);
  static const Color darkBackground = Color(0xFF16181E);

  // ── دلالية ──
  static const Color success = Color(0xFF1E9E63);
  static const Color warning = Color(0xFFD68B12);
  static const Color danger = Color(0xFFDC4C4C);
}
