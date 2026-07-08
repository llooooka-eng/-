/**
 * MoyasarPaymentSheet — يغلّف نموذج دفع Moyasar الرسمي لـ React Native.
 *
 * يعالج المكوّن CreditCard مدى/البطاقات و3DS داخلياً. المبلغ ومفتاح النشر
 * يأتيان من نيّة الدفع (create-payment) لضمان أن المبلغ خادمي.
 *
 * ملاحظة توافق: طابِق أسماء الخصائص مع إصدار الحزمة المثبّت لديك،
 * فبعض الإصدارات تستخدم onPaymentResult وبعضها onPaymentCompleted.
 * Apple Pay يتطلب حزمة native + development build (لا يعمل في Expo Go).
 */
import { useMemo } from "react";
import { View } from "react-native";
import { CreditCard, PaymentConfig } from "react-native-moyasar-sdk";
import { AppText } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import type { PaymentIntent } from "@/types/database";

interface Props {
  intent: PaymentIntent;
  /** يُستدعى بعد نجاح الدفع بمعرّف الدفعة لدى Moyasar */
  onPaid: (moyasarPaymentId: string) => void;
  /** يُستدعى عند فشل الدفع */
  onFailed: (message: string) => void;
}

export function MoyasarPaymentSheet({ intent, onPaid, onFailed }: Props) {
  const config = useMemo(
    () =>
      new PaymentConfig({
        publishableApiKey: intent.publishable_api_key,
        amount: intent.amount, // بالهللة
        currency: intent.currency,
        description: intent.description,
        metadata: intent.metadata, // تحمل payment_transaction_id ليتحقق منه الـ webhook
        supportedNetworks: ["mada", "visa", "mastercard"],
      }),
    [intent],
  );

  return (
    <View style={{ gap: spacing.md }}>
      <AppText weight="medium" style={{ color: colors.textSecondary }}>
        أدخل بيانات البطاقة (مدى أو ائتمانية)
      </AppText>

      <CreditCard
        paymentConfig={config}
        onPaymentResult={(result: any) => {
          if (result?.status === "paid" || result?.status === "initiated") {
            onPaid(result.id ?? "");
          } else {
            onFailed(result?.message ?? "تعذّر إتمام الدفع");
          }
        }}
      />
    </View>
  );
}
