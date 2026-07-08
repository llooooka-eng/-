/**
 * التحقق من رمز OTP (أربع خانات). في وضع العرض أي رمز من 4 أرقام يُقبل.
 */
import { useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { AppText, Button, Header, Screen } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { fontFamily, fontSize, radius, spacing, type AppColors } from "@/constants/theme";
import { useThemedStyles } from "@/context/ThemeContext";

export default function OtpScreen() {
  const { phone, verifyOtp } = useAuth();
  const styles = useThemedStyles(makeStyles);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const onVerify = () => {
    if (verifyOtp(code)) {
      router.replace("/(tabs)");
    } else {
      setError(true);
    }
  };

  return (
    <Screen>
      <Header title="التحقق" onBack={() => router.back()} />
      <View style={styles.body}>
        <AppText weight="semibold" style={styles.title}>
          أدخل رمز التحقق
        </AppText>
        <AppText style={styles.sub}>
          أُرسل الرمز إلى {phone ?? "رقمك"} (استخدم أي 4 أرقام في وضع العرض)
        </AppText>

        <Pressable style={styles.boxesRow} onPress={() => inputRef.current?.focus()}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.box, code.length === i && styles.boxActive, error && styles.boxError]}>
              <AppText weight="semibold" style={styles.boxText}>
                {code[i] ?? ""}
              </AppText>
            </View>
          ))}
        </Pressable>

        {/* حقل مخفي يلتقط الإدخال */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(t) => {
            setError(false);
            setCode(t.replace(/\D/g, "").slice(0, 4));
          }}
          keyboardType="number-pad"
          maxLength={4}
          autoFocus
          style={styles.hiddenInput}
        />

        {error ? <AppText style={styles.errorText}>رمز غير صحيح، حاول مجدداً</AppText> : null}

        <Button title="تأكيد" onPress={onVerify} disabled={code.length !== 4} />
        <Pressable onPress={() => setCode("")} style={{ alignSelf: "center" }}>
          <AppText style={styles.resend}>إعادة إرسال الرمز</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.lg },
  title: { fontSize: fontSize.xl, textAlign: "center" },
  sub: { color: colors.textSecondary, fontSize: fontSize.base, textAlign: "center", lineHeight: 22 },
  boxesRow: { flexDirection: "row-reverse", justifyContent: "center", gap: spacing.md, marginVertical: spacing.md },
  box: {
    width: 60,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  boxActive: { borderColor: colors.gold, borderWidth: 2 },
  boxError: { borderColor: colors.danger },
  boxText: { fontSize: fontSize.xxl, color: colors.textPrimary },
  hiddenInput: { position: "absolute", opacity: 0, height: 1, width: 1 },
  errorText: { color: colors.danger, fontSize: fontSize.sm, textAlign: "center" },
  resend: { color: colors.goldDark, fontSize: fontSize.base, marginTop: spacing.sm },
});
