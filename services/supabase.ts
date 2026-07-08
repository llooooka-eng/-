/**
 * عميل Supabase — مسار الإنتاج (اختياري).
 *
 * وضع العرض الافتراضي لا يحتاجه (البيانات محلية عبر context/AuthContext).
 * لتفعيل الخادم: ضع supabaseUrl و supabaseAnonKey في app.json ضمن `expo.extra`
 * (أو متغيّرات بيئة EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY).
 */
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

const extra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  // تحذير غير قاطع: وضع العرض يعمل دون هذه القيم.
  console.warn(
    "[Talluq] Supabase غير مُهيّأ — التطبيق يعمل في وضع العرض المحلي. " +
      "أضف supabaseUrl/supabaseAnonKey في app.json لتفعيل مسار الخادم.",
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "public-anon-placeholder",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
