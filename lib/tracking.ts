/**
 * Centralized tracking dispatcher for Meta (Facebook) & TikTok Pixels.
 * Fully typed, non-blocking, and optimized for Cash on Delivery (COD) funnels.
 */

import {
  trackMetaPageView,
  trackMetaViewContent,
  trackMetaAddToCart,
  trackMetaInitiateCheckout,
  trackMetaPurchase,
  trackMetaContact,
  MetaPurchaseParams,
} from "./meta-pixel";

export * from "./meta-pixel";

declare global {
  interface Window {
    ttq?: {
      track: (eventName: string, data?: Record<string, any>, options?: Record<string, any>) => void;
      page: () => void;
      load: (pixelId: string) => void;
      identify: (data: Record<string, any>) => void;
    };
  }
}

export interface TrackingProduct {
  id: string;
  name: string;
  price: number;
  category?: string;
  quantity?: number;
}

export interface PurchaseEventData {
  orderId: string;
  value: number;
  currency?: string;
  phone?: string;
  email?: string;
  items?: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

const isBrowser = typeof window !== "undefined";

/**
 * SHA-256 hasher for client-side browser environment using native Web Crypto API
 */
async function sha256Browser(message: string): Promise<string> {
  const normalized = message.trim().toLowerCase();
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return "";
}

/**
 * Normalizes and hashes customer PII (phone, external_id) and sends to TikTok ttq.identify
 */
export async function identifyTikTokUser(phone?: string, externalId?: string) {
  if (!isBrowser || !window.ttq || typeof window.ttq.identify !== "function") return;
  try {
    const payload: Record<string, string> = {};
    if (phone) {
      let digits = phone.replace(/\D/g, "");
      if (digits.startsWith("0")) {
        digits = "212" + digits.slice(1);
      } else if (!digits.startsWith("212")) {
        digits = "212" + digits;
      }
      const hashedPhone = await sha256Browser(digits);
      if (hashedPhone) payload.phone_number = hashedPhone;
    }
    if (externalId) {
      const hashedId = await sha256Browser(externalId);
      if (hashedId) payload.external_id = hashedId;
    }
    if (Object.keys(payload).length > 0) {
      window.ttq.identify(payload);
    }
  } catch (err) {
    console.warn("[TikTok identify] Error:", err);
  }
}

function safeRun(fn: () => void) {
  if (!isBrowser) return;
  try {
    fn();
  } catch (err) {
    console.warn("[Tracking] Error executing tracking call:", err);
  }
}

/**
 * Standard PageView event
 */
export function trackPageView() {
  safeRun(() => {
    // 1. Meta Pixel
    trackMetaPageView();

    // 2. TikTok Pixel
    if (window.ttq && typeof window.ttq.page === "function") {
      window.ttq.page();
    }
  });
}

/**
 * Standard ViewContent event (User lands on product page)
 */
export function trackViewContent(product: TrackingProduct) {
  safeRun(() => {
    // 1. Meta Pixel
    trackMetaViewContent({
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      content_category: product.category || "General",
      value: product.price,
      currency: "MAD",
    });

    // 2. TikTok Pixel
    if (window.ttq && typeof window.ttq.track === "function") {
      window.ttq.track("ViewContent", {
        contents: [
          {
            content_id: product.id,
            content_type: "product",
            content_name: product.name,
          },
        ],
        content_id: product.id,
        content_type: "product",
        content_name: product.name,
        quantity: product.quantity || 1,
        price: product.price,
        value: product.price,
        currency: "MAD",
      });
    }
  });
}

/**
 * AddToCart event (User switches bundle or clicks purchase CTA)
 */
export function trackAddToCart(product: TrackingProduct) {
  safeRun(() => {
    // product.price is already the total packaged price for the bundle
    const bundlePrice = product.price;

    // 1. Meta Pixel
    trackMetaAddToCart({
      content_name: product.name,
      content_ids: [product.id],
      value: bundlePrice,
      currency: "MAD",
      quantity: product.quantity || 1,
    });

    // 2. TikTok Pixel
    if (window.ttq && typeof window.ttq.track === "function") {
      window.ttq.track("AddToCart", {
        contents: [
          {
            content_id: product.id,
            content_type: "product",
            content_name: product.name,
          },
        ],
        content_id: product.id,
        content_name: product.name,
        value: bundlePrice,
        currency: "MAD",
        quantity: product.quantity || 1,
      });
    }
  });
}

/**
 * InitiateCheckout event (User starts interacting with order form or clicks order CTA)
 * Session-guarded so clicking CTA and then focusing on form fields does not fire twice.
 */
export function trackInitiateCheckout(product: TrackingProduct) {
  safeRun(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("pratiko_checkout_initiated")) return;
      sessionStorage.setItem("pratiko_checkout_initiated", "true");
    }

    // product.price is already the total packaged price for the bundle
    const totalValue = product.price;

    // 1. Meta Pixel
    trackMetaInitiateCheckout({
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      value: totalValue,
      currency: "MAD",
      num_items: product.quantity || 1,
    });

    // 2. TikTok Pixel
    if (window.ttq && typeof window.ttq.track === "function") {
      window.ttq.track("InitiateCheckout", {
        contents: [
          {
            content_id: product.id,
            content_type: "product",
            content_name: product.name,
          },
        ],
        content_id: product.id,
        content_name: product.name,
        value: totalValue,
        currency: "MAD",
        quantity: product.quantity || 1,
      });
    }
  });
}

/**
 * Purchase event (Cash on delivery order submitted successfully)
 */
export function trackPurchase(data: PurchaseEventData) {
  safeRun(() => {
    const currency = data.currency || "MAD";
    const numItems = data.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 1;
    const contentIds = data.items?.map((item) => item.id) || [];
    const contentName = data.items?.[0]?.name || "Pratiko Product";

    // 1. Meta Pixel (with order_id deduplication)
    const metaParams: MetaPurchaseParams = {
      content_name: contentName,
      content_ids: contentIds,
      content_type: "product",
      value: data.value,
      currency: currency,
      num_items: numItems,
      order_id: data.orderId,
    };
    trackMetaPurchase(metaParams);

    // 2. TikTok Pixel
    if (window.ttq && typeof window.ttq.track === "function") {
      if (data.phone) {
        identifyTikTokUser(data.phone, data.orderId);
      }

      const contents =
        data.items && data.items.length > 0
          ? data.items.map((item) => ({
              content_id: item.id,
              content_type: "product",
              content_name: item.name,
            }))
          : [
              {
                content_id: data.orderId,
                content_type: "product",
                content_name: contentName,
              },
            ];

      // Primary TikTok Conversion event: CompletePayment
      window.ttq.track(
        "CompletePayment",
        {
          contents,
          content_id: data.orderId,
          content_name: contentName,
          value: data.value,
          currency: currency,
          quantity: numItems,
        },
        {
          event_id: data.orderId,
        }
      );

      // Primary TikTok Conversion event: PlaceAnOrder
      window.ttq.track(
        "PlaceAnOrder",
        {
          contents,
          content_id: data.orderId,
          content_name: contentName,
          value: data.value,
          currency: currency,
          quantity: numItems,
        },
        {
          event_id: `pao_${data.orderId}`,
        }
      );

      // TikTok Standard Purchase event
      window.ttq.track(
        "Purchase",
        {
          contents,
          content_id: data.orderId,
          content_name: contentName,
          value: data.value,
          currency: currency,
          quantity: numItems,
        },
        {
          event_id: `purch_${data.orderId}`,
        }
      );
    }
  });
}

/**
 * Contact event (User clicks WhatsApp button to order or inquire)
 */
export function trackWhatsAppClick(productName?: string, price?: number) {
  safeRun(() => {
    // 1. Meta Pixel Contact event
    trackMetaContact({
      content_name: productName ? `${productName} (WhatsApp)` : "WhatsApp Support",
      value: price || 0,
      currency: "MAD",
      contact_method: "whatsapp",
    });

    // 2. TikTok Pixel Contact event
    if (window.ttq && typeof window.ttq.track === "function") {
      window.ttq.track("Contact", {
        content_name: productName || "WhatsApp Support",
      });
    }
  });
}
