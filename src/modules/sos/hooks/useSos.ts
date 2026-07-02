import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sosApi } from "@modules/sos/api/sosApi";
import { SosListParams, TriggerSosPayload } from "@modules/sos/types";

// Admin-only: GET /sos. Do NOT call as a driver (admin-only endpoint).
export const useSosAlerts = (params?: SosListParams) =>
  useQuery({
    queryKey: ["sos", params],
    queryFn: () => sosApi.list(params),
  });

export const useTriggerSos = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TriggerSosPayload) => sosApi.trigger(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sos"] });
    },
  });
};

export const useResolveSos = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sosApi.resolve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sos"] });
    },
  });
};
