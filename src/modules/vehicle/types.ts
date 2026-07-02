export interface Vehicle {
  id: string;
  vehicleNumber: string;
  model: string;
  seatingCapacity: number;
  image: string;
  assignedDriverId: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface VehiclePayload {
  vehicleNumber: string;
  model?: string;
  seatingCapacity?: number;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
