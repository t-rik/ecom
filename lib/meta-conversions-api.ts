import crypto from "crypto";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2426655351476249";
export const META_CAPI_ACCESS_TOKEN = process.env.META_CONVERSIONS_API_ACCESS_TOKEN || "";

/**
 * SHA-256 normalizer and hasher according to Meta Conversions API specifications.
 * Meta requires strings to be lowercased, trimmed, and hashed with SHA-256.
 */
function hashData(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Normalizes phone numbers to E.164 without '+' or leading zeros (Morocco: 212XXXXXXXXX)
 */
function normalizeAndHashMoroccanPhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = "212" + digits.slice(1);
  } else if (!digits.startsWith("212")) {
    digits = "212" + digits;
  }
  return crypto.createHash("sha256").update(digits).digest("hex");
}

export interface ServerPurchaseParams {
  orderId: string;
  fullName: string;
  phone: string;
  city: string;
  totalPrice: number;
  productId: string;
  productTitle: string;
  quantity: number;
  clientIp?: string;
  clientUserAgent?: string;
  sourceUrl?: string;
}

/**
 * Dispatches a Purchase event directly from Next.js server to Meta's Graph API.
 * This completely bypasses ad blockers, Brave shields, and iOS Safari restrictions.
 * Uses exact same orderId as client-side event for automatic Meta deduplication.
 */
export async function sendMetaServerPurchase(params: ServerPurchaseParams): Promise<{ success: boolean; data?: any; error?: string }> {
  const token = META_CAPI_ACCESS_TOKEN;
  const pixelId = META_PIXEL_ID;

  if (!token) {
    console.log("[Meta CAPI] Skipped: META_CONVERSIONS_API_ACCESS_TOKEN is not configured.");
    return { success: false, error: "Missing token" };
  }

  try {
    const hashedPhone = normalizeAndHashMoroccanPhone(params.phone);
    const nameParts = params.fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const hashedFirstName = hashData(firstName);
    const hashedLastName = hashData(lastName);
    const hashedCity = hashData(params.city);
    const hashedCountry = hashData("ma"); // Morocco

    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: params.orderId, // Matches client-side eventID for 100% accurate deduplication
          event_source_url: params.sourceUrl || "https://www.pratiko.ma/products/auto/aspirateur-sans-fil",
          action_source: "website",
          user_data: {
            ph: hashedPhone ? [hashedPhone] : undefined,
            fn: hashedFirstName ? [hashedFirstName] : undefined,
            ln: hashedLastName ? [hashedLastName] : undefined,
            ct: hashedCity ? [hashedCity] : undefined,
            country: hashedCountry ? [hashedCountry] : undefined,
            client_ip_address: params.clientIp || undefined,
            client_user_agent: params.clientUserAgent || undefined,
          },
          custom_data: {
            currency: "MAD",
            value: params.totalPrice,
            content_type: "product",
            content_ids: [params.productId],
            content_name: params.productTitle,
            num_items: params.quantity,
            order_id: params.orderId,
          },
        },
      ],
    };

    const endpoint = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("[Meta CAPI] Server Error:", JSON.stringify(result));
      return { success: false, error: JSON.stringify(result) };
    }

    console.log(`[Meta CAPI] Purchase successfully sent for Order ${params.orderId} (Events received: ${result.events_received})`);
    return { success: true, data: result };
  } catch (err: any) {
    console.error("[Meta CAPI] Exception:", err);
    return { success: false, error: err?.message || String(err) };
  }
}
