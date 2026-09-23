import { OrderInput } from "./validations";

export interface DispatchedOrderPayload extends OrderInput {
  orderId: string;
  createdAt: string;
}

/**
 * Pluggable order dispatch handlers:
 * Dispatches to Google Sheets, Telegram Bot, or custom webhook endpoints.
 */
export async function dispatchOrder(order: DispatchedOrderPayload): Promise<void> {
  const promises: Promise<any>[] = [];

  // 1. Dispatch to Telegram Bot if configured
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    promises.push(sendTelegramNotification(order));
  }

  // 2. Dispatch to Google Sheets Webhook (e.g. Google Apps Script / Make / Zapier)
  if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    promises.push(sendGoogleSheetsWebhook(order));
  }

  // 3. Dispatch to Supabase / Custom CRM Webhook if configured
  if (process.env.CUSTOM_WEBHOOK_URL) {
    promises.push(sendCustomWebhook(order));
  }

  // Await all dispatches safely without blocking response if one fails
  const results = await Promise.allSettled(promises);
  results.forEach((res, index) => {
    if (res.status === "rejected") {
      console.error(`[Webhook Dispatcher] Failed handler #${index}:`, res.reason);
    }
  });

  if (promises.length === 0) {
    console.log("[Webhook Dispatcher] No external webhooks configured. Order stored in-memory log:", order.orderId);
  }
}

async function sendTelegramNotification(order: DispatchedOrderPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const text = `
🛒 *طلب جديد عبر الدفع عند الاستلام (COD)*
━━━━━━━━━━━━━━━━━
🆔 *رقم الطلب:* \`${order.orderId}\`
📦 *المنتج:* ${order.productTitle || order.productId}
🔢 *الكمية:* ${order.quantity}
💰 *المبلغ الإجمالي:* *${order.totalPrice} درهم* (التوصيل: ${order.deliveryFee === 0 ? "مجاني" : order.deliveryFee + " درهم"})

👤 *الزبون:* ${order.fullName}
📱 *الهاتف:* [${order.phone}](tel:${order.phone})
💬 *واتساب:* [مراسلة على WhatsApp](https://wa.me/212${order.phone.substring(1)})
📍 *المدينة:* ${order.city}
🏠 *العنوان:* ${order.address}
⏰ *التاريخ:* ${new Date(order.createdAt).toLocaleString("fr-FR", { timeZone: "Africa/Casablanca" })}
🖥️ *لوحة التحكم:* [فتح Admin Dashboard](/admin)
━━━━━━━━━━━━━━━━━
  `.trim();

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
    }),
  });
}

async function sendGoogleSheetsWebhook(order: DispatchedOrderPayload) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL!;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
}

async function sendCustomWebhook(order: DispatchedOrderPayload) {
  const url = process.env.CUSTOM_WEBHOOK_URL!;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
}
