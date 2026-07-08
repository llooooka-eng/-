/**
 * ميدالية اللوقو — قرص بإطار ذهبي معدني وقلب حبري، يحمل رمز الحلاقة.
 * معالجة مستوحاة من دليل التصميم (§6): إطار ذهبي + قرص داخلي داكن + إضاءة علوية.
 */
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui";
import { colors, fontFamily, radius } from "@/constants/theme";

export function Medallion({ size = 96 }: { size?: number }) {
  const inner = size - 10;
  return (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <View
        style={[
          styles.core,
          { width: inner, height: inner, borderRadius: inner / 2 },
        ]}
      >
        <Ionicons name="cut" size={size * 0.38} color={colors.gold} />
      </View>
    </View>
  );
}

/** اللوقو الكامل: ميدالية + اسم العلامة */
export function BrandLockup({
  size = 96,
  light = false,
}: {
  size?: number;
  light?: boolean;
}) {
  return (
    <View style={{ alignItems: "center", gap: 14 }}>
      <Medallion size={size} />
      <AppText
        weight="semibold"
        style={[styles.wordmark, { color: light ? colors.white : colors.textPrimary }]}
      >
        تألق
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.goldSoft,
    shadowColor: colors.ink,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  core: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.inkSoft,
  },
  wordmark: {
    fontFamily: fontFamily.semibold,
    fontSize: 30,
    letterSpacing: 0,
  },
});
