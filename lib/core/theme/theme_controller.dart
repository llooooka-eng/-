import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/shared_preferences_provider.dart';
import 'app_theme.dart';

/// حالة الثيم: التشكيلة (كلاسيكي/وردي) + الوضع (فاتح/داكن/يتبع النظام).
@immutable
class ThemeState {
  const ThemeState({required this.flavor, required this.mode});

  final AppFlavor flavor;
  final ThemeMode mode;

  ThemeState copyWith({AppFlavor? flavor, ThemeMode? mode}) =>
      ThemeState(flavor: flavor ?? this.flavor, mode: mode ?? this.mode);

  @override
  bool operator ==(Object other) =>
      other is ThemeState && other.flavor == flavor && other.mode == mode;

  @override
  int get hashCode => Object.hash(flavor, mode);
}

/// يدير اختيار الثيم ويحفظه محليًا، فيثبت بين الجلسات.
///
/// تغيير أي قيمة يعيد بناء [MaterialApp] فورًا دون إعادة تشغيل التطبيق.
class ThemeController extends Notifier<ThemeState> {
  static const _flavorKey = 'theme_flavor';
  static const _modeKey = 'theme_mode';

  @override
  ThemeState build() {
    final prefs = ref.read(sharedPreferencesProvider);
    final flavor = AppFlavor.values.byNameOrNull(prefs.getString(_flavorKey)) ??
        AppFlavor.classic;
    final mode = ThemeMode.values.byNameOrNull(prefs.getString(_modeKey)) ??
        ThemeMode.system;
    return ThemeState(flavor: flavor, mode: mode);
  }

  Future<void> setFlavor(AppFlavor flavor) async {
    if (flavor == state.flavor) return;
    state = state.copyWith(flavor: flavor);
    await ref.read(sharedPreferencesProvider).setString(_flavorKey, flavor.name);
  }

  Future<void> setMode(ThemeMode mode) async {
    if (mode == state.mode) return;
    state = state.copyWith(mode: mode);
    await ref.read(sharedPreferencesProvider).setString(_modeKey, mode.name);
  }
}

final themeControllerProvider =
    NotifierProvider<ThemeController, ThemeState>(ThemeController.new);

/// بحث آمن عن قيمة enum بالاسم يُعيد null بدل الرمي عند عدم التطابق.
extension _EnumByNameOrNull<T extends Enum> on Iterable<T> {
  T? byNameOrNull(String? name) {
    if (name == null) return null;
    for (final value in this) {
      if (value.name == name) return value;
    }
    return null;
  }
}
