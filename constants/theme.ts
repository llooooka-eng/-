/**
 * نظام التصميم لتطبيق تألق — الهوية الذهبية/الحبرية/اللؤلؤية.
 * تُستخدم هذه القيم في كل المكوّنات لضمان اتساق الواجهة.
 * مستمدّة من دليل التصميم (docs/DESIGN.md).
 */

export const colors = {
  gold: "#C6A15B",
  goldDark: "#A8863F",
  goldSoft: "#E8D9B5",
  ink: "#191A1C",
  inkSoft: "#2A2B2D",
  pearl: "#F5F1E8",
  pearlSoft: "#FBF8F1",
  white: "#FFFFFF",
  textPrimary: "#26251F",
  textSecondary: "#8B8577",
  textMuted: "#9B9382",
  border: "#EAE3D6",
  borderSoft: "#EFE9DC",
  success: "#2E7D5B",
  successBg: "#E4F0EA",
  warning: "#B5730A",
  warningBg: "#FBEFD6",
  danger: "#C0392B",
  dangerBg: "#F7E9E7",
  info: "#2F7BD1",
  infoBg: "#E1EDFA",
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;

/** أسماء خطوط IBM Plex Sans Arabic كما يحمّلها @expo-google-fonts */
export const fontFamily = {
  regular: "IBMPlexSansArabic_400Regular",
  medium: "IBMPlexSansArabic_500Medium",
  semibold: "IBMPlexSansArabic_600SemiBold",
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 16,
  xl: 19,
  xxl: 24,
  display: 32,
} as const;

export const theme = { colors, spacing, radius, fontFamily, fontSize };
export type Theme = typeof theme;
