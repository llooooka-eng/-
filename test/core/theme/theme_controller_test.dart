import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:talluq/core/providers/shared_preferences_provider.dart';
import 'package:talluq/core/theme/app_theme.dart';
import 'package:talluq/core/theme/theme_controller.dart';

Future<ProviderContainer> _makeContainer([Map<String, Object> seed = const {}]) async {
  SharedPreferences.setMockInitialValues(seed);
  final prefs = await SharedPreferences.getInstance();
  final container = ProviderContainer(
    overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
  );
  addTearDown(container.dispose);
  return container;
}

void main() {
  test('الافتراضي: كلاسيكي + يتبع النظام', () async {
    final container = await _makeContainer();
    final state = container.read(themeControllerProvider);
    expect(state.flavor, AppFlavor.classic);
    expect(state.mode, ThemeMode.system);
  });

  test('setFlavor يحدّث الحالة ويحفظها محليًا', () async {
    final container = await _makeContainer();
    await container.read(themeControllerProvider.notifier).setFlavor(AppFlavor.pink);

    expect(container.read(themeControllerProvider).flavor, AppFlavor.pink);
    final prefs = container.read(sharedPreferencesProvider);
    expect(prefs.getString('theme_flavor'), 'pink');
  });

  test('setMode يحدّث الحالة ويحفظها محليًا', () async {
    final container = await _makeContainer();
    await container.read(themeControllerProvider.notifier).setMode(ThemeMode.dark);

    expect(container.read(themeControllerProvider).mode, ThemeMode.dark);
    expect(container.read(sharedPreferencesProvider).getString('theme_mode'), 'dark');
  });

  test('يستعيد الاختيار المحفوظ عند الإقلاع', () async {
    final container = await _makeContainer({
      'theme_flavor': 'pink',
      'theme_mode': 'dark',
    });
    final state = container.read(themeControllerProvider);
    expect(state.flavor, AppFlavor.pink);
    expect(state.mode, ThemeMode.dark);
  });
}
