import crypto from "crypto";

export const DEFAULT_TIKTOK_PIXEL_ID = "DARU5VRC77U5PB60B3AG";
export const DEFAULT_TIKTOK_ACCESS_TOKEN = "b630d77c03a9f95875ea3e89e2d145d91c7a9116";

const TIKTOK_EVENTS_API_ENDPOINT = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

/**
 * Normalizes phone numbers to E.164 without '+' or leading zeros (Morocco: 212XXXXXXXXX)
 * and hashes with SHA-256 per TikTok Events API specifications.
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

function hashData(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export interface TikTokServerPurchaseParams {
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
  ttclid?: string;
  ttp?: string;
}

export const getTikTokPixelId = (): string => {
  return process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || DEFAULT_TIKTOK_PIXEL_ID;
};

export const getTikTokAccessToken = (): string => {
  return process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN || DEFAULT_TIKTOK_ACCESS_TOKEN;
};

/**
 * Dispatches CompletePayment and PlaceAnOrder events directly from Next.js server to TikTok's Events API.
 * 100% immune to iOS 14.5+ Safari ITP, ad-blockers, and browser tracking restrictions.
 * Uses exact same orderId for clean deduplication with client-side pixel.
 */
export async function sendTikTokServerPurchase(
  params: TikTokServerPurchaseParams
): Promise<{ success: boolean; data?: any; error?: string }> {
  const token = getTikTokAccessToken();
  const pixelId = getTikTokPixelId();

  if (!token || !pixelId) {
    console.log("[TikTok Events API] Skipped: Missing token or pixel ID.");
    return { success: false, error: "Missing token or pixel ID" };
  }

  try {
    const hashedPhone = normalizeAndHashMoroccanPhone(params.phone);
    const hashedExternalId = hashData(params.orderId);
    const eventTime = Math.floor(Date.now() / 1000);
    const url = params.sourceUrl || "https://www.pratiko.ma/products/auto/aspirateur-sans-fil";

    const commonUser = {
      phone: hashedPhone,
      external_id: hashedExternalId,
      ip: params.clientIp,
      user_agent: params.clientUserAgent,
      ttclid: params.ttclid || undefined,
      ttp: params.ttp || undefined,
    };

    const commonProperties = {
      currency: "MAD",
      value: params.totalPrice,
      contents: [
        {
          content_id: params.productId,
          content_type: "product",
          content_name: params.productTitle,
          quantity: params.quantity,
          price: params.totalPrice,
        },
      ],
    };

    const payload = {
      event_source: "web",
      event_source_id: pixelId,
      data: [
        {
          event: "CompletePayment",
          event_time: eventTime,
          event_id: params.orderId, // Deduplicated with browser CompletePayment
          user: commonUser,
          properties: commonProperties,
          page: { url },
        },
        {
          event: "PlaceAnOrder",
          event_time: eventTime,
          event_id: `pao_${params.orderId}`, // Deduplicated with browser PlaceAnOrder
          user: commonUser,
          properties: commonProperties,
          page: { url },
        },
        {
          event: "Purchase",
          event_time: eventTime,
          event_id: `purch_${params.orderId}`, // Deduplicated with browser Purchase
          user: commonUser,
          properties: commonProperties,
          page: { url },
        },
      ],
    };

    const response = await fetch(TIKTOK_EVENTS_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || (result.code !== undefined && result.code !== 0)) {
      console.error("[TikTok Events API] API Error:", result);
      return { success: false, error: JSON.stringify(result) };
    }

    console.log(`[TikTok Events API] Successfully tracked Purchase for order ${params.orderId}`);
    return { success: true, data: result };
  } catch (err: any) {
    console.error("[TikTok Events API] Exception during dispatch:", err);
    return { success: false, error: err.message };
  }
}
