export type BehaviourRating = "excellent" | "good" | "fair" | "poor";

export interface DriverScore {
  driverId: string;
  driverName: string;
  overspeed: number;
  harshAccel: number;
  harshBrake: number;
  totalEvents: number;
  score: number;
  rating: BehaviourRating;
}

export interface TelematicsEvent {
  id: string;
  driverId: string;
  driverName: string;
  type: string;
  value: number | null;
  location: string | null;
  occurredAt: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
