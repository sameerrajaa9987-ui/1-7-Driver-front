export type TripType = "pickup" | "drop";

export type TripStatus =
  "not_started" | "in_progress" | "completed" | "cancelled";

export type StopStatus =
  "pending" | "arrived" | "picked_up" | "no_show" | "dropped";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface TripStop {
  studentId: string;
  studentName: string;
  parentUserId: string | null;
  order: number;
  status: StopStatus;
  arrivedAt: string | null;
  completedAt: string | null;
  receivedBy: string;
  handoverPhoto: string;
}

export interface Trip {
  id: string;
  routeId: string | null;
  driverId: string | null;
  vehicleId: string | null;
  date: string;
  type: TripType;
  status: TripStatus;
  stops: TripStop[];
  startedAt: string | null;
  reachedSchoolAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface TripListParams {
  page?: number;
  limit?: number;
  date?: string;
  status?: TripStatus;
  type?: TripType;
  routeId?: string;
}

export interface StartTripPayload {
  routeId: string;
  type: TripType;
}

export interface StopActionPayload {
  studentId: string;
  gps?: LatLng;
}

export interface DropActionPayload extends StopActionPayload {
  receivedBy?: string;
}

/** Live "trip:update" socket payload (a lean projection of a Trip). */
export interface TripUpdateEvent {
  id: string;
  routeId: string | null;
  driverId: string | null;
  type: TripType;
  status: TripStatus;
  date: string;
  stops: {
    studentId: string;
    studentName: string;
    order: number;
    status: StopStatus;
    arrivedAt: string | null;
    completedAt: string | null;
  }[];
}

/** List envelope: `{ success, data, meta }`. */
export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

/** A route as returned by GET /routes (only the fields we need here). */
export interface RouteLite {
  id: string;
  name: string;
  description: string;
  driverId: string | null;
  vehicleId: string | null;
  studentIds: string[];
  studentCount: number;
  isActive: boolean;
}

/** A student as returned by GET /students (only the fields we need here). */
export interface StudentLite {
  id: string;
  name: string;
  routeId: string | null;
  pickupPoint: LatLng | null;
  homeAddress: string;
  schoolName: string;
  mobile?: string;
}
