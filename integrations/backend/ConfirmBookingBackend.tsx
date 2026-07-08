/**
 * شاشة تأكيد الحجز والدفع — نسخة مسار الخادم (Supabase + Moyasar).
 *
 * محفوظة هنا كمرجع للإنتاج ولا تُسجَّل كمسار في expo-router. التدفّق:
 * ملخص الحجز → اختيار (كامل/عربون) → نيّة دفع خادمية → دفع عبر Moyasar →
 * تتبّع الحالة → نجاح. لتفعيلها انقلها إلى app/booking/ واربط Supabase.
 *
 * وضع العرض يستخدم بدلاً منها app/booking/confirm.tsx (بيانات محلية).
 */
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Button, Card, Screen } from "@/components/ui";
import { MoyasarPaymentSheet } from "@/components/payment/MoyasarPaymentSheet";
import * as bookingService from "@/services/bookingService";
import { colors, fontSize, radius, spacing } from "@/constants/theme";
import { formatDateTime, formatSAR } from "@/lib/format";
import type { Booking, PaymentIntent, PaymentType } from "@/types/database";

type Phase = "summary" | "paying" | "processing" | "done" | "failed";

export default function ConfirmBookingScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentType, setPaymentType] = useState<PaymentType>("full");
  const [phase, setPhase] = useState<Phase>("summary");
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (bookingId) setBooking(await bookingService.getBooking(bookingId));
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const amount = useMemo(() => {
    if (!booking) return 0;
    return paymentType === "deposit" ? booking.deposit_amount : booking.total_amount;
  }, [booking, paymentType]);

  // بدء الدفع: أنشئ نيّة الدفع خادمياً ثم اعرض نموذج Moyasar
  const startPayment = async () => {
    if (!bookingId) return;
    setError(null);
    try {
      const created = await bookingService.createPaymentIntent(bookingId, paymentType);
      setIntent(created);
      setPhase("paying");
    } catch (e) {
      setError("تعذّر بدء عملية الدفع، حاول مرة أخرى");
    }
  };

  // بعد نجاح الدفع في Moyasar: أكّد الحالة من الخادم (خط الدفاع الثاني)
  const handlePaid = async () => {
    if (!intent) return;
    setPhase("processing");
    try {
      const status = await bookingService.pollPaymentStatus(intent.payment_transaction_id);
      setPhase(status === "paid" ? "done" : "failed");
    } catch {
      setPhase("failed");
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} />
        </View>
      </Screen>
    );
  }

  if (!booking) {
    return (
      <Screen>
        <View style={styles.center}>
          <AppText style={{ color: colors.textSecondary }}>لم يُعثر على الحجز</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
        </Pressable>
        <AppText weight="semibold" style={styles.headerTitle}>
          {phase === "done" ? "تم الحجز" : "تأكيد الحجز"}
        </AppText>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {phase === "done" ? (
          <SuccessView amount={amount} onDone={() => router.replace("/(tabs)/bookings")} />
        ) : (
          <>
            {/* ملخص الحجز */}
            <Card style={{ marginBottom: spacing.md }}>
              <View style={styles.summaryHead}>
                <View style={styles.serviceIcon}>
                  <Ionicons name="cut-outline" size={22} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText weight="semibold" style={styles.serviceName}>
                    {booking.description ?? "خدمة"}
                  </AppText>
                </View>
              </View>
              <View style={styles.summaryDivider} />
              <SummaryRow icon="calendar-outline" label="الموعد" value={formatDateTime(booking.scheduled_at)} />
            </Card>

            {phase === "summary" && (
              <>
                {/* مبدّل نوع الدفع */}
                <View style={styles.typeRow}>
                  <PayTypeCard
                    active={paymentType === "full"}
                    label="دفع كامل"
                    amount={booking.total_amount}
                    onPress={() => setPaymentType("full")}
                  />
                  <PayTypeCard
                    active={paymentType === "deposit"}
                    label="عربون"
                    amount={booking.deposit_amount}
                    onPress={() => setPaymentType("deposit")}
                  />
                </View>

                {/* ملاحظة سياسة الإلغاء */}
                <View style={styles.policyNote}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.goldDark} />
                  <AppText style={styles.policyText}>الإلغاء قبل 24 ساعة: استرداد كامل للمحفظة</AppText>
                </View>

                {error ? <AppText style={styles.error}>{error}</AppText> : null}

                <View style={styles.totalRow}>
                  <AppText style={{ color: colors.textSecondary }}>الإجمالي</AppText>
                  <AppText weight="semibold" style={styles.totalValue}>
                    {formatSAR(amount)}
                  </AppText>
                </View>
                <Button title="متابعة الدفع" onPress={startPayment} icon="lock-closed-outline" />
              </>
            )}

            {phase === "paying" && intent && (
              <Card>
                <MoyasarPaymentSheet
                  intent={intent}
                  onPaid={handlePaid}
                  onFailed={(msg) => {
                    setError(msg);
                    setPhase("summary");
                  }}
                />
              </Card>
            )}

            {phase === "processing" && (
              <View style={styles.center}>
                <ActivityIndicator color={colors.gold} />
                <AppText style={{ color: colors.textSecondary, marginTop: spacing.md }}>
                  جارٍ تأكيد الدفع…
                </AppText>
              </View>
            )}

            {phase === "failed" && (
              <View style={styles.center}>
                <Ionicons name="close-circle-outline" size={44} color={colors.danger} />
                <AppText style={{ color: colors.textSecondary, marginVertical: spacing.md }}>
                  لم يكتمل الدفع
                </AppText>
                <Button title="إعادة المحاولة" variant="outline" onPress={() => setPhase("summary")} />
              </View>
            )}
          </>
        )}
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
  return (
    <View style={styles.sumRow}>
      <View style={styles.sumStart}>
        <Ionicons name={icon} size={15} color={colors.textMuted} />
        <AppText style={styles.sumLabel}>{label}</AppText>
      </View>
      <AppText weight="medium" style={styles.sumValue}>
        {value}
      </AppText>
    </View>
  );
}

function PayTypeCard({
  active,
  label,
  amount,
  onPress,
}: {
  active: boolean;
  label: string;
  amount: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.payType, active ? styles.payTypeActive : styles.payTypeIdle]}
    >
      <AppText style={[styles.payTypeLabel, { color: active ? colors.goldSoft : colors.textSecondary }]}>
        {label}
      </AppText>
      <AppText weight="semibold" style={[styles.payTypeAmount, { color: active ? colors.gold : colors.textPrimary }]}>
        {formatSAR(amount)}
      </AppText>
    </Pressable>
  );
}

function SuccessView({ amount, onDone }: { amount: number; onDone: () => void }) {
  return (
    <View style={styles.success}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={40} color={colors.white} />
      </View>
      <AppText weight="semibold" style={styles.successTitle}>
        تم تأكيد حجزك
      </AppText>
      <AppText style={styles.successSub}>دُفع {formatSAR(amount)} بنجاح</AppText>
      <View style={{ height: spacing.xl }} />
      <Button title="عرض حجوزاتي" onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxl },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: fontSize.lg },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },

  summaryHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceName: { fontSize: fontSize.base },
  summaryDivider: { height: 0.5, backgroundColor: colors.borderSoft, marginVertical: spacing.md },
  sumRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sumStart: { flexDirection: "row", alignItems: "center", gap: 6 },
  sumLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  sumValue: { fontSize: fontSize.sm, color: colors.textPrimary },

  typeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  payType: { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: "center" },
  payTypeActive: { backgroundColor: colors.ink },
  payTypeIdle: { backgroundColor: colors.white, borderWidth: 0.5, borderColor: colors.border },
  payTypeLabel: { fontSize: fontSize.xs },
  payTypeAmount: { fontSize: fontSize.lg, marginTop: 2 },

  policyNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.pearl,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  policyText: { fontSize: fontSize.xs, color: colors.goldDark },
  error: { color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.sm, textAlign: "center" },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  totalValue: { fontSize: fontSize.xl },

  success: { alignItems: "center", paddingVertical: spacing.xxl },
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
  successSub: { color: colors.textSecondary, marginTop: spacing.xs },
});
