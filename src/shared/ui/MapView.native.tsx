import React, { useEffect, useMemo, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import type { MapViewProps, MapMarker } from "./map.types";

/**
 * Native map — Leaflet + OpenStreetMap inside a WebView. Runs everywhere
 * (Expo Go, dev builds, store builds) with no native map module and no API
 * key, and matches the web implementation exactly. Marker/center updates are
 * injected into the running page — no reloads while the van moves.
 */

const KIND_COLOR: Record<NonNullable<MapMarker["kind"]>, string> = {
  vehicle: "#D68806", // bus-amber — the vehicle IS the school bus
  student: "#2563EB",
  home: "#7C3AED",
  school: "#EA580C",
};

function buildHtml(center: { lat: number; lng: number }, zoom: number) {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #F1EFEA; }
  .dot { border-radius: 50%; border: 2.5px solid #FFFFFF; box-shadow: 0 1px 4px rgba(11,21,38,0.4); }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl: false }).setView([${center.lat}, ${center.lng}], ${zoom});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19
  }).addTo(map);
  var layer = L.layerGroup().addTo(map);

  function dot(color) {
    return L.divIcon({
      className: '',
      html: '<div class="dot" style="width:18px;height:18px;background:' + color + '"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  }

  window.__setState = function (markers, center) {
    layer.clearLayers();
    (markers || []).forEach(function (m) {
      var marker = L.marker([m.lat, m.lng], { icon: dot(m.color) });
      if (m.label) marker.bindPopup(m.label);
      marker.on('click', function () {
        if (window.ReactNativeWebView)
          window.ReactNativeWebView.postMessage(String(m.id));
      });
      marker.addTo(layer);
    });
    if (center) map.panTo([center.lat, center.lng]);
  };
</script>
</body>
</html>`;
}

export default function LiveMap({
  markers = [],
  center,
  zoom = 14,
  height = 260,
  onMarkerPress,
}: MapViewProps) {
  const webRef = useRef<WebView>(null);

  const focus =
    center ||
    (markers[0]
      ? { lat: markers[0].lat, lng: markers[0].lng }
      : { lat: 12.9716, lng: 77.5946 });

  // The page is created once; marker/center changes are injected below.
  const html = useMemo(() => buildHtml(focus, zoom), []); // eslint-disable-line react-hooks/exhaustive-deps

  const payload = useMemo(
    () =>
      JSON.stringify(
        markers.map((m) => ({
          id: m.id,
          lat: m.lat,
          lng: m.lng,
          label: m.label || "",
          color: KIND_COLOR[m.kind || "student"],
        })),
      ),
    [markers],
  );

  useEffect(() => {
    const js = `window.__setState && window.__setState(${payload}, ${
      center ? JSON.stringify({ lat: center.lat, lng: center.lng }) : "null"
    }); true;`;
    webRef.current?.injectJavaScript(js);
  }, [payload, center?.lat, center?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View
      style={{
        height,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E7E4DD",
        backgroundColor: "#F1EFEA",
      }}
    >
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html }}
        onLoadEnd={() =>
          webRef.current?.injectJavaScript(
            `window.__setState && window.__setState(${payload}, null); true;`,
          )
        }
        onMessage={(e) => onMarkerPress?.(e.nativeEvent.data)}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        style={{ flex: 1, backgroundColor: "transparent" }}
      />
    </View>
  );
}
