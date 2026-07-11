import React, { useEffect, useRef } from "react";
import type { MapViewProps, MapMarker } from "./map.types";

// (helpers below)

/**
 * Web map on OpenStreetMap via vanilla Leaflet (no API key, no billing). Uses
 * Leaflet imperatively through a div ref to stay clear of react-leaflet's
 * React-version peer constraints. Leaflet CSS is injected once from the CDN.
 */

const ROUTE_COLOR = "#6366F1"; // indigo route line

function ensureLeafletCss() {
  if (typeof document === "undefined") return;
  if (document.getElementById("leaflet-css")) return;
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

/** A school-bus map pin (amber, the moving vehicle). */
function vehicleIcon(L: typeof import("leaflet")) {
  return L.divIcon({
    className: "",
    html: `<div style="filter:drop-shadow(0 3px 5px rgba(16,24,40,.35))">
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
        <circle cx="21" cy="21" r="16" fill="#F79009" stroke="#fff" stroke-width="3"/>
        <rect x="12.5" y="14.5" width="17" height="11.5" rx="2.5" fill="#fff"/>
        <rect x="14" y="16.5" width="4" height="3.6" rx="1" fill="#F79009"/>
        <rect x="19" y="16.5" width="4" height="3.6" rx="1" fill="#F79009"/>
        <rect x="24" y="16.5" width="3.5" height="3.6" rx="1" fill="#F79009"/>
        <circle cx="16" cy="27" r="2.1" fill="#1E293B"/>
        <circle cx="26" cy="27" r="2.1" fill="#1E293B"/>
      </svg></div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

/** A destination teardrop pin (the pickup / drop point). */
function pinIcon(L: typeof import("leaflet"), color = "#EF4444") {
  return L.divIcon({
    className: "",
    html: `<div style="filter:drop-shadow(0 3px 5px rgba(16,24,40,.35))">
      <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
        <path d="M15 2C8.4 2 3 7.4 3 14c0 8.4 12 24 12 24s12-15.6 12-24C27 7.4 21.6 2 15 2z" fill="${color}" stroke="#fff" stroke-width="2.5"/>
        <circle cx="15" cy="14" r="4.6" fill="#fff"/>
      </svg></div>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });
}

function iconFor(kind: MapMarker["kind"], L: typeof import("leaflet")) {
  if (kind === "vehicle") return vehicleIcon(L);
  if (kind === "school") return pinIcon(L, "#EA580C");
  return pinIcon(L, "#EF4444");
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
  // Always-latest markers so the async Leaflet init can't race stale data.
  const markersRef = useRef(markers);

  const focus =
    center ||
    (markers[0]
      ? { lat: markers[0].lat, lng: markers[0].lng }
      : { lat: 12.9716, lng: 77.5946 });

  const renderMarkers = () => {
    const L = LRef.current;
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!L || !layer) return;
    const markers = markersRef.current;
    layer.clearLayers();

    // Route line from the vehicle to the destination (gently curved).
    const vehicle = markers.find((m) => m.kind === "vehicle");
    const dest = markers.find((m) => m.kind !== "vehicle");
    if (vehicle && dest) {
      const mid: [number, number] = [
        (vehicle.lat + dest.lat) / 2 + (dest.lng - vehicle.lng) * 0.12,
        (vehicle.lng + dest.lng) / 2 - (dest.lat - vehicle.lat) * 0.12,
      ];
      L.polyline([[vehicle.lat, vehicle.lng], mid, [dest.lat, dest.lng]], {
        color: ROUTE_COLOR,
        weight: 4,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(layer);
    }

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], {
        icon: iconFor(m.kind, L),
      });
      if (m.label) marker.bindPopup(m.label);
      if (onMarkerPress) marker.on("click", () => onMarkerPress(m.id));
      marker.addTo(layer);
    });

    // Frame both the bus and the destination when we have a route.
    if (map && vehicle && dest) {
      map.fitBounds(
        [
          [vehicle.lat, vehicle.lng],
          [dest.lat, dest.lng],
        ],
        { padding: [56, 56], maxZoom: 15 },
      );
    }
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
      // Correct the size once the container has laid out, then draw markers.
      setTimeout(() => {
        map.invalidateSize();
        renderMarkers();
      }, 60);
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

  // Keep the ref current before any render pass reads it.
  useEffect(() => {
    markersRef.current = markers;
  });

  // Re-render markers + route when data changes. fitBounds (in renderMarkers)
  // frames both points; only pan for a lone marker.
  useEffect(() => {
    markersRef.current = markers;
    renderMarkers();
    const map = mapRef.current;
    const hasRoute =
      markers.some((m) => m.kind === "vehicle") &&
      markers.some((m) => m.kind !== "vehicle");
    if (map && center && !hasRoute) map.panTo([center.lat, center.lng]);
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
