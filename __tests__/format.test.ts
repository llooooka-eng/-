import {
  formatSAR,
  formatSignedAmount,
  walletTxLabel,
} from "@/lib/format";

describe("formatSAR", () => {
  it("يحوّل الهللة إلى ريال بخانتين عشريتين", () => {
    expect(formatSAR(6000)).toBe("60.00 ﷼");
    expect(formatSAR(0)).toBe("0.00 ﷼");
    expect(formatSAR(12345)).toBe("123.45 ﷼");
  });

  it("يضيف فواصل الآلاف", () => {
    expect(formatSAR(1234567)).toBe("12,345.67 ﷼");
  });

  it("يحذف الرمز عند الطلب", () => {
    expect(formatSAR(6000, { withSymbol: false })).toBe("60.00");
  });

  it("يتعامل مع القيم السالبة بالقيمة المطلقة", () => {
    expect(formatSAR(-6000, { withSymbol: false })).toBe("60.00");
  });
});

describe("formatSignedAmount", () => {
  it("يضيف + للإيداع و− للسحب", () => {
    expect(formatSignedAmount("credit", 12000)).toBe("+120.00");
    expect(formatSignedAmount("debit", 12000)).toBe("−120.00");
  });
});

describe("walletTxLabel", () => {
  it("يغطّي كل أنواع الحركات بتسمية عربية", () => {
    expect(walletTxLabel.booking_payment).toBe("دفع حجز");
    expect(walletTxLabel.refund_credit).toBe("استرداد إلغاء حجز");
    expect(Object.keys(walletTxLabel)).toHaveLength(7);
  });
});
