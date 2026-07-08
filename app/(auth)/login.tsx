/**
 * تسجيل الدخول برقم الجوال السعودي.
 */
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { AppText, Button, Header } from "@/components/ui";
import { Medallion } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { fontFamily, fontSize, radius, spacing, type AppColors } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";
import { Screen } from "@/components/ui";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [phone, setPhone] = useState("");

  const digits = phone.replace(/\D/g, "");
  const valid = digits.length === 9 && digits.startsWith("5");

  const onContinue = () => {
    if (!valid) return;
    signIn(`+966${digits}`);
    router.push("/(auth)/otp");
  };

  return (
    <Screen>
      <Header title="تسجيل الدخول" onBack={() => router.back()} />
      <View style={styles.body}>
        <View style={styles.hero}>
          <Medallion size={72} />
          <AppText weight="semibold" style={styles.title}>
            أدخل رقم جوالك
          </AppText>
          <AppText style={styles.sub}>سنرسل لك رمز تحقق من أربعة أرقام</AppText>
        </View>

        <View style={styles.field}>
          <AppText style={styles.prefix}>+966</AppText>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="5X XXX XXXX"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={11}
            style={styles.input}
            textAlign="right"
          />
        </View>

        <Button title="متابعة" onPress={onContinue} disabled={!valid} icon="arrow-back" />
      </View>
    </Screen>
  );
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.xl },
  hero: { alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  title: { fontSize: fontSize.xl, marginTop: spacing.sm },
  sub: { color: colors.textSecondary, fontSize: fontSize.base, textAlign: "center" },
  field: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 52,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  prefix: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    letterSpacing: 2,
  },
});
