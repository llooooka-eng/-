import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/splash/presentation/pages/splash_page.dart';
import 'app_routes.dart';

/// مزوّد التنقّل الوحيد (GoRouter).
///
/// في هذه المرحلة يُسجَّل مسار Splash فقط؛ ستُضاف المسارات الأخرى تدريجيًا
/// مع كل Feature جديدة.
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.splashPath,
    routes: [
      GoRoute(
        path: AppRoutes.splashPath,
        name: AppRoutes.splashName,
        builder: (context, state) => const SplashPage(),
      ),
    ],
  );
});
