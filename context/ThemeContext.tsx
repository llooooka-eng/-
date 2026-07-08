/**
 * ThemeContext — يوفّر اللوحة النشطة (فاتح/داكن) لكل التطبيق.
 *
 * الوضع (`mode`) قد يكون: light / dark / system (يتبع إعداد الجهاز).
 * يُخزَّن محلياً تحت `talluq_theme`. تستهلك المكوّنات اللوحة عبر:
 *   const { colors } = useTheme();
 *   const styles = useThemedStyles(makeStyles);
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkColors, lightColors, type AppColors } from "@/constants/theme";

const THEME_KEY = "talluq_theme";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeValue {
  colors: AppColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() ?? "light");

  // استرجاع الوضع المحفوظ
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v === "light" || v === "dark" || v === "system") setModeState(v);
    });
  }, []);

  // متابعة تغيّر إعداد الجهاز
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setSystemScheme(colorScheme ?? "light"),
    );
    return () => sub.remove();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  }, []);

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";

  const value = useMemo<ThemeValue>(
    () => ({ colors: isDark ? darkColors : lightColors, mode, isDark, setMode }),
    [isDark, mode, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/** يبني StyleSheet من مصنع يعتمد على اللوحة النشطة، ويعيد بناءه عند تبديل الثيم. */
export function useThemedStyles<T>(factory: (colors: AppColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
