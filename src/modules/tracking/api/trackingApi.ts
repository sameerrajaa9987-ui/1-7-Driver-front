import { apiClient } from "@api/apiClient";

export interface VehiclePosition {
  tripId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  at: string;
}

export interface IngestPayload {
  tripId: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
}

export const trackingApi = {
  /** Latest known position for a trip (polling fallback; socket is the live channel). */
  getForTrip: async (tripId: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: VehiclePosition | null;
    }>(`/tracking/trip/${tripId}`);
    return res.data.data;
  },

  /** Push one GPS frame (drivers only). */
  ingest: async (payload: IngestPayload) => {
    const res = await apiClient.post<{
      success: boolean;
      data: { ok: boolean };
    }>("/tracking/ingest", payload);
    return res.data.data;
  },
};
