/**
 * Lightweight, non-blocking Pixel Tracking Utility for Meta (Facebook) & TikTok Pixels.
 * Safely dispatches standard e-commerce events without blocking UI rendering.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    ttq?: {
      track: (eventName: string, data?: Record<string, any>, options?: Record<string, any>) => void;
      page: () => void;
      load: (pixelId: string) => void;
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
  items?: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

const isBrowser = typeof window !== "undefined";

function safeDispatch(fn: () => void) {
  if (!isBrowser) return;
  // Use requestIdleCallback or setTimeout to guarantee zero render blocking
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(fn, { timeout: 1000 });
  } else {
    setTimeout(fn, 0);
  }
}

/**
 * Standard PageView event
 */
export function trackPageView() {
  safeDispatch(() => {
    try {
      if (typeof window.fbq === "function") {
        window.fbq("track", "PageView");
      }
      if (window.ttq && typeof window.ttq.page === "function") {
        window.ttq.page();
      }
      if (process.env.NODE_ENV === "development") {
        console.log("[Tracking] PageView sent");
      }
    } catch (e) {
      console.warn("[Tracking] Error sending PageView:", e);
    }
  });
}

/**
 * Standard ViewContent event
 */
export function trackViewContent(product: TrackingProduct) {
  safeDispatch(() => {
    try {
      const fbData = {
        content_name: product.name,
        content_ids: [product.id],
        content_type: "product",
        value: product.price,
        currency: "MAD",
        content_category: product.category || "General",
      };

      if (typeof window.fbq === "function") {
        window.fbq("track", "ViewContent", fbData);
      }

      if (window.ttq && typeof window.ttq.track === "function") {
        window.ttq.track("ViewContent", {
          content_id: product.id,
          content_type: "product",
          content_name: product.name,
          quantity: product.quantity || 1,
          price: product.price,
          value: product.price,
          currency: "MAD",
        });
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[Tracking] ViewContent sent:", fbData);
      }
    } catch (e) {
      console.warn("[Tracking] Error sending ViewContent:", e);
    }
  });
}

/**
 * InitiateCheckout event (triggered when customer focuses on form or clicks jump button)
 */
export function trackInitiateCheckout(product: TrackingProduct) {
  safeDispatch(() => {
    try {
      const totalValue = product.price * (product.quantity || 1);
      const fbData = {
        content_name: product.name,
        content_ids: [product.id],
        content_type: "product",
        value: totalValue,
        currency: "MAD",
        num_items: product.quantity || 1,
      };

      if (typeof window.fbq === "function") {
        window.fbq("track", "InitiateCheckout", fbData);
      }

      if (window.ttq && typeof window.ttq.track === "function") {
        window.ttq.track("InitiateCheckout", {
          content_id: product.id,
          content_name: product.name,
          value: totalValue,
          currency: "MAD",
          quantity: product.quantity || 1,
        });
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[Tracking] InitiateCheckout sent:", fbData);
      }
    } catch (e) {
      console.warn("[Tracking] Error sending InitiateCheckout:", e);
    }
  });
}

/**
 * Purchase event (triggered on successful order submission)
 */
export function trackPurchase(data: PurchaseEventData) {
  safeDispatch(() => {
    try {
      const currency = data.currency || "MAD";
      const fbData = {
        content_type: "product",
        content_ids: data.items?.map((item) => item.id) || [],
        value: data.value,
        currency: currency,
        order_id: data.orderId,
        num_items: data.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 1,
      };

      if (typeof window.fbq === "function") {
        window.fbq("track", "Purchase", fbData);
      }

      if (window.ttq && typeof window.ttq.track === "function") {
        window.ttq.track("CompletePayment", {
          content_id: data.orderId,
          value: data.value,
          currency: currency,
          quantity: fbData.num_items,
        });
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[Tracking] Purchase sent:", fbData);
      }
    } catch (e) {
      console.warn("[Tracking] Error sending Purchase:", e);
    }
  });
}
