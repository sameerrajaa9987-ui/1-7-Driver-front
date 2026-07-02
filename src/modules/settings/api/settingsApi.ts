import { apiClient } from "@api/apiClient";
import { Settings, SettingsPayload } from "@modules/settings/types";

export const settingsApi = {
  get: async () => {
    const res = await apiClient.get<{ success: boolean; data: Settings }>(
      "/settings",
    );
    return res.data.data;
  },
  update: async (payload: SettingsPayload) => {
    const res = await apiClient.patch<{ success: boolean; data: Settings }>(
      "/settings",
      payload,
    );
    return res.data.data;
  },
};
