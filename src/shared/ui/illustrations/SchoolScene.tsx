/**
 * SchoolScene — a flat school-building illustration for the school dashboard
 * banner. Hand-authored inline SVG (amber building, red bell-tower roof, flag,
 * clock, arched indigo door) rendered via `SvgXml` on a soft indigo disc, in
 * the same visual family as [[BusScene]]. Swappable for the client's exact art.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";

const SCHOOL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="none"><path fill="#F79009" d="M4 24h24v3H4z"/><path fill="#FDB022" d="M6 14h20v11H6z"/><path fill="#FDB022" d="M13 8h6v17h-6z"/><path fill="#F79009" d="M6 13h20v1.6H6z"/><path fill="#F92F60" d="M16 4l4.5 5h-9z"/><path fill="#212121" d="M15.7 1.6h0.6v2.6h-0.6z"/><path fill="#F92F60" d="M16.3 1.9l2.9 0.9l-2.9 0.9z"/><circle cx="16" cy="12.1" r="1.7" fill="#FFFFFF"/><path fill="#212121" d="M15.8 10.8h0.4v1.4h-0.4z"/><path fill="#4338CA" d="M14 25v-3.6a2 2 0 0 1 4 0V25z"/><path fill="#7CC8F5" d="M8 16.5h3.2v3.2H8z"/><path fill="#7CC8F5" d="M20.8 16.5h3.2v3.2h-3.2z"/></g></svg>`;

export function SchoolScene({ size = 150 }: { size?: number }) {
  const disc = size * 0.92;
  const art = size * 0.66;
  return (
    <View style={[styles.wrap, { width: size, height: size * 0.82 }]}>
      <View
        style={[
          styles.disc,
          { width: disc, height: disc, borderRadius: disc / 2 },
        ]}
      />
      {/* zIndex keeps the art above the absolute disc on react-native-web,
          where a positioned sibling otherwise paints over static children. */}
      <View style={styles.art}>
        <SvgXml xml={SCHOOL} width={art} height={art} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  disc: { position: "absolute", backgroundColor: "#EEF2FF", zIndex: 0 },
  art: { zIndex: 1 },
});
