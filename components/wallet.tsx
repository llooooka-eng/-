/**
 * مكوّنات شاشة المحفظة: بطاقة الرصيد (WalletBalanceCard) وصف الحركة (TransactionRow).
 */
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText, IconBadge } from "@/components/ui";
import { fontFamily, fontSize, radius, spacing, type AppColors } from "@/constants/theme";
import { useTheme, useThemedStyles } from "@/context/ThemeContext";
import { formatRelative, formatSAR, formatSignedAmount, walletTxLabel } from "@/lib/format";
import type { WalletTransaction, WalletTxType } from "@/types/database";

/** بطاقة الرصيد الحبرية مع زر الشحن */
export function WalletBalanceCard({ balance, onTopUp }: { balance: number; onTopUp?: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.balanceCard}>
      <AppText style={styles.balanceLabel}>الرصيد المتاح</AppText>
      <View style={styles.balanceRow}>
        <AppText weight="semibold" style={styles.balanceValue}>
          {formatSAR(balance, { withSymbol: false })}
        </AppText>
        <AppText style={styles.balanceCurrency}>﷼</AppText>
      </View>
      <AppText style={styles.balanceHint}>يُستخدم تلقائياً عند حجزك القادم</AppText>

      <Pressable onPress={onTopUp} style={({ pressed }) => [styles.topUp, { opacity: pressed ? 0.85 : 1 }]}>
        <Ionicons name="add" size={16} color="#1A150A" />
        <AppText weight="semibold" style={styles.topUpText}>
          شحن المحفظة
        </AppText>
      </Pressable>
    </View>
  );
}

const TX_ICON: Record<WalletTxType, keyof typeof Ionicons.glyphMap> = {
  refund_credit: "arrow-undo-outline",
  booking_payment: "cut-outline",
  topup: "add-circle-outline",
  withdrawal: "arrow-up-outline",
  promo_credit: "gift-outline",
  chargeback_debit: "alert-circle-outline",
  admin_adjustment: "sync-outline",
};

/** صف حركة واحدة في سجل المحفظة */
export function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isCredit = tx.direction === "credit";
  return (
    <View style={styles.txRow}>
      <View style={styles.txStart}>
        <IconBadge
          name={TX_ICON[tx.tx_type]}
          bg={isCredit ? colors.successBg : colors.pearl}
          color={isCredit ? colors.success : colors.goldDark}
        />
        <View>
          <AppText style={styles.txTitle}>{tx.description || walletTxLabel[tx.tx_type]}</AppText>
          <AppText style={styles.txDate}>{formatRelative(tx.created_at)}</AppText>
        </View>
      </View>
      <AppText weight="semibold" style={[styles.txAmount, { color: isCredit ? colors.success : colors.textPrimary }]}>
        {formatSignedAmount(tx.direction, tx.amount)}
      </AppText>
    </View>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    balanceCard: { backgroundColor: colors.ink, borderRadius: radius.xl, padding: spacing.lg },
    balanceLabel: { color: colors.goldSoft, fontSize: fontSize.sm, marginBottom: spacing.xs },
    balanceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
    balanceValue: { color: colors.gold, fontSize: fontSize.display },
    balanceCurrency: { color: colors.gold, fontSize: fontSize.lg, fontFamily: fontFamily.medium },
    balanceHint: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.sm },
    topUp: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: colors.gold,
      borderRadius: radius.md,
      paddingVertical: 11,
      marginTop: spacing.md,
    },
    topUpText: { color: "#1A150A", fontSize: fontSize.md },

    txRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
    },
    txStart: { flexDirection: "row", alignItems: "center", gap: 10 },
    txTitle: { fontSize: fontSize.md, color: colors.textPrimary },
    txDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
    txAmount: { fontSize: fontSize.base },
  });
