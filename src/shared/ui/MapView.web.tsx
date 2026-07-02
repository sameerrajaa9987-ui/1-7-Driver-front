import React, { useEffect, useRef } from "react";
import type { MapViewProps, MapMarker } from "./map.types";

/**
 * Web map on OpenStreetMap via vanilla Leaflet (no API key, no billing). Uses
 * Leaflet imperatively through a div ref to stay clear of react-leaflet's
 * React-version peer constraints. Leaflet CSS is injected once from the CDN.
 */

const KIND_COLOR: Record<NonNullable<MapMarker["kind"]>, string> = {
  vehicle: "#D68806", // bus-amber — the vehicle IS the school bus
  student: "#2563EB",
  home: "#7C3AED",
  school: "#EA580C",
};

function ensureLeafletCss() {
  if (typeof document === "undefined") return;
  if (document.getElementById("leaflet-css")) return;
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

function dot(color: string, L: typeof import("leaflet")) {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function LiveMap({
  markers = [],
  center,
  zoom = 14,
  height = 260,
  onMarkerPress,
}: MapViewProps) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const LRef = useRef<typeof import("leaflet") | null>(null);

  const focus =
    center ||
    (markers[0]
      ? { lat: markers[0].lat, lng: markers[0].lng }
      : { lat: 12.9716, lng: 77.5946 });

  const renderMarkers = () => {
    const L = LRef.current;
    const layer = layerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], {
        icon: dot(KIND_COLOR[m.kind || "student"], L),
      });
      if (m.label) marker.bindPopup(m.label);
      if (onMarkerPress) marker.on("click", () => onMarkerPress(m.id));
      marker.addTo(layer);
    });
  };

  useEffect(() => {
    ensureLeafletCss();
    let disposed = false;
    (async () => {
      const L = (await import("leaflet")).default ?? (await import("leaflet"));
      if (disposed || !divRef.current || mapRef.current) return;
      LRef.current = L as typeof import("leaflet");
      const map = L.map(divRef.current).setView([focus.lat, focus.lng], zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      renderMarkers();
    })();
    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render markers + recenter on the vehicle when data changes.
  useEffect(() => {
    renderMarkers();
    const L = LRef.current;
    const map = mapRef.current;
    if (map && center) map.panTo([center.lat, center.lng]);
    void L;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(markers), center?.lat, center?.lng]);

  return (
    <div
      ref={divRef}
      style={{
        height,
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
      }}
    />
  );
}
