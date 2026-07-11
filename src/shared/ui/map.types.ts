export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  /** Visual role of the marker — drives its colour/emoji. */
  kind?: "vehicle" | "student" | "home" | "school";
}

/** A small info card pinned to the map's top-right (e.g. the pickup point). */
export interface MapOverlay {
  title: string;
  subtitle?: string;
  caption?: string;
}

export interface MapViewProps {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: number;
  onMarkerPress?: (id: string) => void;
  overlay?: MapOverlay;
}
