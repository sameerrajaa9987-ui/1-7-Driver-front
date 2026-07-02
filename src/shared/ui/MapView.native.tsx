import React from "react";
import { View } from "react-native";
import MapViewRN, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import type { MapViewProps, MapMarker } from "./map.types";

/**
 * Native map on react-native-maps with the platform's default provider
 * (OpenStreetMap-compatible; no Google key required for the default provider).
 */

const KIND_COLOR: Record<NonNullable<MapMarker["kind"]>, string> = {
  vehicle: "#D68806", // bus-amber — the vehicle IS the school bus
  student: "#2563EB",
  home: "#7C3AED",
  school: "#EA580C",
};

export default function LiveMap({
  markers = [],
  center,
  zoom = 14,
  height = 260,
  onMarkerPress,
}: MapViewProps) {
  const focus =
    center ||
    (markers[0]
      ? { lat: markers[0].lat, lng: markers[0].lng }
      : { lat: 12.9716, lng: 77.5946 });

  // Approximate zoom → latitude delta.
  const delta = 360 / 2 ** zoom;

  return (
    <View style={{ height, borderRadius: 16, overflow: "hidden" }}>
      <MapViewRN
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        region={{
          latitude: focus.lat,
          longitude: focus.lng,
          latitudeDelta: delta,
          longitudeDelta: delta,
        }}
      >
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.lat, longitude: m.lng }}
            title={m.label}
            pinColor={KIND_COLOR[m.kind || "student"]}
            onPress={() => onMarkerPress?.(m.id)}
          />
        ))}
      </MapViewRN>
    </View>
  );
}
