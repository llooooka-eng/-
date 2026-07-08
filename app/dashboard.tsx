/**
 * لوحة صاحب الصالون — إدارة قائمة خدمات «غرفة الحبر».
 * الخدمات المحفوظة هنا تصبح فوراً الخدمات التي يحجز منها العميل (مربوطة).
 */
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText, Button, Card, Header, Screen } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import type { SampleService } from "@/constants/sampleData";
import { colors, fontFamily, fontSize, radius, spacing } from "@/constants/theme";
import { formatSAR } from "@/lib/format";

const uid = () => `svc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export default function DashboardScreen() {
  const { adminServices, saveAdminServices } = useAuth();
  const [list, setList] = useState<SampleService[]>(adminServices);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(""); // بالريال
  const [dur, setDur] = useState("");

  const dirty = JSON.stringify(list) !== JSON.stringify(adminServices);

  const add = () => {
    const priceNum = Number(price);
    const durNum = Number(dur);
    if (!name.trim() || !priceNum || !durNum) {
      Alert.alert("بيانات ناقصة", "أدخل اسم الخدمة والسعر والمدة");
      return;
    }
    setList((prev) => [...prev, { id: uid(), name: name.trim(), price: priceNum * 100, dur: durNum }]);
    setName("");
    setPrice("");
    setDur("");
  };

  const remove = (id: string) => setList((prev) => prev.filter((s) => s.id !== id));

  const save = () => {
    saveAdminServices(list);
    Alert.alert("تم الحفظ", "نُشرت الخدمات للعملاء في صفحة غرفة الحبر", [
      { text: "حسناً", onPress: () => router.back() },
    ]);
  };

  return (
    <Screen>
      <Header title="إدارة الخدمات" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.info}>
          <Ionicons name="information-circle-outline" size={16} color={colors.goldDark} />
          <AppText style={styles.infoText}>
            الخدمات هنا تظهر مباشرة للعملاء في صفحة «غرفة الحبر»
          </AppText>
        </View>

        {/* القائمة الحالية */}
        {list.map((s) => (
          <Card key={s.id} style={styles.serviceCard}>
            <View style={{ flex: 1 }}>
              <AppText weight="medium" style={{ fontSize: fontSize.base }}>
                {s.name}
              </AppText>
              <AppText style={styles.serviceMeta}>
                {s.dur} دقيقة · {formatSAR(s.price)}
              </AppText>
            </View>
            <Pressable onPress={() => remove(s.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </Card>
        ))}

        {/* إضافة خدمة */}
        <AppText weight="semibold" style={styles.addTitle}>
          إضافة خدمة جديدة
        </AppText>
        <View style={styles.form}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="اسم الخدمة (مثال: قصة كلاسيكية)"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            textAlign="right"
          />
          <View style={styles.formRow}>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="السعر (ريال)"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              style={[styles.input, { flex: 1 }]}
              textAlign="right"
            />
            <TextInput
              value={dur}
              onChangeText={setDur}
              placeholder="المدة (دقيقة)"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              style={[styles.input, { flex: 1 }]}
              textAlign="right"
            />
          </View>
          <Button title="أضف الخدمة" variant="outline" onPress={add} icon="add" />
        </View>

        <View style={{ height: spacing.xl }} />
        <Button title="حفظ ونشر" onPress={save} disabled={!dirty} icon="checkmark" />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, paddingTop: spacing.md },
  info: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.pearl,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: { fontSize: fontSize.xs, color: colors.goldDark, flex: 1 },
  serviceCard: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.md, marginBottom: spacing.md, paddingVertical: spacing.md },
  serviceMeta: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  addTitle: { fontSize: fontSize.base, marginTop: spacing.lg, marginBottom: spacing.md },
  form: { gap: spacing.md },
  formRow: { flexDirection: "row-reverse", gap: spacing.md },
  input: {
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 48,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
});
