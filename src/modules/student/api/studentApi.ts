import { apiClient } from "@api/apiClient";
import {
  Student,
  StudentPayload,
  ApprovePayload,
  StudentListParams,
  Paginated,
} from "@modules/student/types";

export const studentApi = {
  list: async (params?: StudentListParams) => {
    const res = await apiClient.get<Paginated<Student>>("/students", {
      params,
    });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Student }>(
      `/students/${id}`,
    );
    return res.data.data;
  },
  create: async (payload: StudentPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Student }>(
      "/students",
      payload,
    );
    return res.data.data;
  },
  update: async (id: string, payload: Partial<StudentPayload>) => {
    const res = await apiClient.patch<{ success: boolean; data: Student }>(
      `/students/${id}`,
      payload,
    );
    return res.data.data;
  },
  qrToken: async (id: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: { token: string };
    }>(`/attendance/qr/${id}`);
    return res.data.data;
  },
  approve: async (id: string, payload: ApprovePayload) => {
    const res = await apiClient.post<{ success: boolean; data: Student }>(
      `/students/${id}/approve`,
      payload,
    );
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/students/${id}`);
    return res.data;
  },
};
