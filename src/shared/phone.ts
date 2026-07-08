/**
 * India-first phone helpers. Users should never have to type "+91" — they
 * enter their 10-digit mobile and we normalise to E.164 (`+91XXXXXXXXXX`),
 * which is exactly how the backend stores and looks up numbers.
 */

/** Keep only digits. */
const digits = (s: string) => (s || "").replace(/\D/g, "");

/** The local 10-digit part of any Indian-mobile-ish input (strips +91/91/0). */
export function localMobileDigits(raw: string): string {
  let d = digits(raw);
  if (d.startsWith("91") && d.length > 10) d = d.slice(2); // +91 / 91 prefix
  if (d.startsWith("0") && d.length > 10) d = d.slice(1); // leading 0
  return d.slice(-10); // keep the last 10
}

/** True once a valid 10-digit Indian mobile has been entered. */
export function isValidIndianMobile(raw: string): boolean {
  const d = localMobileDigits(raw);
  return d.length === 10 && /^[6-9]/.test(d);
}

/** Normalise to `+91XXXXXXXXXX`; returns "" if not 10 digits yet. */
export function toIndianE164(raw: string): string {
  const d = localMobileDigits(raw);
  return d.length === 10 ? `+91${d}` : "";
}

export const isEmail = (v: string) => /@/.test(v || "");

/**
 * For the shared "email or mobile" login field: leave emails untouched, but
 * coerce a bare Indian mobile to E.164 so users can type just 10 digits.
 */
export function normalizeLoginIdentifier(raw: string): string {
  const v = (raw || "").trim();
  if (isEmail(v)) return v;
  return toIndianE164(v) || v;
}
