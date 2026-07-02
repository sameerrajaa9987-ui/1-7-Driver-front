import { apiClient } from "@api/apiClient";
import { Branch, BranchPayload, Paginated } from "@modules/branch/types";

export const branchApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await apiClient.get<Paginated<Branch>>("/branches", { params });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Branch }>(
      `/branches/${id}`,
    );
    return res.data.data;
  },
  create: async (payload: BranchPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Branch }>(
      "/branches",
      payload,
    );
    return res.data.data;
  },
  update: async (
    id: string,
    payload: Partial<BranchPayload> & { isActive?: boolean },
  ) => {
    const res = await apiClient.patch<{ success: boolean; data: Branch }>(
      `/branches/${id}`,
      payload,
    );
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/branches/${id}`);
    return res.data;
  },
};
