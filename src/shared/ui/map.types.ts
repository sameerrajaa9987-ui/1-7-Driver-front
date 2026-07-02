export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  /** Visual role of the marker — drives its colour/emoji. */
  kind?: "vehicle" | "student" | "home" | "school";
}

export interface MapViewProps {
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: number;
  onMarkerPress?: (id: string) => void;
}
