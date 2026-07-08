/**
 * walletService — التعامل مع محفظة المستخدم في Supabase (مسار الخادم).
 *
 * مبدأ أمني مهم: العميل لا يكتب في المحفظة إطلاقاً. القيد (الإضافة/الخصم)
 * يتم خادمياً عبر دالة process_cancellation داخل القاعدة. هذه الخدمة تقرأ
 * الرصيد والحركات فقط، وتشترك في التحديثات اللحظية. RLS تقصر كل شيء على المالك.
 */
import { supabase } from "@/services/supabase";
import type { Wallet, WalletTransaction } from "@/types/database";

/** جلب محفظة المستخدم الحالي (قد تكون null قبل أول عملية) */
export async function getWallet(): Promise<Wallet | null> {
  const { data, error } = await supabase.from("wallets").select("*").maybeSingle();
  if (error) throw error;
  return data;
}

/** الرصيد الحالي بالهللة (0 إن لم تُنشأ المحفظة بعد) */
export async function getBalance(): Promise<number> {
  const wallet = await getWallet();
  return wallet?.balance ?? 0;
}

/**
 * سجلّ الحركات بترقيم keyset (الأحدث أولاً).
 * للصفحة التالية مرّر created_at لآخر حركة في `before`.
 */
export async function listTransactions(
  opts: { limit?: number; before?: string } = {},
): Promise<WalletTransaction[]> {
  const { limit = 20, before } = opts;
  let query = supabase
    .from("wallet_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) query = query.lt("created_at", before);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * الاشتراك في تحديثات رصيد المحفظة لحظياً (Realtime).
 * يتطلب تفعيل النسخ المتماثل على جدول wallets في لوحة Supabase.
 * يُعيد دالة لإلغاء الاشتراك.
 */
export function subscribeToWallet(userId: string, onChange: (wallet: Wallet) => void): () => void {
  const channel = supabase
    .channel(`wallet:${userId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "wallets", filter: `user_id=eq.${userId}` },
      (payload) => onChange(payload.new as Wallet),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
