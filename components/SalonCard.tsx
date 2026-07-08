/**
 * بطاقات الصالون: بطاقة مميّزة كبيرة (Featured) وصف قائمة (Row).
 */
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Stars } from "@/components/ui";
import { colors, fontSize, radius, spacing } from "@/constants/theme";
import type { SampleSalon } from "@/constants/sampleData";

function CoverArt({ salon, height }: { salon: SampleSalon; height: number }) {
  return (
    <View style={[styles.cover, { height, backgroundColor: salon.accent }]}>
      <Ionicons name={salon.icon} size={height * 0.42} color={colors.goldSoft} />
      {salon.homeService ? (
        <View style={styles.homeBadge}>
          <Ionicons name="home" size={11} color={colors.ink} />
          <AppText style={styles.homeBadgeText}>منزلي</AppText>
        </View>
      ) : null}
    </View>
  );
}

export function FeaturedSalonCard({ salon, onPress }: { salon: SampleSalon; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.featured, { opacity: pressed ? 0.9 : 1 }]}>
      <CoverArt salon={salon} height={110} />
      <View style={styles.featuredBody}>
        <AppText weight="semibold" style={styles.name} numberOfLines={1}>
          {salon.name}
        </AppText>
        <AppText style={styles.audience} numberOfLines={1}>
          {salon.audienceLabel}
        </AppText>
        <View style={styles.ratingRow}>
          <Stars value={salon.rating} size={12} />
          <AppText style={styles.ratingText}>
            {salon.rating.toFixed(1)} ({salon.reviews})
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

export function SalonRow({ salon, onPress }: { salon: SampleSalon; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.9 : 1 }]}>
      <View style={[styles.rowCover, { backgroundColor: salon.accent }]}>
        <Ionicons name={salon.icon} size={30} color={colors.goldSoft} />
      </View>
      <View style={styles.rowBody}>
        <AppText weight="semibold" style={styles.name} numberOfLines={1}>
          {salon.name}
        </AppText>
        <AppText style={styles.tagline} numberOfLines={1}>
          {salon.tagline}
        </AppText>
        <View style={styles.ratingRow}>
          <Stars value={salon.rating} size={12} />
          <AppText style={styles.ratingText}>
            {salon.rating.toFixed(1)} · {salon.city}
          </AppText>
        </View>
      </View>
      <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cover: { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, alignItems: "center", justifyContent: "center" },
  homeBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  homeBadgeText: { fontSize: 10, color: colors.ink },

  featured: {
    width: 220,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: "hidden",
  },
  featuredBody: { padding: spacing.md, gap: 2 },

  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rowCover: { width: 62, height: 62, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  rowBody: { flex: 1, gap: 3 },

  name: { fontSize: fontSize.base, color: colors.textPrimary },
  audience: { fontSize: fontSize.sm, color: colors.textSecondary },
  tagline: { fontSize: fontSize.sm, color: colors.textSecondary },
  ratingRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6, marginTop: 2 },
  ratingText: { fontSize: fontSize.xs, color: colors.textMuted },
});
