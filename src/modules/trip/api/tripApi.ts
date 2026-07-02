import { apiClient } from "@api/apiClient";
import {
  DropActionPayload,
  Paginated,
  RouteLite,
  StartTripPayload,
  StopActionPayload,
  StudentLite,
  Trip,
  TripListParams,
} from "@modules/trip/types";

export const tripApi = {
  list: async (params?: TripListParams) => {
    const res = await apiClient.get<Paginated<Trip>>("/trips", { params });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Trip }>(
      `/trips/${id}`,
    );
    return res.data.data;
  },
  start: async (payload: StartTripPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Trip }>(
      "/trips/start",
      payload,
    );
    return res.data.data;
  },
  arrive: async (id: string, payload: StopActionPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Trip }>(
      `/trips/${id}/arrive`,
      payload,
    );
    return res.data.data;
  },
  pickup: async (id: string, payload: StopActionPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Trip }>(
      `/trips/${id}/pickup`,
      payload,
    );
    return res.data.data;
  },
  noShow: async (id: string, payload: StopActionPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Trip }>(
      `/trips/${id}/no-show`,
      payload,
    );
    return res.data.data;
  },
  drop: async (id: string, payload: DropActionPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Trip }>(
      `/trips/${id}/drop`,
      payload,
    );
    return res.data.data;
  },
  reachSchool: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: Trip }>(
      `/trips/${id}/reach-school`,
    );
    return res.data.data;
  },
  complete: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: Trip }>(
      `/trips/${id}/complete`,
    );
    return res.data.data;
  },

  // Helpers used when starting / rendering a trip.
  listRoutes: async () => {
    const res = await apiClient.get<Paginated<RouteLite>>("/routes", {
      params: { limit: 100 },
    });
    return res.data;
  },
  listStudents: async (params?: { routeId?: string; status?: string }) => {
    const res = await apiClient.get<Paginated<StudentLite>>("/students", {
      params: { limit: 200, ...params },
    });
    return res.data;
  },
};
