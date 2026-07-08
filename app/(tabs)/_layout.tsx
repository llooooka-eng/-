/**
 * شريط التبويبات السفلي — الرئيسية، حجوزاتي، المحفظة، حسابي.
 */
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fontFamily } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.goldDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fontFamily.medium, fontSize: 10 },
        tabBarStyle: {
          backgroundColor: colors.pearlSoft,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 62,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "الرئيسية", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="bookings"
        options={{ title: "حجوزاتي", tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="wallet"
        options={{ title: "المحفظة", tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: "حسابي", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
