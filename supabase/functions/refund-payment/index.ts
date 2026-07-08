/**
 * Edge Function: refund-payment
 * ينفّذ الإلغاء والاسترداد ذرّياً عبر دالة القاعدة process_cancellation،
 * ثم (اختيارياً) يطلق عكساً بنكياً عبر Moyasar عند الاسترداد للبطاقة.
 * يُستدعى من services/bookingService.ts → cancelBooking.
 *
 * النشر: supabase functions deploy refund-payment
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { booking_id, prefer_method } = await req.json();
    if (!booking_id) return json({ error: "booking_id required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );

    // القيد المالي يتم داخل القاعدة ذرّياً (محفظة + سجل + سجل استرداد)
    const { data: refund, error } = await supabase.rpc("process_cancellation", {
      p_booking_id: booking_id,
    });
    if (error) return json({ error: error.message }, 500);

    // ملاحظة: عند prefer_method === 'card' نفّذ هنا عكس Moyasar عبر REST
    // باستخدام MOYASAR_SECRET_KEY على مبلغ refund.amount. (تُرك للتنفيذ حسب حسابك.)

    return json({ refund, prefer_method: prefer_method ?? "wallet" });
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
