export type SosStatus = "active" | "resolved";

export interface SosAlert {
  id: string;
  driverId: string | null;
  driverName: string;
  tripId: string | null;
  lat: number;
  lng: number;
  message: string;
  status: SosStatus;
  resolvedAt: string | null;
  createdAt: string;
}

export interface TriggerSosPayload {
  tripId?: string;
  lat: number;
  lng: number;
  message?: string;
}

export interface SosListParams {
  page?: number;
  limit?: number;
  status?: SosStatus;
}

/** Socket "sos:alert" payload. */
export interface SosAlertEvent {
  id: string;
  driverName: string;
  tripId: string | null;
  lat: number;
  lng: number;
  message: string;
  at: string;
}

/** Socket "sos:resolved" payload. */
export interface SosResolvedEvent {
  id: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
