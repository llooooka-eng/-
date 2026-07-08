/**
 * تدفّق الحجز — اختيار الخدمة/الحلاق/التاريخ/الوقت/الموقع (صالون أو منزلي).
 * ثم المتابعة إلى شاشة التأكيد والدفع.
 */
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Button, Chip, EmptyState, Header, Screen } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { getSalon, TIME_SLOTS, type SampleService } from "@/constants/sampleData";
import { colors, fontFamily, fontSize, radius, spacing } from "@/constants/theme";
import { formatSAR } from "@/lib/format";

function nextDays(count: number) {
  const days = [];
  const labels = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      iso: d.toISOString(),
      day: d.getDate(),
      label: i === 0 ? "اليوم" : i === 1 ? "غداً" : labels[d.getDay()],
    });
  }
  return days;
}

export default function NewBookingScreen() {
  const { salonId, serviceId } = useLocalSearchParams<{ salonId: string; serviceId?: string }>();
  const { adminServices } = useAuth();
  const salon = salonId ? getSalon(salonId) : undefined;

  const services: SampleService[] =
    salon?.id === "salon-ink" ? adminServices : salon?.services ?? [];
  const days = useMemo(() => nextDays(7), []);

  const [svcId, setSvcId] = useState<string | undefined>(serviceId ?? services[0]?.id);
  const [barber, setBarber] = useState<string>(salon?.barbers[0]?.name ?? "أي حلاق متاح");
  const [dayIso, setDayIso] = useState<string>(days[0].iso);
  const [time, setTime] = useState<string>(TIME_SLOTS[0]);
  const [locationType, setLocationType] = useState<"salon" | "home">("salon");
  const [address, setAddress] = useState("");

  if (!salon) {
    return (
      <Screen>
        <Header title="حجز جديد" onBack={() => router.back()} />
        <EmptyState icon="alert-circle-outline" title="لم يُعثر على الصالون" />
      </Screen>
    );
  }

  const service = services.find((s) => s.id === svcId);
  const canContinue = !!service && (locationType === "salon" || address.trim().length > 3);

  const onContinue = () => {
    if (!service) return;
    const scheduled = new Date(dayIso);
    const [h, m] = time.split(":").map(Number);
    scheduled.setHours(h, m, 0, 0);
    router.push({
      pathname: "/booking/confirm",
      params: {
        salonId: salon.id,
        serviceId: service.id,
        barber,
        scheduledAt: scheduled.toISOString(),
        locationType,
        address: address.trim(),
        amount: String(service.price),
      },
    });
  };

  return (
    <Screen>
      <Header title="تفاصيل الحجز" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <AppText weight="semibold" style={styles.salonName}>
          {salon.name}
        </AppText>

        {/* الخدمة */}
        <Label text="اختر الخدمة" />
        <View style={styles.optionList}>
          {services.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setSvcId(s.id)}
              style={[styles.option, svcId === s.id && styles.optionActive]}
            >
              <View style={styles.radioRow}>
                <Ionicons
                  name={svcId === s.id ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={svcId === s.id ? colors.gold : colors.textMuted}
                />
                <View>
                  <AppText weight="medium" style={{ fontSize: fontSize.base }}>
                    {s.name}
                  </AppText>
                  <AppText style={styles.optionMeta}>{s.dur} دقيقة</AppText>
                </View>
              </View>
              <AppText weight="semibold" style={{ fontSize: fontSize.base }}>
                {formatSAR(s.price)}
              </AppText>
            </Pressable>
          ))}
        </View>

        {/* الحلاق */}
        <Label text="اختر الحلاق" />
        <View style={styles.chipsWrap}>
          <Chip label="أي حلاق متاح" active={barber === "أي حلاق متاح"} onPress={() => setBarber("أي حلاق متاح")} />
          {salon.barbers.map((b) => (
            <Chip key={b.id} label={b.name} active={barber === b.name} onPress={() => setBarber(b.name)} />
          ))}
        </View>

        {/* التاريخ */}
        <Label text="اختر اليوم" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
          {days.map((d) => {
            const active = d.iso === dayIso;
            return (
              <Pressable key={d.iso} onPress={() => setDayIso(d.iso)} style={[styles.dayCard, active && styles.dayCardActive]}>
                <AppText style={[styles.dayLabel, active && { color: colors.white }]}>{d.label}</AppText>
                <AppText weight="semibold" style={[styles.dayNum, active && { color: colors.gold }]}>
                  {d.day}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* الوقت */}
        <Label text="اختر الوقت" />
        <View style={styles.chipsWrap}>
          {TIME_SLOTS.map((t) => (
            <Chip key={t} label={t} active={time === t} onPress={() => setTime(t)} />
          ))}
        </View>

        {/* الموقع */}
        <Label text="مكان الخدمة" />
        <View style={styles.locRow}>
          <LocationCard
            active={locationType === "salon"}
            icon="storefront-outline"
            label="في الصالون"
            onPress={() => setLocationType("salon")}
          />
          <LocationCard
            active={locationType === "home"}
            icon="home-outline"
            label="خدمة منزلية"
            disabled={!salon.homeService}
            onPress={() => salon.homeService && setLocationType("home")}
          />
        </View>
        {locationType === "home" && (
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="أدخل العنوان بالتفصيل"
            placeholderTextColor={colors.textMuted}
            style={styles.addressInput}
            textAlign="right"
            multiline
          />
        )}

        <View style={{ height: spacing.xl }} />
        <Button
          title={service ? `متابعة · ${formatSAR(service.price)}` : "متابعة"}
          onPress={onContinue}
          disabled={!canContinue}
          icon="arrow-back"
        />
      </ScrollView>
    </Screen>
  );
}

function Label({ text }: { text: string }) {
  return (
    <AppText weight="semibold" style={styles.label}>
      {text}
    </AppText>
  );
}

function LocationCard({
  active,
  icon,
  label,
  onPress,
  disabled = false,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.locCard, active && styles.locCardActive, disabled && { opacity: 0.4 }]}
    >
      <Ionicons name={icon} size={22} color={active ? colors.gold : colors.textSecondary} />
      <AppText weight="medium" style={{ color: active ? colors.white : colors.textPrimary, fontSize: fontSize.base }}>
        {label}
      </AppText>
      {disabled ? <AppText style={styles.locDisabled}>غير متاح</AppText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  salonName: { fontSize: fontSize.lg, marginTop: spacing.sm },
  label: { fontSize: fontSize.base, marginTop: spacing.xl, marginBottom: spacing.md },
  optionList: { gap: spacing.sm },
  option: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  optionActive: { borderColor: colors.gold, borderWidth: 1.5 },
  radioRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.md },
  optionMeta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  chipsWrap: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm },
  days: { flexDirection: "row-reverse", gap: spacing.sm },
  dayCard: {
    width: 62,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dayCardActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  dayLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  dayNum: { fontSize: fontSize.lg, color: colors.textPrimary },
  locRow: { flexDirection: "row-reverse", gap: spacing.md },
  locCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  locCardActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  locDisabled: { fontSize: fontSize.xs, color: colors.textMuted },
  addressInput: {
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    minHeight: 70,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    textAlignVertical: "top",
  },
});
