import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@modules/settings/api/settingsApi";
import { SettingsPayload } from "@modules/settings/types";

export const useSettings = () =>
  useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
  });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SettingsPayload) => settingsApi.update(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};
