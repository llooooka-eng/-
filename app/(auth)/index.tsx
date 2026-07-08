/**
 * شاشة الترحيب/الافتتاح — خلفية حبرية + ميدالية اللوقو + وصف الخدمات → ابدأ الآن.
 */
import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Button } from "@/components/ui";
import { BrandLockup } from "@/components/Logo";
import { fontSize, radius, spacing, type AppColors } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "cut-outline", label: "رجال" },
  { icon: "flower-outline", label: "نساء" },
  { icon: "happy-outline", label: "أطفال" },
  { icon: "home-outline", label: "خدمة منزلية" },
];

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const intro = useRef(new Animated.Value(0)).current;

  // حركة الافتتاح: ظهور تدريجي مع طفو وتكبير خفيف للميدالية (§6)
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!active) return;
      if (reduce) {
        intro.setValue(1);
        return;
      }
      Animated.timing(intro, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    return () => {
      active = false;
    };
  }, [intro]);

  const heroStyle = {
    opacity: intro,
    transform: [
      { translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
      { scale: intro.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
    ],
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.top, heroStyle]}>
        <BrandLockup size={110} light />
        <AppText style={styles.tagline}>
          احجز موعدك في أفخم الصالونات — بلمسة تألق
        </AppText>
      </Animated.View>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.label} style={styles.feature}>
            <View style={styles.featureIcon}>
              <Ionicons name={f.icon} size={22} color={colors.gold} />
            </View>
            <AppText style={styles.featureLabel}>{f.label}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.bottom}>
        <Button title="ابدأ الآن" variant="primary" onPress={() => router.push("/(auth)/login")} />
        <AppText style={styles.terms}>
          بالمتابعة أنت توافق على الشروط وسياسة الخصوصية
        </AppText>
      </View>
    </View>
  );
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.xl,
    paddingTop: 96,
    paddingBottom: 48,
    justifyContent: "space-between",
  },
  top: { alignItems: "center", gap: spacing.lg },
  tagline: {
    color: colors.goldSoft,
    fontSize: fontSize.lg,
    textAlign: "center",
    lineHeight: 26,
    marginTop: spacing.sm,
  },
  features: { flexDirection: "row-reverse", justifyContent: "space-between", flexWrap: "wrap", gap: spacing.md },
  feature: { alignItems: "center", gap: spacing.sm, width: "22%" },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.inkSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#3C4150",
  },
  featureLabel: { color: colors.pearl, fontSize: fontSize.sm },
  bottom: { gap: spacing.md },
  terms: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: "center" },
});
