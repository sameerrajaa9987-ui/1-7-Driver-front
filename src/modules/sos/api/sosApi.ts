import { apiClient } from "@api/apiClient";
import {
  SosAlert,
  SosListParams,
  TriggerSosPayload,
  Paginated,
} from "@modules/sos/types";

export const sosApi = {
  // Admin-only: paginated list of SOS alerts.
  list: async (params?: SosListParams) => {
    const res = await apiClient.get<Paginated<SosAlert>>("/sos", { params });
    return res.data;
  },
  // Driver: raise an emergency alert.
  trigger: async (payload: TriggerSosPayload) => {
    const res = await apiClient.post<{ success: boolean; data: SosAlert }>(
      "/sos",
      payload,
    );
    return res.data.data;
  },
  // Admin: mark an alert resolved.
  resolve: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: SosAlert }>(
      `/sos/${id}/resolve`,
    );
    return res.data.data;
  },
};
