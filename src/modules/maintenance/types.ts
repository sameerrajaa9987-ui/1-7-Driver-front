export type MaintenanceKind = "fuel" | "service";

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  kind: MaintenanceKind;
  date: string;
  cost: number;
  odometer: number | null;
  litres: number | null;
  serviceType: string | null;
  notes: string | null;
  nextDueDate: string | null;
  createdAt: string;
}

export interface MaintenancePayload {
  vehicleId: string;
  kind: MaintenanceKind;
  date: string;
  cost: number;
  odometer?: number;
  litres?: number;
  serviceType?: string;
  notes?: string;
  nextDueDate?: string;
}

export interface MaintenanceSummary {
  fuelCost: number;
  serviceCost: number;
  totalCost: number;
  litres: number;
  records: number;
  nextServiceDue: string | null;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
