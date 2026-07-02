import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { complaintApi } from "@modules/complaint/api/complaintApi";
import {
  ComplaintListParams,
  RaiseComplaintPayload,
  UpdateComplaintStatusPayload,
} from "@modules/complaint/types";

export const useComplaints = (params?: ComplaintListParams) =>
  useQuery({
    queryKey: ["complaints", params],
    queryFn: () => complaintApi.list(params),
  });

export const useComplaint = (id: string) =>
  useQuery({
    queryKey: ["complaint", id],
    queryFn: () => complaintApi.get(id),
    enabled: !!id,
  });

export const useRaiseComplaint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RaiseComplaintPayload) => complaintApi.raise(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
};

export const useUpdateComplaintStatus = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateComplaintStatusPayload) =>
      complaintApi.updateStatus(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["complaints"] });
      qc.invalidateQueries({ queryKey: ["complaint", id] });
    },
  });
};
