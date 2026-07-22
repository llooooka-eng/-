import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// نقطة الوصول الموحّدة لعميل Supabase عبر طبقات البيانات.
///
/// تُهيَّأ حزمة Supabase مرّة واحدة في مرحلة الإقلاع (bootstrap)؛ هذا المزوّد
/// يكشف العميل الجاهز فقط. استخدمه داخل مستودعات (Repositories) طبقة البيانات،
/// ولا تستدعِ `Supabase.instance` مباشرةً في باقي الكود.
final supabaseClientProvider = Provider<SupabaseClient>(
  (ref) => Supabase.instance.client,
);
