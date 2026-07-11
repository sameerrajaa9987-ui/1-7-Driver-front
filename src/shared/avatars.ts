/**
 * Illustrated avatars via DiceBear (MIT core). We use the CC0 "Open Peeps"
 * style (Pablo Stanley) — warm, hand-drawn characters, no attribution required.
 * Deterministic per seed (a student id), so a child always gets the same face,
 * generated locally (no network) and cached. Rendered through `SvgXml`.
 */
import { createAvatar } from "@dicebear/core";
import { openPeeps } from "@dicebear/collection";

const cache = new Map<string, string>();

// Soft, on-brand disc backgrounds (hex without '#').
const BG = [
  "eef2ff",
  "e8f7ee",
  "fef4e6",
  "fdecf3",
  "eaf3ff",
  "f4eeff",
  "e7f6f5",
];

export function childAvatarSvg(seed?: string): string {
  const key = seed || "child";
  const hit = cache.get(key);
  if (hit) return hit;
  const svg = createAvatar(openPeeps, {
    seed: key,
    size: 96,
    radius: 50,
    backgroundColor: BG,
  }).toString();
  cache.set(key, svg);
  return svg;
}
