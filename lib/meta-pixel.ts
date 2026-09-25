/**
 * Full TypeScript Meta (Facebook) Pixel integration for Next.js 14 App Router.
 * Tailored for Cash on Delivery (COD) e-commerce funnels.
 *
 * Supported standard events:
 * - PageView (route changes & initial load)
 * - ViewContent (viewing product page)
 * - AddToCart (selecting bundle / clicking CTA)
 * - InitiateCheckout (focusing on form / clicking order CTA)
 * - Purchase (order confirmed, with order_id deduplication)
 * - Contact (WhatsApp lead / inquiry click)
 */

export const DEFAULT_META_PIXEL_ID = "1795033998462593";

export const getMetaPixelId = (): string => {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID || DEFAULT_META_PIXEL_ID;
};

// Standard Meta Pixel Event Types
export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Lead"
  | "Contact"
  | "Search"
  | "CustomizeProduct"
  | "AddPaymentInfo";

export interface MetaViewContentParams {
  content_name: string;
  content_ids: string[];
  content_type?: "product" | "product_group";
  content_category?: string;
  value: number;
  currency: string;
}

export interface MetaAddToCartParams {
  content_name: string;
  content_ids: string[];
  content_type?: "product" | "product_group";
  value: number;
  currency: string;
  quantity?: number;
}

export interface MetaInitiateCheckoutParams {
  content_name?: string;
  content_ids?: string[];
  content_type?: "product" | "product_group";
  value: number;
  currency: string;
  num_items?: number;
}

export interface MetaPurchaseParams {
  content_name?: string;
  content_ids: string[];
  content_type?: "product" | "product_group";
  value: number;
  currency: string;
  num_items: number;
  order_id: string; // Used for deduplication
}

export interface MetaContactParams {
  content_name?: string;
  value?: number;
  currency?: string;
  contact_method?: "whatsapp" | "phone" | "form";
}

// Window interface augmentation for fbq
declare global {
  interface Window {
    fbq?: {
      (action: "track", event: MetaStandardEvent | string, params?: Record<string, any>, options?: { eventID?: string }): void;
      (action: "trackCustom", event: string, params?: Record<string, any>, options?: { eventID?: string }): void;
      (action: "init", pixelId: string, userData?: Record<string, any>): void;
      queue?: any[];
      loaded?: boolean;
      version?: string;
    };
    _fbq?: any;
  }
}

/**
 * Ensures window.fbq queue stub exists so events are queued even before fbevents.js finishes downloading.
 */
export function ensureFbqStub(): void {
  if (typeof window === "undefined") return;
  if (!window.fbq) {
    const n: any = function () {
      if (n.callMethod) {
        n.callMethod.apply(n, arguments);
      } else {
        n.queue.push(arguments);
      }
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = false;
    n.version = "2.0";
    n.queue = [];
    window.fbq = n;
  }
}

/**
 * Generic safe event dispatcher with optional eventID for deduplication.
 */
export function trackMetaEvent(
  event: MetaStandardEvent | string,
  params?: Record<string, any>,
  eventID?: string
): void {
  if (typeof window === "undefined") return;

  try {
    ensureFbqStub();

    if (eventID) {
      window.fbq!("track", event, params, { eventID });
    } else {
      window.fbq!("track", event, params);
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[Meta Pixel] Event: ${event}`, params || {}, eventID ? `(EventID: ${eventID})` : "");
    }
  } catch (error) {
    console.warn(`[Meta Pixel] Error tracking event "${event}":`, error);
  }
}

/**
 * Track custom Meta event.
 */
export function trackMetaCustomEvent(
  eventName: string,
  params?: Record<string, any>,
  eventID?: string
): void {
  if (typeof window === "undefined") return;

  try {
    ensureFbqStub();

    if (eventID) {
      window.fbq!("trackCustom", eventName, params, { eventID });
    } else {
      window.fbq!("trackCustom", eventName, params);
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[Meta Pixel Custom] Event: ${eventName}`, params || {});
    }
  } catch (error) {
    console.warn(`[Meta Pixel] Error tracking custom event "${eventName}":`, error);
  }
}

/**
 * PageView - track navigation or initial load
 */
export function trackMetaPageView(): void {
  trackMetaEvent("PageView");
}

/**
 * ViewContent - user views a product page
 */
export function trackMetaViewContent(params: MetaViewContentParams): void {
  trackMetaEvent("ViewContent", {
    content_name: params.content_name,
    content_ids: params.content_ids,
    content_type: params.content_type || "product",
    content_category: params.content_category || "General",
    value: params.value,
    currency: params.currency || "MAD",
  });
}

/**
 * AddToCart - user selects an offer bundle or clicks CTA
 */
export function trackMetaAddToCart(params: MetaAddToCartParams): void {
  trackMetaEvent("AddToCart", {
    content_name: params.content_name,
    content_ids: params.content_ids,
    content_type: params.content_type || "product",
    value: params.value,
    currency: params.currency || "MAD",
    quantity: params.quantity || 1,
  });
}

/**
 * InitiateCheckout - user scrolls into or interacts with the COD order form
 */
export function trackMetaInitiateCheckout(params: MetaInitiateCheckoutParams): void {
  trackMetaEvent("InitiateCheckout", {
    content_name: params.content_name,
    content_ids: params.content_ids,
    content_type: params.content_type || "product",
    value: params.value,
    currency: params.currency || "MAD",
    num_items: params.num_items || 1,
  });
}

/**
 * Purchase - user successfully places a Cash on Delivery order
 * Includes eventID for deduplication against server conversions API (CAPI).
 */
export function trackMetaPurchase(params: MetaPurchaseParams): void {
  trackMetaEvent(
    "Purchase",
    {
      content_name: params.content_name,
      content_ids: params.content_ids,
      content_type: params.content_type || "product",
      value: params.value,
      currency: params.currency || "MAD",
      num_items: params.num_items,
      order_id: params.order_id,
    },
    params.order_id
  );
}

/**
 * Contact / Lead - user taps WhatsApp to place order or ask questions
 */
export function trackMetaContact(params?: MetaContactParams): void {
  trackMetaEvent("Contact", {
    content_name: params?.content_name || "General Inquiry",
    value: params?.value || 0,
    currency: params?.currency || "MAD",
    contact_method: params?.contact_method || "whatsapp",
  });
}
