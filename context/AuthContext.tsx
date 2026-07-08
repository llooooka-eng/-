/**
 * متجر التطبيق المركزي لـ«تألق».
 *
 * يوفّر حالة المصادقة (رقم الجوال + جلسة) وبيانات المستخدم (الحجوزات، المحفظة،
 * المدينة، طريقة الدفع، خدمات صاحب الصالون) ويُخزّنها محلياً في AsyncStorage
 * تحت مفتاح واحد `talluq_db_v1` — تماماً كما يصف دليل التصميم (§9).
 *
 * منطق الأعمال النقي في lib/store.ts (قابل للاختبار). هذا الملف يغلّفه بحالة React
 * والتخزين. طبقة Supabase/Moyasar في services/* و hooks/* كمسار الإنتاج (README).
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PaymentMethodId, SampleService } from "@/constants/sampleData";
import * as store from "@/lib/store";
import type { LocalBooking, NewBookingInput, TalluqDb, WalletState } from "@/lib/store";

export type { LocalBooking, NewBookingInput } from "@/lib/store";

const DB_KEY = "talluq_db_v1";

interface StoreValue {
  ready: boolean;
  // auth
  phone: string | null;
  authed: boolean;
  loading: boolean;
  user: { id: string } | null;
  session: null;
  signIn: (phone: string) => void;
  verifyOtp: (code: string) => boolean;
  signOut: () => Promise<void>;
  // preferences
  city: string;
  setCity: (city: string) => void;
  payMethod: PaymentMethodId;
  setPayMethod: (m: PaymentMethodId) => void;
  // bookings
  bookings: LocalBooking[];
  upcomingBookings: LocalBooking[];
  pastBookings: LocalBooking[];
  addBooking: (input: NewBookingInput, method: PaymentMethodId) => LocalBooking;
  attachReminder: (id: string, reminderId: string) => void;
  cancelBooking: (id: string) => void;
  rateBooking: (id: string, value: number, tags?: string[]) => void;
  // wallet
  wallet: WalletState;
  topUp: (halalas: number) => void;
  // salon owner
  adminServices: SampleService[];
  saveAdminServices: (services: SampleService[]) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [db, setDb] = useState<TalluqDb>(store.initialDb);
  const [ready, setReady] = useState(false);

  // تحميل القاعدة عند الإقلاع
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(DB_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<TalluqDb>;
          setDb({ ...store.initialDb, ...parsed, wallet: { ...store.initialDb.wallet, ...parsed.wallet } });
        }
      } catch {
        // تجاهل — نبدأ بقاعدة نظيفة
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // حفظ تلقائي عند أي تغيير (بعد اكتمال التحميل)
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(DB_KEY, JSON.stringify(db)).catch(() => {});
  }, [db, ready]);

  const patch = useCallback((fn: (prev: TalluqDb) => TalluqDb) => setDb(fn), []);

  /* --------------------------- المصادقة --------------------------- */
  const signIn = useCallback((phone: string) => patch((prev) => ({ ...prev, phone })), [patch]);

  // أي رمز من 4 خانات يُقبل في وضع العرض
  const verifyOtp = useCallback(
    (code: string) => {
      if (!/^\d{4}$/.test(code)) return false;
      patch((prev) => ({ ...prev, authed: true }));
      return true;
    },
    [patch],
  );

  const signOut = useCallback(async () => patch((prev) => ({ ...prev, authed: false })), [patch]);

  /* --------------------------- التفضيلات --------------------------- */
  const setCity = useCallback((city: string) => patch((prev) => ({ ...prev, city })), [patch]);
  const setPayMethod = useCallback(
    (payMethod: PaymentMethodId) => patch((prev) => ({ ...prev, payMethod })),
    [patch],
  );

  /* --------------------------- الحجوزات والمحفظة --------------------------- */
  const addBooking = useCallback(
    (input: NewBookingInput, method: PaymentMethodId): LocalBooking => {
      const result = store.addBooking(db, input, method);
      setDb(result.db);
      return result.booking;
    },
    [db],
  );

  const attachReminder = useCallback(
    (id: string, reminderId: string) => patch((prev) => store.attachReminder(prev, id, reminderId)),
    [patch],
  );

  const cancelBooking = useCallback((id: string) => patch((prev) => store.cancelBooking(prev, id)), [patch]);

  const rateBooking = useCallback(
    (id: string, value: number, tags?: string[]) => patch((prev) => store.rateBooking(prev, id, value, tags)),
    [patch],
  );

  const topUp = useCallback((halalas: number) => patch((prev) => store.topUp(prev, halalas)), [patch]);

  /* --------------------------- صاحب الصالون --------------------------- */
  const saveAdminServices = useCallback(
    (adminServices: SampleService[]) => patch((prev) => ({ ...prev, adminServices })),
    [patch],
  );

  const value = useMemo<StoreValue>(() => {
    const { upcoming, past } = store.partitionBookings(db.bookings);
    return {
      ready,
      phone: db.phone,
      authed: db.authed,
      loading: !ready,
      user: db.authed && db.phone ? { id: db.phone } : null,
      session: null,
      signIn,
      verifyOtp,
      signOut,
      city: db.city,
      setCity,
      payMethod: db.payMethod,
      setPayMethod,
      bookings: db.bookings,
      upcomingBookings: upcoming,
      pastBookings: past,
      addBooking,
      attachReminder,
      cancelBooking,
      rateBooking,
      wallet: db.wallet,
      topUp,
      adminServices: db.adminServices,
      saveAdminServices,
    };
  }, [
    db,
    ready,
    signIn,
    verifyOtp,
    signOut,
    setCity,
    setPayMethod,
    addBooking,
    attachReminder,
    cancelBooking,
    rateBooking,
    topUp,
    saveAdminServices,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/** الوصول إلى متجر التطبيق (مصادقة + بيانات) */
export function useAuth(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** اسم بديل أوضح لنفس المتجر */
export const useStore = useAuth;
