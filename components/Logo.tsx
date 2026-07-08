/**
 * ميدالية اللوقو — قرص بإطار ذهبي معدني وقلب حبري، يحمل رمز الحلاقة.
 * معالجة مستوحاة من دليل التصميم (§6): إطار ذهبي + قرص داخلي داكن + إضاءة علوية.
 * ثابتة عبر الثيمين (هوية العلامة)، مستقلة عن الوضع الفاتح/الداكن.
 */
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui";
import { fontFamily } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

const BRAND = {
  gold: "#C6A15B",
  goldSoft: "#E8D9B5",
  ink: "#191A1C",
  inkSoft: "#2A2B2D",
};

export function Medallion({ size = 96 }: { size?: number }) {
  const inner = size - 10;
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.core, { width: inner, height: inner, borderRadius: inner / 2 }]}>
        <Ionicons name="cut" size={size * 0.38} color={BRAND.gold} />
      </View>
    </View>
  );
}

/** اللوقو الكامل: ميدالية + اسم العلامة */
export function BrandLockup({ size = 96, light = false }: { size?: number; light?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center", gap: 14 }}>
      <Medallion size={size} />
      <AppText
        weight="semibold"
        style={[styles.wordmark, { color: light ? "#FFFFFF" : colors.textPrimary }]}
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
    backgroundColor: BRAND.gold,
    borderWidth: 2,
    borderColor: BRAND.goldSoft,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  core: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND.ink,
    borderWidth: 1,
    borderColor: BRAND.inkSoft,
  },
  wordmark: {
    fontFamily: fontFamily.semibold,
    fontSize: 30,
    letterSpacing: 0,
  },
});
