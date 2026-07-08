/**
 * نظام التصميم لتطبيق تألق — الهوية الذهبية/الحبرية/اللؤلؤية.
 * مستمدّ من دليل التصميم (docs/DESIGN.md). يدعم ثيمين: فاتح وداكن.
 *
 * ثابت: نفس مفاتيح الألوان في الثيمين (token-swap)، فتقرأ المكوّنات اللوحة
 * النشطة عبر useTheme()/useThemedStyles دون تغيير أسماء الألوان.
 */

export interface AppColors {
  gold: string;
  goldDark: string;
  goldSoft: string;
  ink: string;
  inkSoft: string;
  pearl: string;
  pearlSoft: string;
  white: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSoft: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  info: string;
  infoBg: string;
}

/** الثيم الفاتح (الافتراضي) */
export const lightColors: AppColors = {
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
};

/**
 * الثيم الداكن — الأسطح تصير حبرية، النص لؤلؤي، والذهبي يضيء قليلاً (§2).
 * `white` هنا لون البطاقة الداكنة؛ للنص الأبيض الصريح استخدم "#FFFFFF" مباشرة.
 * `ink` سطح داكن مرتفع (بطاقة الرصيد/الأيقونات) ويصلح كنص داكن فوق الذهبي.
 */
export const darkColors: AppColors = {
  gold: "#D8BB57",
  goldDark: "#D8BB57",
  goldSoft: "#E8D9B5",
  ink: "#20242D",
  inkSoft: "#2A2F3A",
  pearl: "#101216",
  pearlSoft: "#16181E",
  white: "#1F222A",
  textPrimary: "#EDEAE2",
  textSecondary: "#A0A6B2",
  textMuted: "#767D8D",
  border: "#2B2F3A",
  borderSoft: "#24272F",
  success: "#3DBB80",
  successBg: "#15271E",
  warning: "#E0A63C",
  warningBg: "#2A2010",
  danger: "#E06A6A",
  dangerBg: "#2A1616",
  info: "#4E93DC",
  infoBg: "#12233A",
};

/** اللوحة الافتراضية (فاتح) — للسياقات الثابتة والتوافق الخلفي */
export const colors = lightColors;

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
