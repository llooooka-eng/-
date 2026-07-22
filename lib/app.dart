import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/localization/locale_controller.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_controller.dart';
import 'l10n/app_localizations.dart';

/// جذر التطبيق. يربط التنقّل (GoRouter)، الثيمات الأربعة، واللغة الحيّة.
///
/// كل من الثيم واللغة يأتيان من Riverpod، فيتبدّلان فورًا دون إعادة تشغيل.
class TalluqApp extends ConsumerWidget {
  const TalluqApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final themeState = ref.watch(themeControllerProvider);
    final locale = ref.watch(localeControllerProvider);

    return MaterialApp.router(
      onGenerateTitle: (context) => AppLocalizations.of(context).appName,
      debugShowCheckedModeBanner: false,
      routerConfig: router,

      // الثيمات الأربعة: التشكيلة تحدّد اللونين الفاتح والداكن، والوضع يختار بينهما.
      theme: AppTheme.light(themeState.flavor),
      darkTheme: AppTheme.dark(themeState.flavor),
      themeMode: themeState.mode,

      // التوطين: العربية (RTL) والإنجليزية (LTR). الاتجاه يُضبط تلقائيًا حسب اللغة.
      locale: locale,
      supportedLocales: AppLocales.supported,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }
}
