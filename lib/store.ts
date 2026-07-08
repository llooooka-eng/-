/**
 * منطق متجر تألق النقي (بلا React) — الحالة والمُحوّلات (reducers).
 *
 * فُصِل هنا ليكون قابلاً للاختبار بمعزل عن الواجهة، ويُستخدم من
 * context/AuthContext.tsx. كل دالة تُعيد حالة جديدة دون تعديل الأصل.
 *
 * قاعدة المال: كل المبالغ بالهللة. المحفظة سجلّ لحركات المحفظة فقط —
 * الدفع بالبطاقة (مدى/Apple Pay) لا يمسّ رصيد المحفظة، بينما الدفع بالمحفظة
 * يخصم منها، والاسترداد عند الإلغاء يُقيَّد دائماً كرصيد في المحفظة (سياسة التصميم).
 */
import { CITIES, DEFAULT_SERVICES, type PaymentMethodId, type SampleService } from "@/constants/sampleData";
import type { WalletTransaction } from "@/types/database";

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
  ratingTags?: string[];
  reminderId?: string;
  createdAt: string;
}

export interface WalletState {
  balance: number; // هللة
  transactions: WalletTransaction[];
}

export interface TalluqDb {
  phone: string | null;
  authed: boolean;
  city: string;
  payMethod: PaymentMethodId;
  bookings: LocalBooking[];
  adminServices: SampleService[];
  wallet: WalletState;
}

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

export const initialDb: TalluqDb = {
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

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const nowIso = () => new Date().toISOString();

/**
 * إنشاء حجز جديد. عند الدفع بالمحفظة: يُخصم المبلغ وتُسجَّل حركة خصم.
 * عند الدفع بالبطاقة: لا تتأثّر المحفظة (ليست حركة محفظة).
 */
export function addBooking(
  db: TalluqDb,
  input: NewBookingInput,
  method: PaymentMethodId,
): { db: TalluqDb; booking: LocalBooking } {
  const booking: LocalBooking = {
    id: uid("bk"),
    ...input,
    status: "upcoming",
    rated: false,
    createdAt: nowIso(),
  };

  let wallet = db.wallet;
  if (method === "wallet") {
    const tx: WalletTransaction = {
      id: uid("tx"),
      amount: input.amount,
      direction: "debit",
      tx_type: "booking_payment",
      description: `دفع من المحفظة · ${input.salonName}`,
      created_at: nowIso(),
    };
    wallet = {
      balance: db.wallet.balance - input.amount,
      transactions: [tx, ...db.wallet.transactions],
    };
  }

  return {
    db: { ...db, bookings: [booking, ...db.bookings], wallet },
    booking,
  };
}

/** إلغاء حجز قادم واسترداد قيمته كرصيد في المحفظة (استرداد كامل). */
export function cancelBooking(db: TalluqDb, id: string): TalluqDb {
  const target = db.bookings.find((b) => b.id === id);
  if (!target || target.status !== "upcoming") return db;

  const refund: WalletTransaction = {
    id: uid("tx"),
    amount: target.amount,
    direction: "credit",
    tx_type: "refund_credit",
    description: `استرداد إلغاء · ${target.salonName}`,
    created_at: nowIso(),
  };

  return {
    ...db,
    bookings: db.bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
    wallet: {
      balance: db.wallet.balance + target.amount,
      transactions: [refund, ...db.wallet.transactions],
    },
  };
}

/** ربط معرّف إشعار التذكير بالحجز (بعد جدولته). */
export function attachReminder(db: TalluqDb, id: string, reminderId: string): TalluqDb {
  return {
    ...db,
    bookings: db.bookings.map((b) => (b.id === id ? { ...b, reminderId } : b)),
  };
}

/** حفظ تقييم حجز (نجوم + وسوم). */
export function rateBooking(
  db: TalluqDb,
  id: string,
  value: number,
  tags: string[] = [],
): TalluqDb {
  return {
    ...db,
    bookings: db.bookings.map((b) =>
      b.id === id ? { ...b, rated: true, ratingValue: value, ratingTags: tags } : b,
    ),
  };
}

/** شحن المحفظة برصيد. */
export function topUp(db: TalluqDb, halalas: number): TalluqDb {
  if (halalas <= 0) return db;
  const tx: WalletTransaction = {
    id: uid("tx"),
    amount: halalas,
    direction: "credit",
    tx_type: "topup",
    description: "شحن المحفظة",
    created_at: nowIso(),
  };
  return {
    ...db,
    wallet: {
      balance: db.wallet.balance + halalas,
      transactions: [tx, ...db.wallet.transactions],
    },
  };
}

/** تقسيم الحجوزات إلى قادمة وسابقة. */
export function partitionBookings(bookings: LocalBooking[]): {
  upcoming: LocalBooking[];
  past: LocalBooking[];
} {
  return {
    upcoming: bookings.filter((b) => b.status === "upcoming"),
    past: bookings.filter((b) => b.status !== "upcoming"),
  };
}
