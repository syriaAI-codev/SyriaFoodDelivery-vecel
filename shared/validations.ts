import { z } from "zod";
import { insertUserSchema, insertAddressSchema, insertOrderSchema, insertOrderItemSchema } from "./schema";

// العربية الرسائل الخطأ
const arabicErrorMessages = {
  required: "هذا الحقل مطلوب",
  email: "يرجى إدخال بريد إلكتروني صحيح",
  min: (field: string, min: number) => `يجب أن يحتوي ${field} على الأقل ${min} أحرف`,
  max: (field: string, max: number) => `يجب أن لا يتجاوز ${field} ${max} حرف`,
  numeric: "يرجى إدخال قيمة رقمية صحيحة",
  phone: "يرجى إدخال رقم هاتف صحيح",
  password: "يجب أن تحتوي كلمة المرور على حرف كبير، حرف صغير، رقم وحرف خاص",
  passwordMatch: "كلمات المرور غير متطابقة",
  invalidOption: "الخيار المحدد غير صالح",
  positiveNumber: "يجب أن تكون القيمة رقم موجب",
  invalidDate: "تاريخ غير صالح",
  futureDate: "يجب أن يكون التاريخ في المستقبل",
  invalidLatLng: "إحداثيات غير صالحة",
  invalidAddress: "عنوان غير صالح",
  invalidPromoCode: "رمز ترويجي غير صالح",
  invalidPaymentMethod: "طريقة دفع غير صالحة",
  minOrderAmount: (amount: number) => `الحد الأدنى للطلب هو ${amount} ل.س`,
};

// تعريف مخطط التحقق من صحة نموذج تسجيل المستخدم
export const registerUserSchema = z.object({
  name: z.string().min(3, { message: arabicErrorMessages.min("الاسم", 3) }).max(50, { message: arabicErrorMessages.max("الاسم", 50) }),
  email: z.string().email({ message: arabicErrorMessages.email }),
  password: z.string().min(8, { message: arabicErrorMessages.min("كلمة المرور", 8) })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: arabicErrorMessages.password }),
  confirmPassword: z.string(),
  phone: z.string().regex(/^(\+?963|0)?9\d{8}$/, { message: arabicErrorMessages.phone }),
  role: z.enum(["customer", "restaurant", "delivery", "admin"], { errorMap: () => ({ message: arabicErrorMessages.invalidOption }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: arabicErrorMessages.passwordMatch,
  path: ["confirmPassword"],
});

// تعريف مخطط التحقق من صحة نموذج تسجيل الدخول
export const loginSchema = z.object({
  email: z.string().email({ message: arabicErrorMessages.email }),
  password: z.string().min(1, { message: arabicErrorMessages.required }),
});

// تعريف مخطط التحقق من صحة نموذج العنوان
export const addressValidationSchema = z.object({
  title: z.string().min(3, { message: arabicErrorMessages.min("العنوان", 3) }).max(50, { message: arabicErrorMessages.max("العنوان", 50) }),
  address: z.string().min(5, { message: arabicErrorMessages.min("تفاصيل العنوان", 5) }).max(200, { message: arabicErrorMessages.max("تفاصيل العنوان", 200) }),
  lat: z.number().refine(val => val >= -90 && val <= 90, { message: arabicErrorMessages.invalidLatLng }),
  lng: z.number().refine(val => val >= -180 && val <= 180, { message: arabicErrorMessages.invalidLatLng }),
  isDefault: z.boolean().optional(),
});

// تعريف مخطط التحقق من صحة نموذج الطلب
export const orderValidationSchema = z.object({
  restaurantId: z.number().positive({ message: arabicErrorMessages.positiveNumber }),
  addressId: z.number().positive({ message: arabicErrorMessages.positiveNumber }).optional(),
  deliveryAddress: z.string().min(5, { message: arabicErrorMessages.min("عنوان التوصيل", 5) }),
  deliveryLat: z.number().refine(val => val >= -90 && val <= 90, { message: arabicErrorMessages.invalidLatLng }),
  deliveryLng: z.number().refine(val => val >= -180 && val <= 180, { message: arabicErrorMessages.invalidLatLng }),
  items: z.array(z.object({
    menuItemId: z.number().positive({ message: arabicErrorMessages.positiveNumber }),
    quantity: z.number().positive({ message: arabicErrorMessages.positiveNumber }),
    notes: z.string().optional(),
  })).min(1, { message: "يجب إضافة عنصر واحد على الأقل إلى الطلب" }),
  notes: z.string().optional(),
  paymentMethod: z.enum(["cash", "card", "wallet"], { errorMap: () => ({ message: arabicErrorMessages.invalidPaymentMethod }) }),
  promoCode: z.string().optional(),
}).refine((data) => {
  // يمكن إضافة تحقق إضافي هنا، مثل التحقق من الحد الأدنى للطلب
  return true;
}, {
  message: arabicErrorMessages.minOrderAmount(1000),
});

// تعريف مخطط التحقق من صحة نموذج تحديث حالة الطلب
export const orderStatusUpdateSchema = z.object({
  status: z.enum(["pending", "accepted", "preparing", "ready_for_pickup", "on_delivery", "delivered", "cancelled"], 
    { errorMap: () => ({ message: arabicErrorMessages.invalidOption }) }),
});

// تعريف مخطط التحقق من صحة نموذج تحديث الملف الشخصي
export const profileUpdateSchema = z.object({
  name: z.string().min(3, { message: arabicErrorMessages.min("الاسم", 3) }).max(50, { message: arabicErrorMessages.max("الاسم", 50) }).optional(),
  phone: z.string().regex(/^(\+?963|0)?9\d{8}$/, { message: arabicErrorMessages.phone }).optional(),
  address: z.string().min(5, { message: arabicErrorMessages.min("العنوان", 5) }).max(200, { message: arabicErrorMessages.max("العنوان", 200) }).optional(),
});

// تعريف مخطط التحقق من صحة نموذج تغيير كلمة المرور
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: arabicErrorMessages.required }),
  newPassword: z.string().min(8, { message: arabicErrorMessages.min("كلمة المرور الجديدة", 8) })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: arabicErrorMessages.password }),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: arabicErrorMessages.passwordMatch,
  path: ["confirmNewPassword"],
});

// تعريف مخطط التحقق من صحة نموذج الدفع
export const paymentValidationSchema = z.object({
  orderId: z.number().positive({ message: arabicErrorMessages.positiveNumber }),
  paymentMethod: z.enum(["cash", "card", "wallet"], { errorMap: () => ({ message: arabicErrorMessages.invalidPaymentMethod }) }),
  amount: z.number().positive({ message: arabicErrorMessages.positiveNumber }),
  cardDetails: z.object({
    cardNumber: z.string().regex(/^\d{16}$/, { message: "رقم البطاقة غير صالح" }).optional(),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "تاريخ انتهاء الصلاحية غير صالح" }).optional(),
    cvv: z.string().regex(/^\d{3,4}$/, { message: "رمز CVV غير صالح" }).optional(),
    cardholderName: z.string().min(3, { message: arabicErrorMessages.min("اسم حامل البطاقة", 3) }).optional(),
  }).optional(),
});

// تعريف مخطط التحقق من صحة نموذج التقييم
export const reviewValidationSchema = z.object({
  orderId: z.number().positive({ message: arabicErrorMessages.positiveNumber }),
  rating: z.number().min(1, { message: "يجب أن يكون التقييم على الأقل 1" }).max(5, { message: "يجب أن لا يتجاوز التقييم 5" }),
  comment: z.string().max(500, { message: arabicErrorMessages.max("التعليق", 500) }).optional(),
});

// تعريف مخطط التحقق من صحة نموذج البحث
export const searchValidationSchema = z.object({
  query: z.string().min(2, { message: arabicErrorMessages.min("كلمة البحث", 2) }).optional(),
  categoryId: z.number().positive({ message: arabicErrorMessages.positiveNumber }).optional(),
  lat: z.number().refine(val => val >= -90 && val <= 90, { message: arabicErrorMessages.invalidLatLng }).optional(),
  lng: z.number().refine(val => val >= -180 && val <= 180, { message: arabicErrorMessages.invalidLatLng }).optional(),
  radius: z.number().positive({ message: arabicErrorMessages.positiveNumber }).optional(),
  minRating: z.number().min(1, { message: "يجب أن يكون التقييم على الأقل 1" }).max(5, { message: "يجب أن لا يتجاوز التقييم 5" }).optional(),
  hasPromo: z.boolean().optional(),
});

// تعريف مخطط التحقق من صحة نموذج الاتصال
export const contactFormSchema = z.object({
  name: z.string().min(3, { message: arabicErrorMessages.min("الاسم", 3) }).max(50, { message: arabicErrorMessages.max("الاسم", 50) }),
  email: z.string().email({ message: arabicErrorMessages.email }),
  subject: z.string().min(5, { message: arabicErrorMessages.min("الموضوع", 5) }).max(100, { message: arabicErrorMessages.max("الموضوع", 100) }),
  message: z.string().min(10, { message: arabicErrorMessages.min("الرسالة", 10) }).max(1000, { message: arabicErrorMessages.max("الرسالة", 1000) }),
});

// تصدير جميع المخططات
export const validationSchemas = {
  registerUserSchema,
  loginSchema,
  addressValidationSchema,
  orderValidationSchema,
  orderStatusUpdateSchema,
  profileUpdateSchema,
  passwordChangeSchema,
  paymentValidationSchema,
  reviewValidationSchema,
  searchValidationSchema,
  contactFormSchema,
};

export default validationSchemas;
