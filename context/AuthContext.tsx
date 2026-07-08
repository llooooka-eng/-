/**
 * متجر التطبيق المركزي لـ«تألق».
 *
 * يوفّر حالة المصادقة (رقم الجوال + جلسة) وبيانات المستخدم (الحجوزات، المحفظة،
 * المدينة، طريقة الدفع، خدمات صاحب الصالون) ويُخزّنها محلياً في AsyncStorage
 * تحت مفتاح واحد `talluq_db_v1` — تماماً كما يصف دليل التصميم (§9).
 *
 * هذا هو «وضع العرض» الذي يعمل دون خادم. طبقة Supabase/Moyasar موجودة في
 * services/* و hooks/* و integrations/backend كمسار الإنتاج (انظر README).
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
import { CITIES, DEFAULT_SERVICES, type PaymentMethodId, type SampleService } from "@/constants/sampleData";
import type { WalletTransaction } from "@/types/database";

const DB_KEY = "talluq_db_v1";

export interface LocalBooking {
  id: string;
  salonId: string;
  salonName: string;
  serviceId: string;
  serviceName: string;
  barberName: string;
  scheduledAt: string; // ISO
  locationType: "salon" | "home";
  address?: string;
  amount: number; // هللة
  status: "upcoming" | "completed" | "cancelled";
  rated: boolean;
  ratingValue?: number;
  createdAt: string;
}

interface WalletState {
  balance: number; // هللة
  transactions: WalletTransaction[];
}

interface TalluqDb {
  phone: string | null;
  authed: boolean;
  city: string;
  payMethod: PaymentMethodId;
  bookings: LocalBooking[];
  adminServices: SampleService[];
  wallet: WalletState;
}

const initialDb: TalluqDb = {
  phone: null,
  authed: false,
  city: CITIES[0],
  payMethod: "mada",
  bookings: [],
  adminServices: DEFAULT_SERVICES,
  wallet: {
    balance: 12000, // 120.00 ﷼ رصيد ترحيبي
    transactions: [
      {
        id: "seed-promo",
        amount: 12000,
        direction: "credit",
        tx_type: "promo_credit",
        description: "رصيد ترحيبي من تألق",
        created_at: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      },
    ],
  },
};

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export interface NewBookingInput {
  salonId: string;
  salonName: string;
  serviceId: string;
  serviceName: string;
  barberName: string;
  scheduledAt: string;
  locationType: "salon" | "home";
  address?: string;
  amount: number;
}

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
  addBooking: (input: NewBookingInput) => LocalBooking;
  cancelBooking: (id: string) => void;
  rateBooking: (id: string, value: number) => void;
  // wallet
  wallet: WalletState;
  topUp: (halalas: number) => void;
  // salon owner
  adminServices: SampleService[];
  saveAdminServices: (services: SampleService[]) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [db, setDb] = useState<TalluqDb>(initialDb);
  const [ready, setReady] = useState(false);

  // تحميل القاعدة عند الإقلاع
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(DB_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<TalluqDb>;
          setDb({ ...initialDb, ...parsed, wallet: { ...initialDb.wallet, ...parsed.wallet } });
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
  const signIn = useCallback((phone: string) => {
    patch((prev) => ({ ...prev, phone }));
  }, [patch]);

  // أي رمز من 4 خانات يُقبل في وضع العرض
  const verifyOtp = useCallback((code: string) => {
    if (!/^\d{4}$/.test(code)) return false;
    patch((prev) => ({ ...prev, authed: true }));
    return true;
  }, [patch]);

  const signOut = useCallback(async () => {
    patch((prev) => ({ ...prev, authed: false }));
  }, [patch]);

  /* --------------------------- التفضيلات --------------------------- */
  const setCity = useCallback((city: string) => patch((prev) => ({ ...prev, city })), [patch]);
  const setPayMethod = useCallback(
    (payMethod: PaymentMethodId) => patch((prev) => ({ ...prev, payMethod })),
    [patch],
  );

  /* --------------------------- الحجوزات --------------------------- */
  const addBooking = useCallback(
    (input: NewBookingInput): LocalBooking => {
      const booking: LocalBooking = {
        id: uid("bk"),
        ...input,
        status: "upcoming",
        rated: false,
        createdAt: new Date().toISOString(),
      };
      const tx: WalletTransaction = {
        id: uid("tx"),
        amount: input.amount,
        direction: "debit",
        tx_type: "booking_payment",
        description: `دفع حجز · ${input.salonName}`,
        created_at: new Date().toISOString(),
      };
      patch((prev) => ({
        ...prev,
        bookings: [booking, ...prev.bookings],
        wallet: {
          balance: prev.wallet.balance,
          transactions: [tx, ...prev.wallet.transactions],
        },
      }));
      return booking;
    },
    [patch],
  );

  const cancelBooking = useCallback(
    (id: string) => {
      patch((prev) => {
        const target = prev.bookings.find((b) => b.id === id);
        if (!target || target.status !== "upcoming") return prev;
        // استرداد كامل للمحفظة (سياسة العرض)
        const refund: WalletTransaction = {
          id: uid("tx"),
          amount: target.amount,
          direction: "credit",
          tx_type: "refund_credit",
          description: `استرداد إلغاء · ${target.salonName}`,
          created_at: new Date().toISOString(),
        };
        return {
          ...prev,
          bookings: prev.bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
          wallet: {
            balance: prev.wallet.balance + target.amount,
            transactions: [refund, ...prev.wallet.transactions],
          },
        };
      });
    },
    [patch],
  );

  const rateBooking = useCallback(
    (id: string, value: number) => {
      patch((prev) => ({
        ...prev,
        bookings: prev.bookings.map((b) =>
          b.id === id ? { ...b, rated: true, ratingValue: value } : b,
        ),
      }));
    },
    [patch],
  );

  /* --------------------------- المحفظة --------------------------- */
  const topUp = useCallback(
    (halalas: number) => {
      if (halalas <= 0) return;
      const tx: WalletTransaction = {
        id: uid("tx"),
        amount: halalas,
        direction: "credit",
        tx_type: "topup",
        description: "شحن المحفظة",
        created_at: new Date().toISOString(),
      };
      patch((prev) => ({
        ...prev,
        wallet: {
          balance: prev.wallet.balance + halalas,
          transactions: [tx, ...prev.wallet.transactions],
        },
      }));
    },
    [patch],
  );

  /* --------------------------- صاحب الصالون --------------------------- */
  const saveAdminServices = useCallback(
    (adminServices: SampleService[]) => patch((prev) => ({ ...prev, adminServices })),
    [patch],
  );

  const value = useMemo<StoreValue>(() => {
    const upcomingBookings = db.bookings.filter((b) => b.status === "upcoming");
    const pastBookings = db.bookings.filter((b) => b.status !== "upcoming");
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
      upcomingBookings,
      pastBookings,
      addBooking,
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
