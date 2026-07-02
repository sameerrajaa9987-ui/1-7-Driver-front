import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { maintenanceApi } from "@modules/maintenance/api/maintenanceApi";
import { MaintenancePayload } from "@modules/maintenance/types";

export const useMaintenance = (params?: {
  page?: number;
  limit?: number;
  vehicleId?: string;
  kind?: string;
}) =>
  useQuery({
    queryKey: ["maintenance", params],
    queryFn: () => maintenanceApi.list(params),
  });

export const useMaintenanceSummary = (vehicleId?: string) =>
  useQuery({
    queryKey: ["maintenance-summary", vehicleId ?? null],
    queryFn: () => maintenanceApi.summary(vehicleId),
  });

export const useFleetAnalytics = () =>
  useQuery({
    queryKey: ["fleet-analytics"],
    queryFn: () => maintenanceApi.analytics(),
  });

export const useAddMaintenance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MaintenancePayload) => maintenanceApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      qc.invalidateQueries({ queryKey: ["maintenance-summary"] });
    },
  });
};

export const useDeleteMaintenance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => maintenanceApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      qc.invalidateQueries({ queryKey: ["maintenance-summary"] });
    },
  });
};
