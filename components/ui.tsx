/**
 * مكوّنات واجهة أساسية مشتركة، مبنية على نظام تصميم تألق.
 * تقرأ اللوحة النشطة (فاتح/داكن) عبر useTheme()/useThemedStyles.
 */
import type { PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fontFamily, fontSize, radius, spacing, type AppColors } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";

/** حاوية شاشة بخلفية لؤلؤية وحواف آمنة */
export function Screen({
  children,
  style,
  edges = ["top"],
}: PropsWithChildren<{ style?: ViewStyle; edges?: ("top" | "bottom" | "left" | "right")[] }>) {
  const styles = useThemedStyles(makeStyles);
  return (
    <SafeAreaView style={[styles.screen, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

/** نص افتراضي بخط IBM Plex Sans Arabic */
export function AppText({ style, weight = "regular", ...rest }: TextProps & { weight?: keyof typeof fontFamily }) {
  const { colors } = useTheme();
  return <Text {...rest} style={[{ fontFamily: fontFamily[weight], color: colors.textPrimary }, style]} />;
}

/** بطاقة بيضاء بحواف ناعمة */
export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Divider() {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.divider} />;
}

/** شريحة (Chip) للفلاتر والتصنيفات */
export function Chip({
  label,
  active = false,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const fg = active ? "#FFFFFF" : colors.textSecondary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipIdle,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={fg} /> : null}
      <Text style={[styles.chipText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

type ButtonVariant = "primary" | "dark" | "outline";

/** زر بثلاثة أنماط: ذهبي (primary) / حبري (dark) / محدّد (outline) */
export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isDisabled = disabled || loading;
  const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.gold, fg: "#1A150A", border: colors.gold },
    dark: { bg: colors.ink, fg: "#FFFFFF", border: colors.ink },
    outline: { bg: "transparent", fg: colors.textPrimary, border: colors.border },
  };
  const c = palette[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: c.bg, borderColor: c.border, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <View style={styles.buttonInner}>
          {icon ? <Ionicons name={icon} size={18} color={c.fg} /> : null}
          <Text style={[styles.buttonText, { color: c.fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** دائرة أيقونة ملوّنة */
export function IconBadge({
  name,
  bg,
  color,
  size = 38,
}: {
  name: keyof typeof Ionicons.glyphMap;
  bg: string;
  color: string;
  size?: number;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.iconBadge, { width: size, height: size, backgroundColor: bg }]}>
      <Ionicons name={name} size={Math.round(size * 0.5)} color={color} />
    </View>
  );
}

/** شريط علوي بسيط مع زر رجوع (RTL: السهم يشير لليمين) */
export function Header({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={10} style={styles.headerSide}>
          <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <View style={styles.headerSide} />
      )}
      <AppText weight="semibold" style={styles.headerTitle} numberOfLines={1}>
        {title}
      </AppText>
      <View style={styles.headerSide}>{right}</View>
    </View>
  );
}

/** تقييم نجمي ذهبي */
export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row-reverse", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(value) ? "star" : "star-outline"}
          size={size}
          color={colors.gold}
        />
      ))}
    </View>
  );
}

/** حالة فارغة عامة */
export function EmptyState({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={40} color={colors.textMuted} />
      <AppText style={{ color: colors.textSecondary, marginTop: spacing.sm }}>{title}</AppText>
    </View>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.pearl },
    card: {
      backgroundColor: colors.white,
      borderRadius: radius.lg,
      borderWidth: 0.5,
      borderColor: colors.border,
      padding: spacing.lg,
    },
    divider: { height: 0.5, backgroundColor: colors.borderSoft, marginVertical: spacing.md },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      height: 36,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      borderWidth: 0.5,
    },
    chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
    chipIdle: { backgroundColor: colors.white, borderColor: colors.border },
    chipText: { fontFamily: fontFamily.medium, fontSize: fontSize.md },
    button: {
      borderRadius: radius.md,
      borderWidth: 1,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonInner: { flexDirection: "row", alignItems: "center", gap: 8 },
    buttonText: { fontFamily: fontFamily.semibold, fontSize: fontSize.lg },
    iconBadge: { borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerSide: { minWidth: 40, alignItems: "flex-start", justifyContent: "center" },
    headerTitle: { fontSize: fontSize.lg, flex: 1, textAlign: "center" },
    empty: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxl * 2 },
  });
