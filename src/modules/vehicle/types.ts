export type VehicleDocKey = "rc" | "insurance" | "fitness" | "puc" | "permit";

export interface VehicleDoc {
  number: string;
  expiryDate: string | null;
}

export type VehicleDocuments = Record<VehicleDocKey, VehicleDoc>;

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  model: string;
  seatingCapacity: number;
  image: string;
  assignedDriverId: string | null;
  documents?: VehicleDocuments;
  isActive: boolean;
  createdAt: string;
}

export interface VehiclePayload {
  vehicleNumber: string;
  model?: string;
  seatingCapacity?: number;
  documents?: Partial<Record<VehicleDocKey, Partial<VehicleDoc>>>;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
