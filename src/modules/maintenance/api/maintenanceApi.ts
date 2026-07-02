import { apiClient } from "@api/apiClient";
import {
  MaintenanceRecord,
  MaintenancePayload,
  MaintenanceSummary,
  Paginated,
} from "@modules/maintenance/types";

export interface FleetVehicleAnalytics {
  vehicleId: string;
  vehicleNumber: string;
  model: string;
  students: number;
  expectedMonthly: number;
  collectedThisMonth: number;
  costThisMonth: number;
  marginThisMonth: number;
}

export interface FleetAnalytics {
  month: string;
  vehicles: FleetVehicleAnalytics[];
  totals: {
    expectedMonthly: number;
    collectedThisMonth: number;
    costThisMonth: number;
    marginThisMonth: number;
  };
}

export const maintenanceApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    vehicleId?: string;
    kind?: string;
  }) => {
    const res = await apiClient.get<Paginated<MaintenanceRecord>>(
      "/maintenance",
      { params },
    );
    return res.data;
  },
  summary: async (vehicleId?: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: MaintenanceSummary;
    }>("/maintenance/summary", {
      params: vehicleId ? { vehicleId } : undefined,
    });
    return res.data.data;
  },
  /** Per-vehicle profitability (revenue vs running cost, current month). */
  analytics: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: FleetAnalytics;
    }>("/maintenance/analytics");
    return res.data.data;
  },
  create: async (payload: MaintenancePayload) => {
    const res = await apiClient.post<{
      success: boolean;
      data: MaintenanceRecord;
    }>("/maintenance", payload);
    return res.data.data;
  },
  update: async (id: string, payload: Partial<MaintenancePayload>) => {
    const res = await apiClient.patch<{
      success: boolean;
      data: MaintenanceRecord;
    }>(`/maintenance/${id}`, payload);
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/maintenance/${id}`);
    return res.data;
  },
};
