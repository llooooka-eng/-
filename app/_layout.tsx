/**
 * التخطيط الجذري لتطبيق تألق:
 * - يفرض اتجاه RTL (يحتاج إعادة تشغيل مرة واحدة عند أول إقلاع).
 * - يحمّل خطوط IBM Plex Sans Arabic قبل إظهار الواجهة.
 * - يلفّ التطبيق بـ AuthProvider و SafeAreaProvider.
 * - يوجّه المستخدم بين مجموعة المصادقة والتبويبات حسب حالة الدخول.
 */
import { useEffect } from "react";
import { I18nManager } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  useFonts,
} from "@expo-google-fonts/ibm-plex-sans-arabic";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { colors } from "@/constants/theme";

// افرض RTL مرة واحدة (يتطلب إعادة تشغيل التطبيق ليأخذ مفعوله كاملاً)
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

SplashScreen.preventAutoHideAsync();

/** يوجّه بين (auth) و(tabs) بناءً على حالة الدخول */
function RootNavigator() {
  const { authed, ready } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!authed && !inAuthGroup) {
      router.replace("/(auth)");
    } else if (authed && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [authed, ready, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.pearl } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="salon/[id]" options={{ presentation: "card" }} />
      <Stack.Screen name="booking/new" options={{ presentation: "card" }} />
      <Stack.Screen name="booking/confirm" options={{ presentation: "card" }} />
      <Stack.Screen name="rate/[id]" options={{ presentation: "modal" }} />
      <Stack.Screen name="dashboard" options={{ presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
