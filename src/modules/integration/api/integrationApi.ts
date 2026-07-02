import { apiClient } from "@api/apiClient";
import {
  Integration,
  IntegrationUpdatePayload,
} from "@modules/integration/types";

export const integrationApi = {
  get: async () => {
    const res = await apiClient.get<{ success: boolean; data: Integration }>(
      "/integration",
    );
    return res.data.data;
  },
  update: async (payload: IntegrationUpdatePayload) => {
    const res = await apiClient.patch<{ success: boolean; data: Integration }>(
      "/integration",
      payload,
    );
    return res.data.data;
  },
  regenerateKey: async () => {
    const res = await apiClient.post<{ success: boolean; data: Integration }>(
      "/integration/regenerate-key",
    );
    return res.data.data;
  },
};
