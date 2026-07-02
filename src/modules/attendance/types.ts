import { LatLng } from "@modules/trip/types";

export interface ScanPayload {
  tripId: string;
  token: string;
  method?: string;
  gps?: LatLng;
}

export interface ScanResult {
  studentId: string;
  studentName: string;
  /** "pickup" | "drop" — the attendance type recorded. */
  type: string;
  status: string;
  recordedAt: string;
}
