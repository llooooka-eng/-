/**
 * الرئيسية — تحية + مُبدّل المدينة + بحث + تصنيفات + صالونات مميّزة/قريبة.
 */
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Chip, EmptyState, Screen } from "@/components/ui";
import { BottomSheet } from "@/components/BottomSheet";
import { useToast } from "@/components/Toast";
import { FeaturedSalonCard, SalonRow } from "@/components/SalonCard";
import { useAuth } from "@/context/AuthContext";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";
import { CATEGORIES, CITIES, SALONS, type Category } from "@/constants/sampleData";
import { fontFamily, fontSize, radius, spacing, type AppColors } from "@/constants/theme";

export default function HomeScreen() {
  const { city, setCity } = useAuth();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category["id"] | null>(null);
  const [cityOpen, setCityOpen] = useState(false);

  const filtered = useMemo(() => {
    return SALONS.filter((s) => {
      if (query && !s.name.includes(query.trim()) && !s.tagline.includes(query.trim())) return false;
      if (category === "home") return s.homeService;
      if (category === "family") return s.audience === "family";
      if (category) return s.audience === category || s.audience === "family";
      return true;
    });
  }, [query, category]);

  const featured = filtered.filter((s) => s.featured);
  const nearby = filtered.filter((s) => s.city === city);
  const others = filtered.filter((s) => s.city !== city);
  const list = [...nearby, ...others];

  const goToSalon = (id: string) => router.push(`/salon/${id}`);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* الترويسة */}
        <View style={styles.header}>
          <View>
            <AppText style={styles.greeting}>مساء التألق ✨</AppText>
            <AppText weight="semibold" style={styles.headerTitle}>
              أين ترغب أن تتألّق اليوم؟
            </AppText>
          </View>
          <Pressable style={styles.cityBtn} onPress={() => setCityOpen(true)}>
            <Ionicons name="location-outline" size={15} color={colors.goldDark} />
            <AppText weight="medium" style={styles.cityText}>
              {city}
            </AppText>
            <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* بحث */}
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث عن صالون أو خدمة"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            textAlign="right"
          />
        </View>

        {/* تصنيفات */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          <Chip label="الكل" active={category === null} onPress={() => setCategory(null)} />
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              icon={c.icon}
              active={category === c.id}
              onPress={() => setCategory(category === c.id ? null : c.id)}
            />
          ))}
        </ScrollView>

        {/* صالونات مميّزة */}
        {featured.length > 0 && (
          <>
            <SectionTitle title="صالونات مميّزة" />
            <FlatList
              horizontal
              inverted
              data={featured}
              keyExtractor={(s) => s.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              renderItem={({ item }) => (
                <View style={{ marginLeft: spacing.md }}>
                  <FeaturedSalonCard salon={item} onPress={() => goToSalon(item.id)} />
                </View>
              )}
            />
          </>
        )}

        {/* قريبة منك / كل الصالونات */}
        <SectionTitle title={nearby.length ? `في ${city} وحولها` : "كل الصالونات"} />
        <View style={styles.listWrap}>
          {list.length ? (
            list.map((s) => <SalonRow key={s.id} salon={s} onPress={() => goToSalon(s.id)} />)
          ) : (
            <EmptyState icon="search-outline" title="لا توجد نتائج مطابقة" />
          )}
        </View>
      </ScrollView>

      {/* مُبدّل المدينة */}
      <BottomSheet visible={cityOpen} onClose={() => setCityOpen(false)} title="اختر مدينتك">
        {CITIES.map((c) => (
          <Pressable
            key={c}
            style={styles.cityRow}
            onPress={() => {
              setCity(c);
              setCityOpen(false);
              if (c !== city) toast.show(`تم اختيار ${c}`, "info");
            }}
          >
            <AppText style={{ fontSize: fontSize.base }}>{c}</AppText>
            {c === city ? <Ionicons name="checkmark" size={18} color={colors.gold} /> : null}
          </Pressable>
        ))}
      </BottomSheet>
    </Screen>
  );
}

function SectionTitle({ title }: { title: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <AppText weight="semibold" style={styles.sectionTitle}>
      {title}
    </AppText>
  );
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  header: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  greeting: { color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 2 },
  headerTitle: { fontSize: fontSize.xl, maxWidth: 230 },
  cityBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  cityText: { fontSize: fontSize.sm, color: colors.textPrimary },
  search: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  searchInput: { flex: 1, fontFamily: fontFamily.regular, fontSize: fontSize.base, color: colors.textPrimary },
  categories: { flexDirection: "row-reverse", gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, paddingHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.md },
  featuredList: { paddingLeft: spacing.xl, paddingRight: spacing.md },
  listWrap: { paddingHorizontal: spacing.xl },
  cityRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSoft,
  },
});
