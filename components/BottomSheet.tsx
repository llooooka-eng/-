/**
 * BottomSheet — شيت سفلي قابل لإعادة الاستخدام (دليل التصميم §7).
 * زاوية علوية كبيرة، مقبض 40×4، خلفية معتّمة، إغلاق باللمس خارجه.
 */
import type { PropsWithChildren } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui";
import { fontSize, radius, spacing, type AppColors } from "@/constants/theme";
import { useThemedStyles } from "@/context/ThemeContext";

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: PropsWithChildren<{ visible: boolean; onClose: () => void; title?: string }>) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* إيقاف انتشار اللمس داخل الشيت */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          {title ? (
            <AppText weight="semibold" style={styles.title}>
              {title}
            </AppText>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(14,15,19,0.48)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.pearlSoft,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
    title: { fontSize: fontSize.lg, marginBottom: spacing.lg, textAlign: "center" },
  });
