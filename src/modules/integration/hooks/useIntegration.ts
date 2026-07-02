import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { integrationApi } from "@modules/integration/api/integrationApi";
import { IntegrationUpdatePayload } from "@modules/integration/types";

export const useIntegration = () =>
  useQuery({
    queryKey: ["integration"],
    queryFn: () => integrationApi.get(),
  });

export const useUpdateIntegration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: IntegrationUpdatePayload) =>
      integrationApi.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integration"] }),
  });
};

export const useRegenerateKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => integrationApi.regenerateKey(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integration"] }),
  });
};
