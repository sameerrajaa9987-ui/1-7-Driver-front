import { apiClient } from "@api/apiClient";
import { Route, RoutePayload, Paginated } from "@modules/route/types";

export interface OptimizeResult {
  savedM: number;
  distanceBeforeM: number;
  distanceAfterM: number;
  stops: number;
}

export const routeApi = {
  list: async (params?: { search?: string }) => {
    const res = await apiClient.get<Paginated<Route>>("/routes", { params });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Route }>(
      `/routes/${id}`,
    );
    return res.data.data;
  },
  create: async (payload: RoutePayload) => {
    const res = await apiClient.post<{ success: boolean; data: Route }>(
      "/routes",
      payload,
    );
    return res.data.data;
  },
  update: async (
    id: string,
    payload: Partial<RoutePayload> & { isActive?: boolean },
  ) => {
    const res = await apiClient.patch<{ success: boolean; data: Route }>(
      `/routes/${id}`,
      payload,
    );
    return res.data.data;
  },
  setStudents: async (id: string, studentIds: string[]) => {
    const res = await apiClient.patch<{ success: boolean; data: Route }>(
      `/routes/${id}/students`,
      { studentIds },
    );
    return res.data.data;
  },
  substituteDriver: async (
    id: string,
    payload: { driverId: string; until?: string },
  ) => {
    const res = await apiClient.post<{ success: boolean; data: Route }>(
      `/routes/${id}/substitute`,
      payload,
    );
    return res.data.data;
  },
  optimize: async (routeId: string, start?: { lat: number; lng: number }) => {
    const res = await apiClient.post<{
      success: boolean;
      data: OptimizeResult;
    }>(`/routes/${routeId}/optimize`, { start });
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/routes/${id}`);
    return res.data;
  },
};
