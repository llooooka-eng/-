import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// يُوفّر نسخة [SharedPreferences] لبقيّة التطبيق.
///
/// يُهيَّأ بشكل غير متزامن مرّة واحدة في مرحلة الإقلاع، ثم يُحقن هنا عبر
/// `overrideWithValue` في [ProviderScope]. الرمي الافتراضي يضمن أن نسيان
/// الحقن يظهر كخطأ واضح مبكّر بدل سلوك صامت.
final sharedPreferencesProvider = Provider<SharedPreferences>(
  (ref) => throw UnimplementedError(
    'sharedPreferencesProvider must be overridden in bootstrap()',
  ),
);
