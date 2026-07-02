import { apiClient } from "@api/apiClient";
import { ScanPayload, ScanResult } from "@modules/attendance/types";

export interface AttendanceSummary {
  pickups: number;
  drops: number;
  absences: number;
  tripsTotal: number;
}

export const attendanceApi = {
  scan: async (payload: ScanPayload) => {
    const res = await apiClient.post<{ success: boolean; data: ScanResult }>(
      "/attendance/scan",
      payload,
    );
    return res.data.data;
  },
  /** Spec §14 rollup — pickups / drops / absences for one student. */
  studentSummary: async (studentId: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: AttendanceSummary;
    }>(`/attendance/summary/${studentId}`);
    return res.data.data;
  },
};
