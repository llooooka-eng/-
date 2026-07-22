import 'package:flutter/material.dart';
import 'package:talluq/l10n/app_localizations.dart';

import '../widgets/sparkle.dart';

/// شاشة الافتتاح (Splash) — تعرض هوية «تألق»: النجمة، الاسم، والوصف.
///
/// بسيطة في هذه المرحلة (بلا منطق تنقّل بعد)؛ سيُضاف التوجيه لاحقًا حسب حالة
/// الجلسة والإعداد الأولي.
class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final theme = Theme.of(context);
    final accent = theme.colorScheme.primary;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Sparkle(size: 44, color: accent),
                const SizedBox(height: 20),
                Text(
                  l10n.appName,
                  style: theme.textTheme.displaySmall?.copyWith(
                    color: theme.colorScheme.onSurface,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  l10n.appTagline,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 40),
                SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(strokeWidth: 2.4, color: accent),
                ),
                const SizedBox(height: 12),
                Text(
                  l10n.splashLoading,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
