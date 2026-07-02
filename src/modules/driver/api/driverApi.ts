import { apiClient } from "@api/apiClient";
import { Driver, DriverPayload, Paginated } from "@modules/driver/types";

export const driverApi = {
  list: async (params?: { search?: string }) => {
    const res = await apiClient.get<Paginated<Driver>>("/drivers", { params });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Driver }>(
      `/drivers/${id}`,
    );
    return res.data.data;
  },
  create: async (payload: DriverPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Driver }>(
      "/drivers",
      payload,
    );
    return res.data.data;
  },
  update: async (
    id: string,
    payload: Partial<DriverPayload> & { isActive?: boolean },
  ) => {
    const res = await apiClient.patch<{ success: boolean; data: Driver }>(
      `/drivers/${id}`,
      payload,
    );
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/drivers/${id}`);
    return res.data;
  },
};
