/**
 * دوال التنسيق — تحويل الهللة إلى ريال وعرض التواريخ بالعربية.
 * كل المبالغ في النظام بالهللة (عدد صحيح). 10000 = 100.00 ريال.
 */
import type { WalletDirection, WalletTxType } from "@/types/database";

/** تنسيق مبلغ بالهللة إلى نص ريال: 15000 => "150.00 ﷼" */
export function formatSAR(halalas: number, opts: { withSymbol?: boolean } = {}): string {
  const { withSymbol = true } = opts;
  const sar = Math.abs(halalas) / 100;
  const [intPart, decPart] = sar.toFixed(2).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const out = `${grouped}.${decPart}`;
  return withSymbol ? `${out} ﷼` : out;
}

/** مبلغ حركة محفظة مع إشارة الاتجاه: credit => "+150.00" ، debit => "−200.00" */
export function formatSignedAmount(direction: WalletDirection, halalas: number): string {
  const sign = direction === "credit" ? "+" : "−";
  return `${sign}${formatSAR(halalas, { withSymbol: false })}`;
}

/** تاريخ ووقت بالعربية (تقويم ميلادي، أرقام لاتينية) */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

/** تاريخ فقط بالعربية (بدون وقت) */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/** وصف زمني نسبي مختصر: اليوم / أمس / قبل n أيام / تاريخ */
export function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (days <= 0) return "اليوم";
  if (days === 1) return "أمس";
  if (days === 2) return "قبل يومين";
  if (days <= 10) return `قبل ${days} أيام`;
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
      day: "numeric",
      month: "long",
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/** تسميات عربية لأنواع حركات المحفظة */
export const walletTxLabel: Record<WalletTxType, string> = {
  refund_credit: "استرداد إلغاء حجز",
  booking_payment: "دفع حجز",
  topup: "شحن المحفظة",
  withdrawal: "سحب رصيد",
  promo_credit: "رصيد ترويجي",
  chargeback_debit: "خصم نزاع",
  admin_adjustment: "تسوية",
};
