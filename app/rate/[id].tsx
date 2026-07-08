/**
 * تقييم التجربة — نجوم + وسوم اختيارية.
 */
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Button, Chip, Header, Screen } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { colors, fontSize, spacing } from "@/constants/theme";

const TAGS = ["نظافة ممتازة", "حلاق محترف", "التزام بالموعد", "أجواء مريحة", "سعر مناسب", "سأعود مجدداً"];

export default function RateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookings, rateBooking } = useAuth();
  const toast = useToast();
  const booking = bookings.find((b) => b.id === id);

  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);

  const toggle = (t: string) => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const submit = () => {
    if (!id || stars === 0) return;
    rateBooking(id, stars, tags);
    toast.show("شكراً لتقييمك ✨");
    router.back();
  };

  return (
    <Screen>
      <Header title="قيّم تجربتك" onBack={() => router.back()} />
      <View style={styles.body}>
        <AppText weight="semibold" style={styles.salon}>
          {booking?.salonName ?? "الصالون"}
        </AppText>
        <AppText style={styles.sub}>كيف كانت تجربتك؟</AppText>

        {/* النجوم */}
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Pressable key={i} onPress={() => setStars(i)} hitSlop={6}>
              <Ionicons
                name={i <= stars ? "star" : "star-outline"}
                size={40}
                color={colors.gold}
              />
            </Pressable>
          ))}
        </View>

        {/* الوسوم */}
        <AppText weight="medium" style={styles.tagsTitle}>
          ما الذي أعجبك؟
        </AppText>
        <View style={styles.tags}>
          {TAGS.map((t) => (
            <Chip key={t} label={t} active={tags.includes(t)} onPress={() => toggle(t)} />
          ))}
        </View>

        <View style={{ flex: 1 }} />
        <Button title="إرسال التقييم" onPress={submit} disabled={stars === 0} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  salon: { fontSize: fontSize.xl, textAlign: "center" },
  sub: { color: colors.textSecondary, fontSize: fontSize.base, textAlign: "center", marginTop: spacing.xs },
  stars: { flexDirection: "row-reverse", justifyContent: "center", gap: spacing.sm, marginVertical: spacing.xl },
  tagsTitle: { fontSize: fontSize.base, marginBottom: spacing.md },
  tags: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm },
});
