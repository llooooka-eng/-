import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/shared_preferences_provider.dart';

/// اللغات المدعومة في التطبيق.
abstract final class AppLocales {
  static const Locale arabic = Locale('ar');
  static const Locale english = Locale('en');

  static const List<Locale> supported = [arabic, english];
}

/// يدير لغة التطبيق ويحفظها محليًا.
///
/// تغيير اللغة يُحدّث [MaterialApp.locale] مباشرةً فيتبدّل الاتجاه (RTL/LTR)
/// والنصوص فورًا **دون إعادة تشغيل التطبيق**.
class LocaleController extends Notifier<Locale> {
  static const _key = 'app_locale';

  @override
  Locale build() {
    final code = ref.read(sharedPreferencesProvider).getString(_key);
    return AppLocales.supported.firstWhere(
      (l) => l.languageCode == code,
      orElse: () => AppLocales.arabic, // العربية هي الافتراضية
    );
  }

  Future<void> setLocale(Locale locale) async {
    if (locale == state) return;
    state = locale;
    await ref
        .read(sharedPreferencesProvider)
        .setString(_key, locale.languageCode);
  }

  /// تبديل سريع بين العربية والإنجليزية.
  Future<void> toggle() => setLocale(
        state.languageCode == 'ar' ? AppLocales.english : AppLocales.arabic,
      );
}

final localeControllerProvider =
    NotifierProvider<LocaleController, Locale>(LocaleController.new);
