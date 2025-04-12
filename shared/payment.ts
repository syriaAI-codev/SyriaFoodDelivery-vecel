import { z } from "zod";

// نظام الدفع المناسب للسوق السورية
export const paymentMethods = [
  {
    id: "cash",
    name: "الدفع عند الاستلام",
    icon: "cash",
    description: "ادفع نقداً عند استلام طلبك",
    isDefault: true,
    requiresVerification: false,
  },
  {
    id: "syriatel_cash",
    name: "سيرياتيل كاش",
    icon: "mobile_money",
    description: "ادفع باستخدام محفظة سيرياتيل كاش",
    isDefault: false,
    requiresVerification: true,
  },
  {
    id: "mtn_cash",
    name: "MTN كاش",
    icon: "mobile_money",
    description: "ادفع باستخدام محفظة MTN كاش",
    isDefault: false,
    requiresVerification: true,
  },
  {
    id: "bank_transfer",
    name: "تحويل مصرفي",
    icon: "bank",
    description: "ادفع عن طريق التحويل المصرفي",
    isDefault: false,
    requiresVerification: true,
  },
  {
    id: "credit_card",
    name: "بطاقة ائتمان",
    icon: "credit_card",
    description: "ادفع باستخدام بطاقة ائتمان (متاح قريباً)",
    isDefault: false,
    requiresVerification: true,
    isDisabled: true,
  }
];

// مخطط التحقق من صحة معلومات الدفع
export const cashPaymentSchema = z.object({
  method: z.literal("cash"),
  notes: z.string().optional(),
});

export const syriatelCashPaymentSchema = z.object({
  method: z.literal("syriatel_cash"),
  phoneNumber: z.string().regex(/^(\+?963|0)?9[4-5]\d{7}$/, { message: "رقم هاتف سيرياتيل غير صالح" }),
  transactionId: z.string().optional(),
});

export const mtnCashPaymentSchema = z.object({
  method: z.literal("mtn_cash"),
  phoneNumber: z.string().regex(/^(\+?963|0)?9[3-6]\d{7}$/, { message: "رقم هاتف MTN غير صالح" }),
  transactionId: z.string().optional(),
});

export const bankTransferPaymentSchema = z.object({
  method: z.literal("bank_transfer"),
  bankName: z.string().min(3, { message: "اسم البنك مطلوب" }),
  accountNumber: z.string().min(5, { message: "رقم الحساب غير صالح" }),
  transferDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "تاريخ التحويل غير صالح" }),
  transferReference: z.string().optional(),
});

export const creditCardPaymentSchema = z.object({
  method: z.literal("credit_card"),
  cardNumber: z.string().regex(/^\d{16}$/, { message: "رقم البطاقة غير صالح" }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "تاريخ انتهاء الصلاحية غير صالح" }),
  cvv: z.string().regex(/^\d{3,4}$/, { message: "رمز CVV غير صالح" }),
  cardholderName: z.string().min(3, { message: "اسم حامل البطاقة مطلوب" }),
});

// مخطط التحقق من صحة نموذج الدفع الشامل
export const paymentSchema = z.discriminatedUnion("method", [
  cashPaymentSchema,
  syriatelCashPaymentSchema,
  mtnCashPaymentSchema,
  bankTransferPaymentSchema,
  creditCardPaymentSchema,
]);

// أنواع TypeScript
export type PaymentMethod = typeof paymentMethods[number];
export type PaymentData = z.infer<typeof paymentSchema>;

export default {
  paymentMethods,
  paymentSchema,
};
