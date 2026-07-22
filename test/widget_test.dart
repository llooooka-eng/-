import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:talluq/app.dart';
import 'package:talluq/core/providers/shared_preferences_provider.dart';

void main() {
  testWidgets('يُقلع التطبيق ويعرض هوية تألق على شاشة الافتتاح', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
        child: const TalluqApp(),
      ),
    );
    await tester.pump(const Duration(milliseconds: 50));

    // اللغة الافتراضية عربية → يظهر الاسم والوصف بالعربية.
    expect(find.text('تألق'), findsOneWidget);
    expect(
      find.text('حجز مواعيد الحلاقة والتجميل للرجال والنساء والأطفال'),
      findsOneWidget,
    );
  });
}
