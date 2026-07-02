import { Platform } from "react-native";
import { LatLng, StopStatus, TripStatus, TripType } from "@modules/trip/types";

/** Fallback coordinate used when location permission is denied (demo only). */
export const DEMO_COORD: LatLng = { lat: 12.9716, lng: 77.5946 };

/** Today's date as YYYY-MM-DD (local). */
export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Best-effort current GPS position. Guarded so it works on web (falls back to
 * navigator.geolocation) and never throws — returns DEMO_COORD if unavailable.
 */
export async function getCurrentCoord(): Promise<LatLng> {
  // Web: prefer the browser geolocation API.
  if (Platform.OS === "web") {
    try {
      const nav = (globalThis as any)?.navigator;
      if (nav?.geolocation?.getCurrentPosition) {
        return await new Promise<LatLng>((resolve) => {
          nav.geolocation.getCurrentPosition(
            (pos: any) =>
              resolve({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              }),
            () => resolve(DEMO_COORD),
            { enableHighAccuracy: true, timeout: 8000 },
          );
        });
      }
    } catch {
      /* ignore */
    }
    return DEMO_COORD;
  }

  // Native: use expo-location.
  try {
    const Location = await import("expo-location");
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return DEMO_COORD;
    const pos = await Location.getCurrentPositionAsync({});
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return DEMO_COORD;
  }
}

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export const TRIP_STATUS_META: Record<
  TripStatus,
  { label: string; tone: Tone }
> = {
  not_started: { label: "Not started", tone: "neutral" },
  in_progress: { label: "In progress", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export const STOP_STATUS_META: Record<
  StopStatus,
  { label: string; tone: Tone }
> = {
  pending: { label: "Pending", tone: "neutral" },
  arrived: { label: "Arrived", tone: "warning" },
  picked_up: { label: "Picked up", tone: "success" },
  no_show: { label: "No show", tone: "danger" },
  dropped: { label: "Dropped", tone: "success" },
};

export const TRIP_TYPE_LABEL: Record<TripType, string> = {
  pickup: "Pickup",
  drop: "Drop",
};

/** A stop is finished when it has reached a terminal state. */
export function isStopDone(status: StopStatus): boolean {
  return status === "picked_up" || status === "no_show" || status === "dropped";
}
