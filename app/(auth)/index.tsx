/**
 * شاشة الترحيب/الافتتاح — خلفية حبرية + ميدالية اللوقو + وصف الخدمات → ابدأ الآن.
 */
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Button } from "@/components/ui";
import { BrandLockup } from "@/components/Logo";
import { colors, fontSize, radius, spacing } from "@/constants/theme";

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "cut-outline", label: "رجال" },
  { icon: "flower-outline", label: "نساء" },
  { icon: "happy-outline", label: "أطفال" },
  { icon: "home-outline", label: "خدمة منزلية" },
];

export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <BrandLockup size={110} light />
        <AppText style={styles.tagline}>
          احجز موعدك في أفخم الصالونات — بلمسة تألق
        </AppText>
      </View>

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

const styles = StyleSheet.create({
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
