import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { MapPin } from "lucide-react-native";
import type { MapViewProps } from "./map.types";

/**
 * Native map — Leaflet + OpenStreetMap inside a WebView. Runs everywhere
 * (Expo Go, dev builds, store builds) with no native map module and no API
 * key, and matches the web implementation exactly. Marker/center updates are
 * injected into the running page — no reloads while the van moves.
 */

function buildHtml(center: { lat: number; lng: number }, zoom: number) {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #F1EFEA; }
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

  function vehicleIcon() {
    return L.divIcon({ className: '', iconSize: [42,42], iconAnchor: [21,21],
      html: '<div style="filter:drop-shadow(0 3px 5px rgba(16,24,40,.35))"><svg width="42" height="42" viewBox="0 0 42 42" fill="none"><circle cx="21" cy="21" r="16" fill="#F79009" stroke="#fff" stroke-width="3"/><rect x="12.5" y="14.5" width="17" height="11.5" rx="2.5" fill="#fff"/><rect x="14" y="16.5" width="4" height="3.6" rx="1" fill="#F79009"/><rect x="19" y="16.5" width="4" height="3.6" rx="1" fill="#F79009"/><rect x="24" y="16.5" width="3.5" height="3.6" rx="1" fill="#F79009"/><circle cx="16" cy="27" r="2.1" fill="#1E293B"/><circle cx="26" cy="27" r="2.1" fill="#1E293B"/></svg></div>' });
  }
  function pinIcon(color) {
    return L.divIcon({ className: '', iconSize: [30,40], iconAnchor: [15,40],
      html: '<div style="filter:drop-shadow(0 3px 5px rgba(16,24,40,.35))"><svg width="30" height="40" viewBox="0 0 30 40" fill="none"><path d="M15 2C8.4 2 3 7.4 3 14c0 8.4 12 24 12 24s12-15.6 12-24C27 7.4 21.6 2 15 2z" fill="' + color + '" stroke="#fff" stroke-width="2.5"/><circle cx="15" cy="14" r="4.6" fill="#fff"/></svg></div>' });
  }
  function iconFor(kind) {
    if (kind === 'vehicle') return vehicleIcon();
    if (kind === 'school') return pinIcon('#EA580C');
    return pinIcon('#EF4444');
  }

  window.__setState = function (markers, center) {
    layer.clearLayers();
    markers = markers || [];
    var v = null, d = null;
    markers.forEach(function (m) { if (m.kind === 'vehicle') v = m; else if (!d) d = m; });
    if (v && d) {
      var mid = [ (v.lat+d.lat)/2 + (d.lng-v.lng)*0.12, (v.lng+d.lng)/2 - (d.lat-v.lat)*0.12 ];
      L.polyline([[v.lat,v.lng], mid, [d.lat,d.lng]], { color:'#6366F1', weight:4, opacity:0.85, lineCap:'round', lineJoin:'round' }).addTo(layer);
    }
    markers.forEach(function (m) {
      var marker = L.marker([m.lat, m.lng], { icon: iconFor(m.kind) });
      if (m.label) marker.bindPopup(m.label);
      marker.on('click', function () {
        if (window.ReactNativeWebView)
          window.ReactNativeWebView.postMessage(String(m.id));
      });
      marker.addTo(layer);
    });
    if (v && d) {
      map.fitBounds([[v.lat,v.lng],[d.lat,d.lng]], { padding: [56,56], maxZoom: 15 });
    } else if (center) {
      map.panTo([center.lat, center.lng]);
    }
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
  overlay,
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
          kind: m.kind || "student",
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
      {overlay ? (
        <View style={ov.card} pointerEvents="none">
          <View style={ov.pin}>
            <MapPin size={14} color="#EF4444" strokeWidth={2.4} />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text style={ov.title}>{overlay.title}</Text>
            <Text style={ov.subtitle} numberOfLines={1}>
              {overlay.subtitle}
            </Text>
            {overlay.caption ? (
              <Text style={ov.title}>{overlay.caption}</Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const ov = StyleSheet.create({
  card: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 210,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 6,
  },
  pin: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#FEECEB",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 11, color: "#667085" },
  subtitle: { fontSize: 13, fontWeight: "700", color: "#101828" },
});
