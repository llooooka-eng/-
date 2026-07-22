# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is the design and source-of-record for **تألق / Talluq** (npm package `taalaq`) — an Arabic-first (RTL) mobile app for booking barber/salon appointments (men, women, kids, and at-home service) in Saudi Arabia.

The repo currently contains two artifacts rather than a live checked-out app:

- **`Talluq-Design.md`** — the complete design system specification (color/typography/spacing tokens, motion, components, screen flow, persistence model, sample data). This is the authoritative reference for any UI work.
- **`files.zip`** — the actual React Native / Expo source files (services, hooks, contexts, screens, UI kit, theme). There is **no extracted source tree or root `package.json`** in the repo yet; the app code lives inside this archive.

Before writing or reviewing app code, unzip `files.zip` (e.g. `unzip -o files.zip -d src-preview/`) to read the real implementation. When scaffolding the app for real, the `@/…` import alias used throughout the code maps to the project source root.

> Note on naming: the design doc romanizes the name as **Talluq** ("to shine/تألق"), while the package is `taalaq` and a few file header comments say "تأنق". These refer to the same product — don't treat them as separate apps.

## Tech stack

Expo SDK 57 · Expo Router 57 (file-based routing) · React 19.2 · React Native 0.86 · TypeScript · Supabase (`@supabase/supabase-js`) · Moyasar payments (`react-native-moyasar-sdk`) · IBM Plex Sans Arabic fonts (`@expo-google-fonts`).

## Commands

These come from the packaged `package.json` and run from the project root **once the app source is extracted/scaffolded** (install deps first with `npm install`):

```bash
npm run start      # expo start — dev server / Metro bundler
npm run android    # expo run:android — native Android build
npm run ios        # expo run:ios — native iOS build
npm run lint       # expo lint
```

There is no test runner configured in the packaged manifest. Apple Pay and the Moyasar native SDK require a **development build** — they do not work in Expo Go.

## Architecture — the important invariants

### Money is server-authoritative; the client never computes or writes amounts

This is the single most important rule in the codebase. Study it before touching payments, refunds, or the wallet:

- **All monetary values are integers in halalas** (1 SAR = 100 halalas). Only `formatSAR` / `formatSignedAmount` in `lib/format.ts` turn them into displayable ريال strings. Never do ad-hoc arithmetic on amounts in components.
- **Payment amount is created server-side.** `bookingService.createPaymentIntent` calls the `create-payment` Edge Function, which computes the amount from the booking row and returns a `PaymentIntent` (amount, currency, publishable key, metadata). The client passes only `booking_id` + `payment_type` (`full` | `deposit`) — it never sends an amount. `MoyasarPaymentSheet` feeds those intent values straight into Moyasar's `PaymentConfig`.
- **The wallet is read-only from the client.** `walletService` only reads balance/transactions and subscribes to Realtime updates. Credits/debits are posted exclusively by the server-side `process_cancellation` DB function. RLS scopes every wallet/booking query to the owner.
- **Refunds go through the server too.** `previewRefund` calls the `evaluate_refund` RPC (policy + time-based percentage) so the user sees what they'll get back before confirming; `cancelBooking` calls the `refund-payment` Edge Function, which does the wallet credit and/or Moyasar bank reversal.
- **Two lines of defense after checkout.** Webhooks confirm payment authoritatively but can lag, so `pollPaymentStatus` polls `payment_transactions.status` until `paid`/`failed` (or timeout) once the user returns from the Moyasar sheet.

### Supabase backend contract

App code depends on this backend shape existing:

- **Edge Functions:** `create-payment`, `refund-payment` — invoked via `supabase.functions.invoke`.
- **RPCs / DB functions:** `evaluate_refund`, `process_cancellation`.
- **Tables:** `bookings`, `wallets`, `wallet_transactions`, `payment_transactions` (+ RLS restricting rows to the authenticated owner).
- **Realtime:** replication must be enabled on `bookings` and `wallets` for `subscribeToBookingStatus` / `subscribeToWallet` to fire.

`AuthContext` wraps the app, holds the Supabase session, and reacts to `onAuthStateChange`. Types shared across services live in `@/types/database`.

### App shell & routing

- Expo Router with file-based routes. Root `_layout.tsx` **forces RTL** (`I18nManager.forceRTL(true)` — requires one app restart to fully apply on first launch), blocks render until IBM Plex Sans Arabic fonts load, then wraps everything in `SafeAreaProvider` → `AuthProvider`.
- Tab bar (`(tabs)/_layout.tsx`): الرئيسية / حجوزاتي / المحفظة / حسابي.
- The confirm/pay screen (`booking/confirm.tsx`) is a state machine over phases `summary → paying → processing → done | failed`.

### Design system usage

- Do **not** hardcode colors, spacing, radii, or font sizes. Import tokens from `constants/theme.ts` (`colors`, `spacing`, `radius`, `fontFamily`, `fontSize`).
- Use the shared primitives in `components/ui.tsx` (`Screen`, `AppText`, `Card`, `Button`, `IconBadge`, `EmptyState`, `Divider`) rather than raw `Text`/`View`. `AppText` applies the correct Arabic font; `Button` has three variants: `primary` (gold), `dark` (ink), `outline`.
- Typography/RTL rule from the spec: **never apply `letter-spacing`/tracking to Arabic text** — it breaks glyph joining. Tracking tokens are for Latin/numerals only.
- The gold accent is used sparingly (ratings, selection, highlights, the logo medallion) — not for large fills. Note `Talluq-Design.md` documents a fuller token set (Pearl/Ink/Gold scales, dark theme, semantic names) than the condensed runtime `theme.ts`; treat the design doc as the intended target and `theme.ts` as the current implementation.

### Dates & locale

Format dates with the helpers in `lib/format.ts`, which use `Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", …)` — **Gregorian calendar with Latin numerals**, Arabic month names. `formatRelative` gives اليوم/أمس/قبل n أيام.
