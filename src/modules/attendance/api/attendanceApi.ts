import { apiClient } from "@api/apiClient";
import { ScanPayload, ScanResult } from "@modules/attendance/types";

export interface AttendanceSummary {
  pickups: number;
  drops: number;
  absences: number;
  tripsTotal: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string | null;
  tripId: string | null;
  type: "pickup" | "drop";
  method: string;
  verified: boolean;
  at: string;
  createdAt: string;
}

export interface StudentQr {
  studentId: string;
  name: string;
  token: string;
}

export const attendanceApi = {
  scan: async (payload: ScanPayload) => {
    const res = await apiClient.post<{ success: boolean; data: ScanResult }>(
      "/attendance/scan",
      payload,
    );
    return res.data.data;
  },
  /** Verified attendance history (QR scans), newest first. */
  list: async (params?: {
    studentId?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get<{
      success: boolean;
      data: AttendanceRecord[];
      meta?: { total: number };
    }>("/attendance", { params });
    return res.data;
  },
  /** Spec §14 rollup — pickups / drops / absences for one student. */
  studentSummary: async (studentId: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: AttendanceSummary;
    }>(`/attendance/summary/${studentId}`);
    return res.data.data;
  },
  /** Signed QR payload for a student's bus pass. */
  qrToken: async (studentId: string) => {
    const res = await apiClient.get<{ success: boolean; data: StudentQr }>(
      `/attendance/qr/${studentId}`,
    );
    return res.data.data;
  },
};
