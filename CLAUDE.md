# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

**تألق / Talluq** — a Flutter mobile app for booking barber/salon, beauty, and massage/spa appointments (men, women, kids, and at-home service) for the Saudi market. Long-term SaaS project targeting App Store and Google Play.

Two supporting artifacts predate the Flutter app: `Talluq-Design.md` (the design-system spec — color/typography/spacing tokens, the authoritative visual reference) and `files.zip` (an **obsolete React Native/Expo prototype** — superseded by this Flutter app; do not build on it).

## Environment

Flutter is not preinstalled in fresh sessions. The SDK used is **Flutter 3.44.7 / Dart 3.12.2**, installed at `/opt/flutter` (add `/opt/flutter/bin` to `PATH`; `~/.bashrc` and `~/.profile` already export it). Commands run as root, so Flutter prints a harmless "running as root" warning — ignore it.

## Commands

```bash
flutter pub get      # fetch deps; also regenerates l10n (pubspec has generate: true)
flutter gen-l10n     # regenerate localization after editing lib/l10n/*.arb
flutter analyze      # static analysis — must stay at "No issues found!"
flutter test         # run all tests
flutter test test/core/theme/theme_controller_test.dart   # run a single test file
flutter run          # launch the app (needs a device/emulator)
```

## Architecture — the rules

Full details in `docs/ARCHITECTURE.md`. The essentials:

- **Clean Architecture + Feature-First.** Each feature lives under `lib/features/<feature>/` and splits into `domain` (entities, repository contracts, use cases) / `data` (repository impls, Supabase data sources, models) / `presentation` (pages, widgets, Riverpod view models). Dependencies point inward: Presentation → Domain ← Data. The splash feature currently has only a `presentation/` layer because it has no data/domain yet — add layers when a feature needs them, don't create empty ones.
- **State: Riverpod only.** No other state-management library.
- **Navigation: GoRouter only**, exposed via `routerProvider` (`lib/core/router/`). Route paths/names are centralized in `app_routes.dart`.
- **Backend: Supabase/PostgreSQL with Row Level Security.** Access `SupabaseClient` only through `supabaseClientProvider` from repositories — never call `Supabase.instance` elsewhere.
- **MVVM:** presentation holds no business logic; state lives in Notifier/AsyncNotifier view models.

### App startup flow

`main.dart` → `bootstrap()` (`lib/bootstrap.dart`): loads `.env` (optional), initializes Supabase **only if** `SUPABASE_URL` + `SUPABASE_ANON_KEY` are set (so the app runs during early dev without them), creates `SharedPreferences`, then `runApp` inside a `ProviderScope` that **overrides `sharedPreferencesProvider`** with the ready instance. `lib/app.dart` (`TalluqApp`) wires `MaterialApp.router` to theme + locale + router providers.

### Themes — four of them

`AppFlavor{classic, pink}` × `ThemeMode{light, dark}` = Light / Dark / Pink Light / Pink Dark. `themeControllerProvider` holds flavor + mode and persists both to `SharedPreferences`; changing either rebuilds `MaterialApp` instantly. `AppTheme` (`lib/core/theme/`) builds Material 3 `ThemeData` via `ColorScheme.fromSeed` with surfaces tuned to Talluq's identity (pearl/gold classic, rose pink). Color tokens are in `app_colors.dart` — never hardcode colors.

### Localization — Arabic (RTL) + English (LTR), no restart

`localeControllerProvider` holds the current `Locale` and persists it; changing it flips direction and strings **without restarting the app**. Arabic is the default. Strings live in `lib/l10n/app_ar.arb` + `app_en.arb` — add keys to **both**, then `flutter gen-l10n`. The generated `AppLocalizations` (`lib/l10n/app_localizations*.dart`) is git-ignored and regenerated on `pub get`. Typography rule from the design spec: **never apply `letterSpacing` to Arabic text** — it breaks glyph joining (`app_typography.dart` zeroes it).

### Environment & secrets

`.env` values are read **only** through `AppConfig` (`lib/core/config/app_config.dart`) — nothing else touches `dotenv`. `.env` is committed with empty placeholders (it's a required asset); fill the Supabase URL and the **publishable/anon** key locally. Never put the `service_role` key in the client `.env`; the real protection is RLS.

## Working style for this project

The user runs this in **explicit phases** — do not build ahead. Before a phase: explain what will be built and list the files; after: verify `flutter analyze` is clean and `flutter test` passes before declaring it done. Don't add a library unless necessary, don't create unused files, don't duplicate code. Any new feature ships with basic tests where appropriate.
