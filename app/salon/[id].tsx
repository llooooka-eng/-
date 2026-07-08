/**
 * تفاصيل الصالون — غلاف + خدمات + حلاقون + تقييمات → حجز.
 * خدمات «غرفة الحبر» مربوطة بقائمة صاحب الصالون (لوحة التحكم).
 */
import { ScrollView, StyleSheet, View } from "react-native";
import { Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Card, EmptyState, Header, Screen, Stars } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { getSalon, type SampleService } from "@/constants/sampleData";
import { colors, fontSize, radius, spacing } from "@/constants/theme";
import { formatSAR } from "@/lib/format";

const SAMPLE_REVIEWS = [
  { name: "فهد", stars: 5, text: "خدمة ممتازة ونظافة عالية، أنصح بها." },
  { name: "عبدالرحمن", stars: 5, text: "الحلاق محترف والمكان مريح جداً." },
  { name: "سلطان", stars: 4, text: "تجربة جيدة، المواعيد دقيقة." },
];

export default function SalonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { adminServices } = useAuth();
  const salon = id ? getSalon(id) : undefined;

  if (!salon) {
    return (
      <Screen>
        <Header title="الصالون" onBack={() => router.back()} />
        <EmptyState icon="alert-circle-outline" title="لم يُعثر على الصالون" />
      </Screen>
    );
  }

  // ربط خدمات غرفة الحبر بقائمة صاحب الصالون
  const services: SampleService[] = salon.id === "salon-ink" ? adminServices : salon.services;

  const book = (service: SampleService) =>
    router.push({
      pathname: "/booking/new",
      params: { salonId: salon.id, serviceId: service.id },
    });

  return (
    <Screen edges={["top"]}>
      <Header title={salon.name} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* الغلاف */}
        <View style={[styles.cover, { backgroundColor: salon.accent }]}>
          <Ionicons name={salon.icon} size={64} color={colors.goldSoft} />
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <AppText weight="semibold" style={styles.name}>
                {salon.name}
              </AppText>
              <AppText style={styles.tagline}>{salon.tagline}</AppText>
            </View>
            {salon.homeService ? (
              <View style={styles.homeBadge}>
                <Ionicons name="home-outline" size={13} color={colors.ink} />
                <AppText style={styles.homeBadgeText}>يخدم منزلياً</AppText>
              </View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Stars value={salon.rating} size={14} />
              <AppText style={styles.metaText}>
                {salon.rating.toFixed(1)} · {salon.reviews} تقييم
              </AppText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <AppText style={styles.metaText}>{salon.city}</AppText>
            </View>
          </View>
        </View>

        {/* الخدمات */}
        <SectionTitle title="الخدمات" />
        <View style={styles.section}>
          {services.length ? (
            services.map((svc) => (
              <Card key={svc.id} style={styles.serviceCard}>
                <View style={{ flex: 1 }}>
                  <AppText weight="medium" style={styles.serviceName}>
                    {svc.name}
                  </AppText>
                  <AppText style={styles.serviceMeta}>
                    {svc.dur} دقيقة · {formatSAR(svc.price)}
                  </AppText>
                </View>
                <Pressable style={styles.bookBtn} onPress={() => book(svc)}>
                  <AppText weight="semibold" style={styles.bookBtnText}>
                    احجز
                  </AppText>
                </Pressable>
              </Card>
            ))
          ) : (
            <EmptyState icon="cut-outline" title="لا توجد خدمات متاحة حالياً" />
          )}
        </View>

        {/* الحلاقون */}
        <SectionTitle title="الطاقم" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barbers}>
          {salon.barbers.map((b) => (
            <View key={b.id} style={styles.barber}>
              <View style={styles.barberAvatar}>
                <Ionicons name="person" size={26} color={colors.goldDark} />
              </View>
              <AppText weight="medium" style={styles.barberName} numberOfLines={1}>
                {b.name}
              </AppText>
              <AppText style={styles.barberTitle} numberOfLines={1}>
                {b.title}
              </AppText>
            </View>
          ))}
        </ScrollView>

        {/* التقييمات */}
        <SectionTitle title="آراء العملاء" />
        <View style={styles.section}>
          {SAMPLE_REVIEWS.map((r, i) => (
            <Card key={i} style={{ marginBottom: spacing.md }}>
              <View style={styles.reviewHead}>
                <AppText weight="medium">{r.name}</AppText>
                <Stars value={r.stars} size={12} />
              </View>
              <AppText style={styles.reviewText}>{r.text}</AppText>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <AppText weight="semibold" style={styles.sectionTitle}>
      {title}
    </AppText>
  );
}

const styles = StyleSheet.create({
  cover: { height: 170, alignItems: "center", justifyContent: "center", marginHorizontal: spacing.xl, borderRadius: radius.xl },
  info: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md },
  titleRow: { flexDirection: "row-reverse", alignItems: "flex-start", gap: spacing.md },
  name: { fontSize: fontSize.xxl },
  tagline: { fontSize: fontSize.base, color: colors.textSecondary, marginTop: 2 },
  homeBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.goldSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  homeBadgeText: { fontSize: fontSize.xs, color: colors.ink },
  metaRow: { flexDirection: "row-reverse", gap: spacing.xl, flexWrap: "wrap" },
  metaItem: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  metaText: { fontSize: fontSize.sm, color: colors.textMuted },

  sectionTitle: { fontSize: fontSize.lg, paddingHorizontal: spacing.xl, marginTop: spacing.xl, marginBottom: spacing.md },
  section: { paddingHorizontal: spacing.xl },
  serviceCard: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.md, marginBottom: spacing.md, paddingVertical: spacing.md },
  serviceName: { fontSize: fontSize.base },
  serviceMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  bookBtn: { backgroundColor: colors.gold, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: 9 },
  bookBtnText: { color: colors.ink, fontSize: fontSize.base },

  barbers: { flexDirection: "row-reverse", gap: spacing.md, paddingHorizontal: spacing.xl },
  barber: { width: 96, alignItems: "center", gap: 4 },
  barberAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.pearl,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  barberName: { fontSize: fontSize.sm },
  barberTitle: { fontSize: fontSize.xs, color: colors.textMuted },

  reviewHead: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  reviewText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 22 },
});
