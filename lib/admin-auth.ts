import crypto from "crypto";

export const DEFAULT_ADMIN_PASSWORD =
  "PratikoMaroc#Admin_98f7a2c1b84e3d09a5f7823b1284fcd6_2026!";

export const ADMIN_COOKIE_NAME = "pratiko_admin_session";

// Secret used to sign session cookies
const AUTH_SECRET =
  process.env.ADMIN_AUTH_SECRET ||
  "pratiko-maroc-internal-auth-secret-key-2026-very-secure";

/**
 * Verify whether the supplied password matches the configured admin password.
 */
export function verifyAdminPassword(password: string): boolean {
  const expectedPassword = (
    process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
  ).trim();

  if (!password || typeof password !== "string") {
    return false;
  }

  const cleanPassword = password.trim();
  return cleanPassword === expectedPassword;
}

/**
 * Create a signed session token: {timestamp}.{signature}
 */
export function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(timestamp)
    .digest("hex");
  return `${timestamp}.${signature}`;
}

/**
 * Validate a session token
 */
export function verifySessionToken(token?: string | null): boolean {
  if (!token || typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [timestamp, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(timestamp)
    .digest("hex");

  if (signature !== expectedSignature) {
    return false;
  }

  // Token expires after 30 days
  const tokenTime = parseInt(timestamp, 10);
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  if (isNaN(tokenTime) || Date.now() - tokenTime > thirtyDaysMs) {
    return false;
  }

  return true;
}
