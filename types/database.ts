/**
 * أنواع البيانات المشتركة بين الواجهة والخادم (Supabase).
 * تُستخدم في طبقة الخدمات الخلفية (services/*) وفي مكوّنات المحفظة والتنسيق.
 *
 * كل المبالغ المالية بالهللة (عدد صحيح): 10000 = 100.00 ريال.
 */

/* ----------------------------- الحجوزات والدفع ---------------------------- */

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type PaymentType = "full" | "deposit";

export type PaymentStatus = "initiated" | "paid" | "failed" | "refunded";

/** صف الحجز في القاعدة */
export interface Booking {
  id: string;
  user_id: string;
  salon_id: string;
  service_id: string | null;
  barber_id: string | null;
  description: string | null;
  scheduled_at: string; // ISO
  location_type: "salon" | "home";
  address: string | null;
  total_amount: number; // هللة
  deposit_amount: number; // هللة
  status: BookingStatus;
  created_at: string;
}

/** قيم تُمرَّر إلى Moyasar SDK، مصدرها Edge Function (create-payment) */
export interface PaymentIntent {
  publishable_api_key: string;
  amount: number; // هللة
  currency: string; // "SAR"
  description: string;
  metadata: Record<string, string>;
  payment_transaction_id: string;
}

/* ----------------------------- الاسترداد ---------------------------- */

export type RefundMethod = "wallet" | "card";

export interface RefundPreview {
  refund_amount: number;
  refund_percentage: number;
  paid_amount: number;
  hours_remaining: number;
}

export interface Refund {
  id: string;
  booking_id: string;
  amount: number;
  method: RefundMethod;
  status: "pending" | "completed" | "failed";
  created_at: string;
}

/* ------------------------------ المحفظة ------------------------------ */

export interface Wallet {
  id: string;
  user_id: string;
  balance: number; // هللة
  currency: string;
  updated_at: string;
}

export type WalletDirection = "credit" | "debit";

export type WalletTxType =
  | "refund_credit"
  | "booking_payment"
  | "topup"
  | "withdrawal"
  | "promo_credit"
  | "chargeback_debit"
  | "admin_adjustment";

export interface WalletTransaction {
  id: string;
  wallet_id?: string;
  amount: number; // هللة (موجب دائماً؛ الاتجاه في direction)
  direction: WalletDirection;
  tx_type: WalletTxType;
  description: string | null;
  created_at: string;
}
