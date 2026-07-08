import {
  addBooking,
  attachReminder,
  cancelBooking,
  initialDb,
  partitionBookings,
  rateBooking,
  topUp,
  type NewBookingInput,
  type TalluqDb,
} from "@/lib/store";

const sampleInput = (over: Partial<NewBookingInput> = {}): NewBookingInput => ({
  salonId: "salon-ink",
  salonName: "غرفة الحبر",
  serviceId: "svc-classic",
  serviceName: "قصة كلاسيكية",
  barberName: "خالد الحربي",
  scheduledAt: new Date("2026-07-10T10:00:00Z").toISOString(),
  locationType: "salon",
  amount: 6000,
  ...over,
});

/** قاعدة بداية نظيفة لكل اختبار */
const freshDb = (): TalluqDb => JSON.parse(JSON.stringify(initialDb));

describe("initialDb", () => {
  it("يبدأ برصيد ترحيبي 120 ﷼ وحركة واحدة", () => {
    expect(initialDb.wallet.balance).toBe(12000);
    expect(initialDb.wallet.transactions).toHaveLength(1);
    expect(initialDb.wallet.transactions[0].tx_type).toBe("promo_credit");
    expect(initialDb.bookings).toHaveLength(0);
  });
});

describe("addBooking", () => {
  it("يضيف حجزاً قادماً", () => {
    const { db, booking } = addBooking(freshDb(), sampleInput(), "mada");
    expect(db.bookings).toHaveLength(1);
    expect(booking.status).toBe("upcoming");
    expect(booking.rated).toBe(false);
  });

  it("الدفع بالبطاقة (مدى) لا يمسّ رصيد المحفظة", () => {
    const start = freshDb();
    const { db } = addBooking(start, sampleInput(), "mada");
    expect(db.wallet.balance).toBe(start.wallet.balance); // 12000 دون تغيير
    expect(db.wallet.transactions).toHaveLength(start.wallet.transactions.length);
  });

  it("الدفع بالمحفظة يخصم الرصيد ويسجّل حركة خصم", () => {
    const { db } = addBooking(freshDb(), sampleInput({ amount: 6000 }), "wallet");
    expect(db.wallet.balance).toBe(6000); // 12000 - 6000
    expect(db.wallet.transactions[0].tx_type).toBe("booking_payment");
    expect(db.wallet.transactions[0].direction).toBe("debit");
  });

  it("لا يعدّل القاعدة الأصلية (immutability)", () => {
    const start = freshDb();
    addBooking(start, sampleInput(), "wallet");
    expect(start.bookings).toHaveLength(0);
    expect(start.wallet.balance).toBe(12000);
  });
});

describe("cancelBooking", () => {
  it("يلغي الحجز ويسترد قيمته كرصيد في المحفظة", () => {
    const { db, booking } = addBooking(freshDb(), sampleInput({ amount: 7500 }), "mada");
    const after = cancelBooking(db, booking.id);
    const cancelled = after.bookings.find((b) => b.id === booking.id);
    expect(cancelled?.status).toBe("cancelled");
    expect(after.wallet.balance).toBe(12000 + 7500); // استرداد للمحفظة
    expect(after.wallet.transactions[0].tx_type).toBe("refund_credit");
  });

  it("لا يسترد مرتين إذا كان الحجز ملغى بالفعل", () => {
    const { db, booking } = addBooking(freshDb(), sampleInput(), "mada");
    const once = cancelBooking(db, booking.id);
    const twice = cancelBooking(once, booking.id);
    expect(twice.wallet.balance).toBe(once.wallet.balance);
  });

  it("يتجاهل معرّفاً غير موجود", () => {
    const start = freshDb();
    expect(cancelBooking(start, "لا-يوجد")).toBe(start);
  });
});

describe("rateBooking", () => {
  it("يحفظ النجوم والوسوم", () => {
    const { db, booking } = addBooking(freshDb(), sampleInput(), "mada");
    const rated = rateBooking(db, booking.id, 5, ["نظافة ممتازة"]);
    const target = rated.bookings.find((b) => b.id === booking.id);
    expect(target?.rated).toBe(true);
    expect(target?.ratingValue).toBe(5);
    expect(target?.ratingTags).toEqual(["نظافة ممتازة"]);
  });
});

describe("attachReminder", () => {
  it("يربط معرّف الإشعار بالحجز", () => {
    const { db, booking } = addBooking(freshDb(), sampleInput(), "mada");
    const after = attachReminder(db, booking.id, "notif-123");
    expect(after.bookings.find((b) => b.id === booking.id)?.reminderId).toBe("notif-123");
  });
});

describe("topUp", () => {
  it("يزيد الرصيد ويسجّل حركة شحن", () => {
    const after = topUp(freshDb(), 5000);
    expect(after.wallet.balance).toBe(17000);
    expect(after.wallet.transactions[0].tx_type).toBe("topup");
  });

  it("يتجاهل المبالغ غير الموجبة", () => {
    const start = freshDb();
    expect(topUp(start, 0)).toBe(start);
    expect(topUp(start, -100)).toBe(start);
  });
});

describe("partitionBookings", () => {
  it("يفصل القادمة عن السابقة", () => {
    let db = addBooking(freshDb(), sampleInput(), "mada").db;
    const second = addBooking(db, sampleInput({ serviceId: "svc-fade" }), "mada");
    db = cancelBooking(second.db, second.booking.id);
    const { upcoming, past } = partitionBookings(db.bookings);
    expect(upcoming).toHaveLength(1);
    expect(past).toHaveLength(1);
    expect(past[0].status).toBe("cancelled");
  });
});
