import { z } from "zod";
import { CITIES_LIST } from "@/data/products";

// Moroccan phone regex: starts with 05, 06 or 07 followed by exactly 8 digits (total 10 digits)
// Also handles cleaning whitespace and optional Moroccan country code +212 / 00212
export const MOROCCAN_PHONE_REGEX = /^(05|06|07)[0-9]{8}$/;

export function sanitizeMoroccanPhone(rawPhone: string): string {
  if (!rawPhone || typeof rawPhone !== "string") return "";
  // Remove spaces, hyphens, dots, parentheses, and any non-digit/non-plus character
  let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, "");
  if (cleaned.startsWith("+212")) {
    cleaned = "0" + cleaned.slice(4);
  } else if (cleaned.startsWith("00212")) {
    cleaned = "0" + cleaned.slice(5);
  } else if (cleaned.startsWith("212") && cleaned.length >= 11) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.length === 9 && (cleaned.startsWith("5") || cleaned.startsWith("6") || cleaned.startsWith("7"))) {
    cleaned = "0" + cleaned;
  }
  return cleaned;
}

export const OrderSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "المرجو إدخال الاسم الكامل (3 أحرف على الأقل)" })
    .max(80, { message: "الاسم طويل جداً" }),
  phone: z
    .string()
    .transform((val) => sanitizeMoroccanPhone(val))
    .refine((val) => MOROCCAN_PHONE_REGEX.test(val), {
      message: "يرجى إدخال رقم هاتف مغربي صحيح يبدأ بـ 06 أو 07 (مثال: 0612345678)",
    }),
  city: z
    .enum(CITIES_LIST, {
      errorMap: () => ({ message: "المرجو اختيار المدينة من القائمة" }),
    }),
  address: z
    .string()
    .min(5, { message: "المرجو إدخال العنوان بالكامل (الحي، رقم الشارع، الإقامة...)" })
    .max(200, { message: "العنوان طويل جداً" }),
  bundleId: z.string().min(1, { message: "المرجو اختيار العرض المطلوب" }),
  productId: z.string().min(1, { message: "معرف المنتج مطلوب" }),
  productTitle: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
  deliveryFee: z.number().nonnegative().default(0),
  utmSource: z.string().optional(),
  notes: z.string().optional(),
});

export type OrderInput = z.infer<typeof OrderSchema>;

export interface OrderResponse {
  success: boolean;
  orderId?: string;
  message: string;
  order?: {
    id: string;
    fullName: string;
    phone: string;
    city: string;
    address: string;
    productTitle: string;
    quantity: number;
    totalPrice: number;
    createdAt: string;
  };
  errors?: Record<string, string[]>;
}
