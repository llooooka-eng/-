/**
 * المحفظة — بطاقة الرصيد وسجل الحركات (وضع العرض، بيانات محلية).
 * يعيد استخدام المكوّنات العرضية WalletBalanceCard و TransactionRow.
 * مسار الخادم البديل في hooks/useWallet + services/walletService.
 */
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { AppText, EmptyState, Screen } from "@/components/ui";
import { BottomSheet } from "@/components/BottomSheet";
import { useToast } from "@/components/Toast";
import { TransactionRow, WalletBalanceCard } from "@/components/wallet";
import { useAuth } from "@/context/AuthContext";
import { useThemedStyles } from "@/context/ThemeContext";
import { fontSize, radius, spacing, type AppColors } from "@/constants/theme";
import { formatSAR } from "@/lib/format";
import type { WalletTransaction } from "@/types/database";

const TOPUP_OPTIONS = [5000, 10000, 20000, 50000]; // بالهللة

export default function WalletScreen() {
  const { wallet, topUp } = useAuth();
  const styles = useThemedStyles(makeStyles);
  const toast = useToast();
  const [topUpOpen, setTopUpOpen] = useState(false);

  const renderHeader = () => (
    <View style={styles.header}>
      <AppText weight="semibold" style={styles.pageTitle}>
        محفظتي
      </AppText>
      <WalletBalanceCard balance={wallet.balance} onTopUp={() => setTopUpOpen(true)} />
      <AppText weight="semibold" style={styles.sectionTitle}>
        آخر الحركات
      </AppText>
    </View>
  );

  return (
    <Screen>
      <FlatList<WalletTransaction>
        data={wallet.transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionRow tx={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="لا توجد حركات بعد" />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* شحن المحفظة */}
      <BottomSheet visible={topUpOpen} onClose={() => setTopUpOpen(false)} title="اختر مبلغ الشحن">
        <View style={styles.amountsGrid}>
          {TOPUP_OPTIONS.map((amt) => (
            <Pressable
              key={amt}
              style={styles.amountBtn}
              onPress={() => {
                topUp(amt);
                setTopUpOpen(false);
                toast.show(`تم شحن ${formatSAR(amt)} لمحفظتك`);
              }}
            >
              <AppText weight="semibold" style={styles.amountText}>
                {formatSAR(amt)}
              </AppText>
            </Pressable>
          ))}
        </View>
        <AppText style={styles.sheetHint}>الشحن فوري في وضع العرض · يربط بمدى/Apple Pay في الإنتاج</AppText>
      </BottomSheet>
    </Screen>
  );
}

const makeStyles = (colors: AppColors) => StyleSheet.create({
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  header: { paddingTop: spacing.md },
  pageTitle: { fontSize: fontSize.xl, marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.base, marginTop: spacing.xl, marginBottom: spacing.xs },

  amountsGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.md, justifyContent: "space-between" },
  amountBtn: {
    width: "47%",
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  amountText: { fontSize: fontSize.lg, color: colors.textPrimary },
  sheetHint: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: "center", marginTop: spacing.lg },
});
