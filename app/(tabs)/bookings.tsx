/**
 * حجوزاتي — تبويب قادمة / مكتملة، مع الإلغاء والتقييم.
 */
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Card, EmptyState, Screen, Stars } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { useAuth, type LocalBooking } from "@/context/AuthContext";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";
import { fontSize, radius, spacing, type AppColors } from "@/constants/theme";
import { cancelReminder } from "@/lib/notifications";
import { formatDateTime, formatSAR } from "@/lib/format";

type Tab = "upcoming" | "past";

export default function BookingsScreen() {
  const { upcomingBookings, pastBookings, cancelBooking } = useAuth();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("upcoming");

  const data = tab === "upcoming" ? upcomingBookings : pastBookings;

  const confirmCancel = (b: LocalBooking) => {
    Alert.alert("إلغاء الحجز", `هل تريد إلغاء حجزك في ${b.salonName}؟ سيُسترد المبلغ لمحفظتك.`, [
      { text: "تراجع", style: "cancel" },
      {
        text: "تأكيد الإلغاء",
        style: "destructive",
        onPress: () => {
          cancelReminder(b.reminderId);
          cancelBooking(b.id);
          toast.show("أُلغي الحجز واسترد المبلغ لمحفظتك", "info");
        },
      },
    ]);
  };

  return (
    <Screen>
      <AppText weight="semibold" style={styles.pageTitle}>
        حجوزاتي
      </AppText>

      {/* التبويبات */}
      <View style={styles.tabs}>
        <TabBtn label="القادمة" active={tab === "upcoming"} onPress={() => setTab("upcoming")} />
        <TabBtn label="السابقة" active={tab === "past"} onPress={() => setTab("past")} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {data.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={tab === "upcoming" ? "لا توجد حجوزات قادمة" : "لا توجد حجوزات سابقة"}
          />
        ) : (
          data.map((b) => (
            <Card key={b.id} style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.salonIcon}>
                  <Ionicons name="cut-outline" size={20} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText weight="semibold" style={{ fontSize: fontSize.base }}>
                    {b.salonName}
                  </AppText>
                  <AppText style={styles.sub}>{b.serviceName}</AppText>
                </View>
                <StatusPill status={b.status} />
              </View>

              <View style={styles.divider} />
              <Meta icon="calendar-outline" text={formatDateTime(b.scheduledAt)} />
              <Meta icon="person-outline" text={b.barberName} />
              <Meta
                icon={b.locationType === "home" ? "home-outline" : "storefront-outline"}
                text={b.locationType === "home" ? b.address || "خدمة منزلية" : "في الصالون"}
              />
              <Meta icon="cash-outline" text={formatSAR(b.amount)} />

              {b.status === "upcoming" && (
                <Pressable style={styles.cancelBtn} onPress={() => confirmCancel(b)}>
                  <AppText weight="medium" style={styles.cancelText}>
                    إلغاء الحجز
                  </AppText>
                </Pressable>
              )}
              {b.status === "completed" &&
                (b.rated ? (
                  <View style={styles.ratedRow}>
                    <AppText style={styles.ratedLabel}>تقييمك</AppText>
                    <Stars value={b.ratingValue ?? 0} size={14} />
                  </View>
                ) : (
                  <Pressable style={styles.rateBtn} onPress={() => router.push(`/rate/${b.id}`)}>
                    <Ionicons name="star-outline" size={16} color={colors.ink} />
                    <AppText weight="semibold" style={styles.rateText}>
                      قيّم تجربتك
                    </AppText>
                  </Pressable>
                ))}
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function TabBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <AppText weight={active ? "semibold" : "regular"} style={[styles.tabText, active && { color: colors.ink }]}>
        {label}
      </AppText>
    </Pressable>
  );
}

function StatusPill({ status }: { status: LocalBooking["status"] }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const map = {
    upcoming: { label: "قادم", bg: colors.infoBg, fg: colors.info },
    completed: { label: "مكتمل", bg: colors.successBg, fg: colors.success },
    cancelled: { label: "ملغى", bg: colors.dangerBg, fg: colors.danger },
  } as const;
  const s = map[status];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <AppText style={[styles.pillText, { color: s.fg }]}>{s.label}</AppText>
    </View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <AppText style={styles.metaText} numberOfLines={1}>
        {text}
      </AppText>
    </View>
  );
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  pageTitle: { fontSize: fontSize.xl, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  tabs: {
    flexDirection: "row-reverse",
    backgroundColor: colors.pearlSoft,
    borderRadius: radius.md,
    marginHorizontal: spacing.xl,
    padding: 4,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: radius.sm },
  tabBtnActive: { backgroundColor: colors.white },
  tabText: { fontSize: fontSize.base, color: colors.textSecondary },
  list: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
  cardHead: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.md },
  salonIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  sub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 0.5, backgroundColor: colors.borderSoft, marginVertical: spacing.md },
  meta: { flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingVertical: 4 },
  metaText: { fontSize: fontSize.sm, color: colors.textSecondary },
  pill: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: fontSize.xs },
  cancelBtn: { marginTop: spacing.md, borderWidth: 1, borderColor: colors.dangerBg, borderRadius: radius.md, paddingVertical: 10, alignItems: "center" },
  cancelText: { color: colors.danger, fontSize: fontSize.base },
  rateBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.md,
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  rateText: { color: colors.ink, fontSize: fontSize.base },
  ratedRow: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8, marginTop: spacing.md },
  ratedLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
});
