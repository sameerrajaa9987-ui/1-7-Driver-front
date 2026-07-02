import React from "react";
import { View } from "react-native";
import type { MapViewProps } from "./map.types";

/**
 * Fallback map (used only if no platform-specific file resolves). The real
 * implementations live in MapView.web.tsx (Leaflet + OpenStreetMap) and
 * MapView.native.tsx (Leaflet inside a WebView — works in Expo Go and store
 * builds with no native map module). This file also serves as the module's
 * TypeScript resolution target.
 */
export default function LiveMap({ height = 260 }: MapViewProps) {
  return (
    <View style={{ height, backgroundColor: "#E2E8F0", borderRadius: 16 }} />
  );
}
