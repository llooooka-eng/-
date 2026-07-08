/**
 * bookingService — عمليات الحجز والدفع والاسترداد (مسار الخادم/Supabase).
 * يتعامل مع Edge Functions (create-payment / refund-payment) ودوال القاعدة،
 * بحيث يبقى حساب المبلغ وأهلية الاسترداد خادمياً بالكامل.
 */
import { supabase } from "@/services/supabase";
import type {
  Booking,
  PaymentIntent,
  PaymentStatus,
  PaymentType,
  Refund,
  RefundMethod,
  RefundPreview,
} from "@/types/database";

/** جلب حجز واحد */
export async function getBooking(id: string): Promise<Booking | null> {
  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

/** حجوزات المستخدم الحالي (الأحدث أولاً) */
export async function listBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("scheduled_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * إنشاء نيّة دفع: تحسب القاعدة المبلغ من الحجز وتُعيد قيم Moyasar SDK.
 * لا يُرسل العميل المبلغ إطلاقاً.
 */
export async function createPaymentIntent(
  bookingId: string,
  paymentType: PaymentType,
): Promise<PaymentIntent> {
  const { data, error } = await supabase.functions.invoke("create-payment", {
    body: { booking_id: bookingId, payment_type: paymentType },
  });
  if (error) throw error;
  return data as PaymentIntent;
}

/**
 * خط الدفاع الثاني: الاستعلام عن حالة الدفعة حتى paid/failed أو انتهاء المهلة.
 * يُستخدم بعد العودة من شاشة الدفع، لأن الـ webhook قد يتأخر.
 */
export async function pollPaymentStatus(
  paymentTransactionId: string,
  opts: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<PaymentStatus> {
  const { timeoutMs = 60_000, intervalMs = 2_500 } = opts;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const { data, error } = await supabase
      .from("payment_transactions")
      .select("status")
      .eq("id", paymentTransactionId)
      .single();
    if (error) throw error;

    const status = data.status as PaymentStatus;
    if (status === "paid" || status === "failed") return status;

    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return "initiated";
}

/**
 * معاينة الاسترداد قبل التأكيد — تعرض للمستخدم كم سيسترد حسب السياسة والوقت.
 * تستدعي دالة evaluate_refund في القاعدة.
 */
export async function previewRefund(bookingId: string): Promise<RefundPreview> {
  const { data, error } = await supabase.rpc("evaluate_refund", {
    p_booking_id: bookingId,
    p_reason: "customer_cancellation",
  });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  return {
    refund_amount: row.refund_amount,
    refund_percentage: row.refund_percentage,
    paid_amount: row.paid_amount,
    hours_remaining: row.hours_remaining,
  };
}

/**
 * تنفيذ الإلغاء والاسترداد. المحفظة لحظية (تُقيَّد خادمياً)،
 * والعكس البنكي يُنفَّذ عبر Moyasar داخل Edge Function.
 */
export async function cancelBooking(
  bookingId: string,
  preferMethod: RefundMethod = "wallet",
): Promise<Refund> {
  const { data, error } = await supabase.functions.invoke("refund-payment", {
    body: { booking_id: bookingId, prefer_method: preferMethod },
  });
  if (error) throw error;
  return (data.refund ?? data) as Refund;
}

/**
 * متابعة تحوّل حالة الحجز لحظياً (مثلاً إلى confirmed بعد نجاح الدفع).
 * يتطلب تفعيل النسخ المتماثل على جدول bookings.
 */
export function subscribeToBookingStatus(
  bookingId: string,
  onChange: (booking: Booking) => void,
): () => void {
  const channel = supabase
    .channel(`booking:${bookingId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "bookings", filter: `id=eq.${bookingId}` },
      (payload) => onChange(payload.new as Booking),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
