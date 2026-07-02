import { apiClient } from "@api/apiClient";
import {
  Complaint,
  RaiseComplaintPayload,
  UpdateComplaintStatusPayload,
  ComplaintListParams,
  Paginated,
} from "@modules/complaint/types";

export const complaintApi = {
  list: async (params?: ComplaintListParams) => {
    const res = await apiClient.get<Paginated<Complaint>>("/complaints", {
      params,
    });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Complaint }>(
      `/complaints/${id}`,
    );
    return res.data.data;
  },
  raise: async (payload: RaiseComplaintPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Complaint }>(
      "/complaints",
      payload,
    );
    return res.data.data;
  },
  updateStatus: async (id: string, payload: UpdateComplaintStatusPayload) => {
    const res = await apiClient.patch<{ success: boolean; data: Complaint }>(
      `/complaints/${id}/status`,
      payload,
    );
    return res.data.data;
  },
};
