/**
 * حسابي — بيانات المستخدم، المدينة، طريقة الدفع، لوحة صاحب الصالون، تسجيل الخروج.
 */
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Card, Screen } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { PAYMENT_METHODS } from "@/constants/sampleData";
import { colors, fontSize, radius, spacing } from "@/constants/theme";
import { formatSAR } from "@/lib/format";

export default function AccountScreen() {
  const { phone, city, payMethod, wallet, bookings, signOut } = useAuth();
  const payLabel = PAYMENT_METHODS.find((m) => m.id === payMethod)?.label ?? "—";

  const doSignOut = () => {
    Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج من حسابك؟", [
      { text: "تراجع", style: "cancel" },
      { text: "خروج", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <AppText weight="semibold" style={styles.pageTitle}>
          حسابي
        </AppText>

        {/* بطاقة المستخدم */}
        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.goldDark} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText weight="semibold" style={{ fontSize: fontSize.lg }}>
              مرحباً بك
            </AppText>
            <AppText style={styles.phone}>{phone ?? "—"}</AppText>
          </View>
        </Card>

        {/* إحصاءات سريعة */}
        <View style={styles.stats}>
          <Stat value={String(bookings.length)} label="حجوزات" />
          <Stat value={formatSAR(wallet.balance, { withSymbol: false })} label="رصيد المحفظة" />
        </View>

        {/* الإعدادات */}
        <View style={styles.group}>
          <Row icon="location-outline" label="المدينة" value={city} onPress={() => router.push("/(tabs)")} />
          <Row icon="card-outline" label="طريقة الدفع المفضّلة" value={payLabel} />
          <Row icon="wallet-outline" label="المحفظة" value={formatSAR(wallet.balance)} onPress={() => router.push("/(tabs)/wallet")} />
        </View>

        {/* لوحة صاحب الصالون */}
        <AppText weight="semibold" style={styles.sectionTitle}>
          لصاحب الصالون
        </AppText>
        <View style={styles.group}>
          <Row
            icon="cut-outline"
            label="إدارة خدمات صالوني"
            value="غرفة الحبر"
            onPress={() => router.push("/dashboard")}
          />
        </View>

        <Pressable style={styles.signOut} onPress={doSignOut}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <AppText weight="medium" style={styles.signOutText}>
            تسجيل الخروج
          </AppText>
        </Pressable>

        <AppText style={styles.version}>تألق · الإصدار 1.0.0</AppText>
      </ScrollView>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText weight="semibold" style={styles.statValue}>
        {value}
      </AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowStart}>
        <Ionicons name={icon} size={20} color={colors.goldDark} />
        <AppText style={{ fontSize: fontSize.base }}>{label}</AppText>
      </View>
      <View style={styles.rowEnd}>
        {value ? <AppText style={styles.rowValue}>{value}</AppText> : null}
        {onPress ? <Ionicons name="chevron-back" size={18} color={colors.textMuted} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  pageTitle: { fontSize: fontSize.xl, paddingTop: spacing.md, marginBottom: spacing.lg },
  userCard: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.pearl,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  phone: { color: colors.textSecondary, fontSize: fontSize.base, marginTop: 2 },
  stats: { flexDirection: "row-reverse", gap: spacing.md, marginTop: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  statValue: { fontSize: fontSize.xl, color: colors.goldDark },
  statLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: fontSize.base, marginTop: spacing.xl, marginBottom: spacing.md },
  group: {
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginTop: spacing.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSoft,
  },
  rowStart: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.md },
  rowEnd: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  rowValue: { fontSize: fontSize.sm, color: colors.textSecondary },
  signOut: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  signOutText: { color: colors.danger, fontSize: fontSize.base },
  version: { textAlign: "center", color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.md },
});
