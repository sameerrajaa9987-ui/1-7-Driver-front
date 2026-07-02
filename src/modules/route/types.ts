export interface Route {
  id: string;
  name: string;
  description: string;
  driverId: string | null;
  vehicleId: string | null;
  studentIds: string[];
  studentCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface RoutePayload {
  name: string;
  description?: string;
  driverId?: string | null;
  vehicleId?: string | null;
  studentIds?: string[];
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
