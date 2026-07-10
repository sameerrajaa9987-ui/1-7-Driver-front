import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { palette, radius } from "../designSystem";
import { Text } from "./Text";

interface Props {
  name: string;
  size?: number;
  tone?: "teal" | "cobalt" | "slate";
  /** Uploaded photo URL. When absent, a deterministic placeholder portrait
   *  (client-mockup style) is used; set `photo={null}` + `placeholder={false}`
   *  to force initials. */
  photo?: string | null;
  placeholder?: boolean;
  /** Stable seed for the placeholder portrait (e.g. the student id). */
  seed?: string;
}

const FILLS = {
  teal: { bg: palette.teal[100], fg: palette.teal[700] },
  cobalt: { bg: palette.cobalt[100], fg: palette.cobalt[700] },
  slate: { bg: palette.ink[100], fg: palette.ink[700] },
} as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

/** Deterministic placeholder portrait per seed (mockup-style headshots). */
export function placeholderPortrait(seed: string) {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;
}

export function Avatar({
  name,
  size = 40,
  tone = "teal",
  photo,
  placeholder = true,
  seed,
}: Props) {
  const c = FILLS[tone];
  const uri = photo || (placeholder && seed ? placeholderPortrait(seed) : "");

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: c.bg,
        }}
      />
    );
  }
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
