/**
 * Toast — رسائل تأكيد قصيرة أسفل الشاشة (دليل التصميم §7).
 * يُوفَّر عبر ToastProvider ويُستدعى بـ useToast().show(message, type?).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui";
import { fontSize, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";

type ToastType = "success" | "info" | "error";

interface ToastData {
  message: string;
  type: ToastType;
}

interface ToastApi {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastApi>({ show: () => {} });

const ICON: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  info: "information-circle",
  error: "alert-circle",
};

export function ToastProvider({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastData | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, type: ToastType = "success") => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, type });
      opacity.setValue(0);
      translateY.setValue(20);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      ]).start();

      timer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 20, duration: 180, useNativeDriver: true }),
        ]).start(() => setToast(null));
      }, 2600);
    },
    [opacity, translateY],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const bgByType: Record<ToastType, string> = {
    success: colors.success,
    info: colors.ink,
    error: colors.danger,
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            { bottom: insets.bottom + 74, backgroundColor: bgByType[toast.type], opacity, transform: [{ translateY }] },
          ]}
        >
          <Ionicons name={ICON[toast.type]} size={18} color="#fff" />
          <AppText weight="medium" style={styles.text} numberOfLines={2}>
            {toast.message}
          </AppText>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  text: { flex: 1, color: "#fff", fontSize: fontSize.base },
});
