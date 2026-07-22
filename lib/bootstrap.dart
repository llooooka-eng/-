import 'package:flutter/widgets.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app.dart';
import 'core/config/app_config.dart';
import 'core/providers/shared_preferences_provider.dart';

/// تهيئة التطبيق قبل الإقلاع:
/// 1) تحميل متغيّرات البيئة (.env).
/// 2) تهيئة Supabase (إن وُجدت بياناته).
/// 3) تجهيز التخزين المحلي وحقنه في Riverpod.
///
/// فصلها عن [main] يجعل الإقلاع قابلاً للاختبار وإعادة الاستخدام.
Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();

  // .env اختياري أثناء التطوير المبكّر — لا نُوقف الإقلاع عند غيابه.
  await dotenv.load(fileName: '.env', isOptional: true);

  if (AppConfig.hasSupabase) {
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      // مفتاح anon هو نفسه المفتاح العمومي (publishable) في مصطلحات Supabase الحديثة.
      publishableKey: AppConfig.supabaseAnonKey,
    );
  }

  final prefs = await SharedPreferences.getInstance();

  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
      child: const TalluqApp(),
    ),
  );
}
