export const STORE_PHONE_RAW = "0773279412";
export const STORE_PHONE_DISPLAY = "07 73 27 94 12";
export const STORE_WHATSAPP_NUMBER = "212773279412";
export const STORE_WHATSAPP_BASE_URL = `https://wa.me/${STORE_WHATSAPP_NUMBER}`;

export function getWhatsAppLink(message?: string): string {
  if (!message) {
    return STORE_WHATSAPP_BASE_URL;
  }
  return `${STORE_WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}
