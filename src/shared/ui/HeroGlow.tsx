/**
 * HeroGlow — soft light orbs layered inside the midnight hero panels
 * (2026 "dark theme + glowing accents"). Pure Views, zero dependencies:
 * an amber dawn glow top-right and a faint cobalt wash bottom-left give the
 * flat gradient atmospheric depth. Render as the FIRST child inside the
 * hero's LinearGradient (siblings render above it).
 */
import React from "react";
import { View, StyleSheet } from "react-native";

export function HeroGlow() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.orb, styles.amber]} />
      <View style={[styles.orb, styles.amberCore]} />
      <View style={[styles.orb, styles.cobalt]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: "absolute", borderRadius: 999 },
  amber: {
    top: -110,
    right: -70,
    width: 260,
    height: 260,
    backgroundColor: "rgba(240,167,10,0.14)",
  },
  amberCore: {
    top: -60,
    right: -20,
    width: 140,
    height: 140,
    backgroundColor: "rgba(248,184,30,0.10)",
  },
  cobalt: {
    bottom: -120,
    left: -80,
    width: 240,
    height: 240,
    backgroundColor: "rgba(59,130,246,0.10)",
  },
});
