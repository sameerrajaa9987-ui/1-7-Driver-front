import { environment } from "@config/env";

/** Absolute URL for backend-served media like "/uploads/xyz.jpg". */
export function mediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path) || path.startsWith("data:")) return path;
  const origin = environment.apiUrl.replace(/\/api\/v1\/?$/, "");
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}
