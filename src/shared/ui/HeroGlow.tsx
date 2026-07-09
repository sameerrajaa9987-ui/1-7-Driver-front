/**
 * HeroGlow — intentionally a NO-OP in the Editorial Ledger system.
 *
 * Glowing orbs / gradient particles are the #1 "AI-generated" visual tell
 * (2026 design research). Heroes are now flat ink panels with editorial
 * typography instead. Kept as an exported no-op so existing `<HeroGlow />`
 * call-sites compile and render nothing — the look is removed centrally.
 */
import React from "react";

export function HeroGlow() {
  return null;
}
