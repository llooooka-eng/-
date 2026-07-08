/**
 * تأكيد الحجز والدفع (وضع العرض — بيانات محلية).
 * ملخص → اختيار طريقة الدفع → دفع → تأكيد. الرصيد يُخصم من المحفظة عند اختيارها.
 *
 * مسار الإنتاج (Supabase + Moyasar) في integrations/backend/ConfirmBookingBackend.tsx.
 */
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Button, Card, Header, Screen } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";
import { getSalon, PAYMENT_METHODS, type PaymentMethodId } from "@/constants/sampleData";
import { fontSize, radius, spacing, type AppColors } from "@/constants/theme";
import { formatDateTime, formatSAR } from "@/lib/format";
import { scheduleBookingReminder } from "@/lib/notifications";

export default function ConfirmBookingScreen() {
  const params = useLocalSearchParams<{
    salonId: string;
    serviceId: string;
    serviceName?: string;
    barber: string;
    scheduledAt: string;
    locationType: "salon" | "home";
    address?: string;
    amount: string;
  }>();

  const { addBooking, attachReminder, payMethod, setPayMethod, wallet } = useAuth();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [done, setDone] = useState(false);
  const [method, setMethod] = useState<PaymentMethodId>(payMethod);

  const salon = params.salonId ? getSalon(params.salonId) : undefined;
  const amount = Number(params.amount ?? 0);
  const serviceName = params.serviceName || "خدمة";

  const walletShort = method === "wallet" && wallet.balance < amount;

  const pay = () => {
    if (!salon || walletShort) return;
    setPayMethod(method);
    const booking = addBooking(
      {
        salonId: salon.id,
        salonName: salon.name,
        serviceId: params.serviceId,
        serviceName,
        barberName: params.barber ?? "أي حلاق متاح",
        scheduledAt: params.scheduledAt,
        locationType: params.locationType ?? "salon",
        address: params.address,
        amount,
      },
      method,
    );
    // جدولة تذكير محلي قبل الموعد (غير قاطع إن رُفض الإذن)
    scheduleBookingReminder({
      salonName: salon.name,
      serviceName,
      scheduledAt: params.scheduledAt,
    }).then((id) => {
      if (id) attachReminder(booking.id, id);
    });
    setDone(true);
  };

  if (!salon) {
    return (
      <Screen>
        <Header title="تأكيد الحجز" onBack={() => router.back()} />
        <View style={styles.center}>
          <AppText style={{ color: colors.textSecondary }}>لم يُعثر على الحجز</AppText>
        </View>
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen>
        <Header title="تم الحجز" />
        <View style={styles.success}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={40} color={colors.white} />
          </View>
          <AppText weight="semibold" style={styles.successTitle}>
            تم تأكيد حجزك
          </AppText>
          <AppText style={styles.successSub}>
            {salon.name} · {formatDateTime(params.scheduledAt)}
          </AppText>
          <AppText style={styles.successPaid}>دُفع {formatSAR(amount)} بنجاح</AppText>
          <View style={{ height: spacing.xl }} />
          <Button title="عرض حجوزاتي" onPress={() => router.replace("/(tabs)/bookings")} />
          <Pressable onPress={() => router.replace("/(tabs)")} style={{ marginTop: spacing.md }}>
            <AppText style={styles.backHome}>العودة للرئيسية</AppText>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="تأكيد الحجز" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* ملخص */}
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={styles.summaryHead}>
            <View style={styles.serviceIcon}>
              <Ionicons name={salon.icon} size={22} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText weight="semibold" style={{ fontSize: fontSize.base }}>
                {salon.name}
              </AppText>
              <AppText style={styles.serviceSub}>{serviceName}</AppText>
            </View>
          </View>
          <View style={styles.divider} />
          <SummaryRow icon="calendar-outline" label="الموعد" value={formatDateTime(params.scheduledAt)} />
          <SummaryRow icon="person-outline" label="الحلاق" value={params.barber ?? "أي حلاق متاح"} />
          <SummaryRow
            icon={params.locationType === "home" ? "home-outline" : "storefront-outline"}
            label="المكان"
            value={params.locationType === "home" ? params.address || "خدمة منزلية" : "في الصالون"}
          />
        </Card>

        {/* طريقة الدفع */}
        <AppText weight="semibold" style={styles.sectionTitle}>
          طريقة الدفع
        </AppText>
        <View style={{ gap: spacing.sm }}>
          {PAYMENT_METHODS.map((m) => {
            const active = method === m.id;
            const hint = m.id === "wallet" ? `الرصيد ${formatSAR(wallet.balance)}` : m.hint;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMethod(m.id)}
                style={[styles.payRow, active && styles.payRowActive]}
              >
                <View style={styles.payStart}>
                  <Ionicons name={m.icon} size={22} color={active ? colors.gold : colors.textSecondary} />
                  <View>
                    <AppText weight="medium" style={{ fontSize: fontSize.base }}>
                      {m.label}
                    </AppText>
                    <AppText style={styles.payHint}>{hint}</AppText>
                  </View>
                </View>
                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={active ? colors.gold : colors.textMuted}
                />
              </Pressable>
            );
          })}
        </View>

        {walletShort ? (
          <AppText style={styles.warn}>الرصيد غير كافٍ — اختر طريقة دفع أخرى أو اشحن المحفظة</AppText>
        ) : null}

        {/* سياسة الإلغاء */}
        <View style={styles.policyNote}>
          <Ionicons name="information-circle-outline" size={16} color={colors.goldDark} />
          <AppText style={styles.policyText}>الإلغاء قبل 24 ساعة: استرداد كامل للمحفظة</AppText>
        </View>

        <View style={styles.totalRow}>
          <AppText style={{ color: colors.textSecondary }}>الإجمالي</AppText>
          <AppText weight="semibold" style={styles.totalValue}>
            {formatSAR(amount)}
          </AppText>
        </View>
        <Button title="ادفع الآن" onPress={pay} icon="lock-closed-outline" disabled={walletShort} />
      </ScrollView>
    </Screen>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.sumRow}>
      <View style={styles.sumStart}>
        <Ionicons name={icon} size={15} color={colors.textMuted} />
        <AppText style={styles.sumLabel}>{label}</AppText>
      </View>
      <AppText weight="medium" style={styles.sumValue} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  summaryHead: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  serviceIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  serviceSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 0.5, backgroundColor: colors.borderSoft, marginVertical: spacing.md },
  sumRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingVertical: 5 },
  sumStart: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  sumLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  sumValue: { fontSize: fontSize.sm, color: colors.textPrimary, maxWidth: 200 },

  sectionTitle: { fontSize: fontSize.lg, marginBottom: spacing.md },
  payRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  payRowActive: { borderColor: colors.gold, borderWidth: 1.5 },
  payStart: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.md },
  payHint: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  warn: { color: colors.warning, fontSize: fontSize.sm, marginTop: spacing.md, textAlign: "center" },

  policyNote: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.pearl,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginVertical: spacing.lg,
  },
  policyText: { fontSize: fontSize.xs, color: colors.goldDark },
  totalRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  totalValue: { fontSize: fontSize.xl },

  success: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  successIcon: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  successTitle: { fontSize: fontSize.xl },
  successSub: { color: colors.textSecondary, marginTop: spacing.sm, textAlign: "center" },
  successPaid: { color: colors.success, marginTop: spacing.xs },
  backHome: { color: colors.textSecondary, fontSize: fontSize.base },
});
