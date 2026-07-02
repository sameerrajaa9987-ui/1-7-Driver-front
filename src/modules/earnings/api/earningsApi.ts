import { apiClient } from "@api/apiClient";
import { EarningItem, EarningsResponse } from "@modules/earnings/types";

export const earningsApi = {
  list: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: EarningsResponse;
    }>("/earnings");
    return res.data.data;
  },
  me: async () => {
    const res = await apiClient.get<{ success: boolean; data: EarningItem }>(
      "/earnings/me",
    );
    return res.data.data;
  },
};
