import { apiClient } from "@api/apiClient";
import { ScanPayload, ScanResult } from "@modules/attendance/types";

export const attendanceApi = {
  scan: async (payload: ScanPayload) => {
    const res = await apiClient.post<{ success: boolean; data: ScanResult }>(
      "/attendance/scan",
      payload,
    );
    return res.data.data;
  },
};
