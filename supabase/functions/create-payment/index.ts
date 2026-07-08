/**
 * Edge Function: create-payment
 * ينشئ نيّة دفع Moyasar بمبلغ محسوب خادمياً من الحجز — لا يثق بأي مبلغ من العميل.
 * يُستدعى من services/bookingService.ts → createPaymentIntent.
 *
 * النشر: supabase functions deploy create-payment
 * المتغيّرات المطلوبة: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *                       MOYASAR_PUBLISHABLE_KEY
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { booking_id, payment_type } = await req.json();
    if (!booking_id) return json({ error: "booking_id required" }, 400);

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // المبلغ يُحسب من الحجز في القاعدة (خادمياً)
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, user_id, total_amount, deposit_amount, description")
      .eq("id", booking_id)
      .single();
    if (error || !booking) return json({ error: "booking not found" }, 404);

    const amount = payment_type === "deposit" ? booking.deposit_amount : booking.total_amount;

    // سجّل معاملة الدفع (initiated) ليتحقّق منها الـ webhook لاحقاً
    const { data: tx, error: txErr } = await supabase
      .from("payment_transactions")
      .insert({
        booking_id: booking.id,
        user_id: booking.user_id,
        amount,
        payment_type: payment_type ?? "full",
        status: "initiated",
      })
      .select("id")
      .single();
    if (txErr || !tx) return json({ error: "could not create transaction" }, 500);

    // قيم Moyasar SDK — المفتاح للنشر فقط (publishable)، آمن على العميل
    return json({
      publishable_api_key: Deno.env.get("MOYASAR_PUBLISHABLE_KEY"),
      amount,
      currency: "SAR",
      description: booking.description ?? "حجز تألق",
      metadata: { payment_transaction_id: tx.id, booking_id: booking.id },
      payment_transaction_id: tx.id,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
