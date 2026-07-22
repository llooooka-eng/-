import 'package:flutter_dotenv/flutter_dotenv.dart';

/// نقطة الوصول الوحيدة لمتغيّرات البيئة.
///
/// القيم تُحمَّل من ملف `.env` عبر [dotenv] في مرحلة الإقلاع (bootstrap)،
/// ثم تُقرأ من هنا فقط — لا يقرأ باقي الكود `dotenv` مباشرةً.
abstract final class AppConfig {
  static String get supabaseUrl => dotenv.maybeGet('SUPABASE_URL')?.trim() ?? '';

  static String get supabaseAnonKey =>
      dotenv.maybeGet('SUPABASE_ANON_KEY')?.trim() ?? '';

  /// هل أُعدّت بيانات Supabase؟ نتخطّى تهيئته عند غيابها حتى يبقى التطبيق
  /// قابلاً للتشغيل أثناء التطوير المبكّر (مثلاً شاشة Splash وحدها).
  static bool get hasSupabase =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
}
