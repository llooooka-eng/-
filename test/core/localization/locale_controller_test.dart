import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:talluq/core/localization/locale_controller.dart';
import 'package:talluq/core/providers/shared_preferences_provider.dart';

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
  test('الافتراضي: العربية', () async {
    final container = await _makeContainer();
    expect(container.read(localeControllerProvider).languageCode, 'ar');
  });

  test('toggle يبدّل إلى الإنجليزية ويحفظها', () async {
    final container = await _makeContainer();
    await container.read(localeControllerProvider.notifier).toggle();

    expect(container.read(localeControllerProvider).languageCode, 'en');
    expect(container.read(sharedPreferencesProvider).getString('app_locale'), 'en');
  });

  test('يستعيد اللغة المحفوظة عند الإقلاع', () async {
    final container = await _makeContainer({'app_locale': 'en'});
    expect(container.read(localeControllerProvider).languageCode, 'en');
  });
}
