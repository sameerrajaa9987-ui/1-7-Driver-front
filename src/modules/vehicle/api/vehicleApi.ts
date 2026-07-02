import { apiClient } from "@api/apiClient";
import { Vehicle, VehiclePayload, Paginated } from "@modules/vehicle/types";

export const vehicleApi = {
  list: async (params?: { search?: string }) => {
    const res = await apiClient.get<Paginated<Vehicle>>("/vehicles", {
      params,
    });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Vehicle }>(
      `/vehicles/${id}`,
    );
    return res.data.data;
  },
  create: async (payload: VehiclePayload) => {
    const res = await apiClient.post<{ success: boolean; data: Vehicle }>(
      "/vehicles",
      payload,
    );
    return res.data.data;
  },
  update: async (
    id: string,
    payload: Partial<VehiclePayload> & { isActive?: boolean },
  ) => {
    const res = await apiClient.patch<{ success: boolean; data: Vehicle }>(
      `/vehicles/${id}`,
      payload,
    );
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/vehicles/${id}`);
    return res.data;
  },
};
