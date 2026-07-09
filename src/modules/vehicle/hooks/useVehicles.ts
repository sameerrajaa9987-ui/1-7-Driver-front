import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vehicleApi } from "@modules/vehicle/api/vehicleApi";
import { VehiclePayload } from "@modules/vehicle/types";

export const useVehicles = (params?: { search?: string; enabled?: boolean }) =>
  useQuery({
    queryKey: ["vehicles", params?.search ?? null],
    queryFn: () => vehicleApi.list({ search: params?.search }),
    // Admin-only endpoint — callers gate it so non-admins don't 403.
    enabled: params?.enabled ?? true,
  });

export const useVehicle = (id: string) =>
  useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => vehicleApi.get(id),
    enabled: !!id,
  });

export const useCreateVehicle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VehiclePayload) => vehicleApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
};

export const useUpdateVehicle = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<VehiclePayload> & { isActive?: boolean }) =>
      vehicleApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      qc.invalidateQueries({ queryKey: ["vehicle", id] });
    },
  });
};

export const useRemoveVehicle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehicleApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
};
