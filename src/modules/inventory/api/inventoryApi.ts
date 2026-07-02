import { apiClient } from "@api/apiClient";

export type InventoryStatus = "ok" | "low" | "replace" | "expired";
export type InventoryCategory = "safety" | "spare" | "supplies" | "other";

export interface InventoryItem {
  id: string;
  vehicleId: string | null;
  name: string;
  category: InventoryCategory;
  status: InventoryStatus;
  expiryDate: string | null;
  notes: string;
  createdAt: string;
}

export interface InventoryPayload {
  vehicleId?: string;
  name: string;
  category?: InventoryCategory;
  status?: InventoryStatus;
  expiryDate?: string | null;
  notes?: string;
}

export const inventoryApi = {
  list: async (params?: { vehicleId?: string; status?: InventoryStatus }) => {
    const res = await apiClient.get<{
      success: boolean;
      data: InventoryItem[];
      meta?: { total: number };
    }>("/inventory", { params });
    return res.data;
  },
  statusCounts: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: Record<InventoryStatus, number>;
    }>("/inventory/status-counts");
    return res.data.data;
  },
  create: async (payload: InventoryPayload) => {
    const res = await apiClient.post<{ success: boolean; data: InventoryItem }>(
      "/inventory",
      payload,
    );
    return res.data.data;
  },
  update: async (id: string, payload: Partial<InventoryPayload>) => {
    const res = await apiClient.patch<{
      success: boolean;
      data: InventoryItem;
    }>(`/inventory/${id}`, payload);
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/inventory/${id}`);
    return res.data;
  },
};
