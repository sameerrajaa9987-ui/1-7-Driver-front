import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { palette, radius } from "../designSystem";
import { Text } from "./Text";

interface Props {
  name: string;
  size?: number;
  /** Optional fixed tone; otherwise a deterministic colour from name/seed. */
  tone?: "teal" | "cobalt" | "slate";
  /** Uploaded photo URL. When absent, clean initials on a tinted disc. */
  photo?: string | null;
  /** Accepted for compatibility; no longer changes rendering. */
  placeholder?: boolean;
  /** Stable seed for the colour (e.g. a user/student id). Falls back to name. */
  seed?: string;
}

const FIXED = {
  teal: { bg: palette.teal[100], fg: palette.teal[700] },
  cobalt: { bg: palette.cobalt[100], fg: palette.cobalt[700] },
  slate: { bg: palette.ink[100], fg: palette.ink[700] },
} as const;

// Calm identity colours (soft bg + readable fg). Modern apps show multi-colour
// initials for people without a photo — far cleaner than random stock faces.
const PALETTE = [
  { bg: "#EEF2FF", fg: "#4F46E5" },
  { bg: "#E8F7EE", fg: "#12805C" },
  { bg: "#FEF4E6", fg: "#B54708" },
  { bg: "#FDECF3", fg: "#C11574" },
  { bg: "#EAF3FF", fg: "#175CD3" },
  { bg: "#F4EEFF", fg: "#6941C6" },
  { bg: "#E7F6F5", fg: "#107569" },
] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function colorFor(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/** Deprecated — kept so old imports still resolve; returns "" (no photo). */
export function placeholderPortrait() {
  return "";
}

export function Avatar({ name, size = 40, tone, photo, seed }: Props) {
  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        style={{
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: palette.ink[100],
        }}
      />
    );
  }

  const c = tone ? FIXED[tone] : colorFor(seed || name || "?");
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: c.bg,
        },
      ]}
    >
      <Text weight="700" style={{ color: c.fg, fontSize: size * 0.4 }}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
