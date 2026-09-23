export const STORE_PHONE_RAW = "0711890473";
export const STORE_PHONE_DISPLAY = "07 11 89 04 73";
export const STORE_WHATSAPP_NUMBER = "212711890473";
export const STORE_WHATSAPP_BASE_URL = `https://wa.me/${STORE_WHATSAPP_NUMBER}`;

export function getWhatsAppLink(message?: string): string {
  if (!message) {
    return STORE_WHATSAPP_BASE_URL;
  }
  return `${STORE_WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}
