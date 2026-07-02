import { apiClient } from "@api/apiClient";
import {
  DriverScore,
  TelematicsEvent,
  Paginated,
} from "@modules/telematics/types";

export const telematicsApi = {
  scores: async () => {
    const res = await apiClient.get<{ success: boolean; data: DriverScore[] }>(
      "/telematics/scores",
    );
    return res.data.data;
  },
  events: async (params?: {
    driverId?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get<Paginated<TelematicsEvent>>(
      "/telematics/events",
      { params },
    );
    return res.data;
  },
};
