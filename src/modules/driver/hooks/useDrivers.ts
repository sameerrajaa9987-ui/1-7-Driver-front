import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { driverApi } from "@modules/driver/api/driverApi";
import { DriverPayload } from "@modules/driver/types";

export const useDrivers = (params?: { search?: string }) =>
  useQuery({
    queryKey: ["drivers", params],
    queryFn: () => driverApi.list(params),
  });

export const useDriver = (id: string) =>
  useQuery({
    queryKey: ["driver", id],
    queryFn: () => driverApi.get(id),
    enabled: !!id,
  });

export const useCreateDriver = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DriverPayload) => driverApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
};

export const useUpdateDriver = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<DriverPayload> & { isActive?: boolean }) =>
      driverApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drivers"] });
      qc.invalidateQueries({ queryKey: ["driver", id] });
    },
  });
};

export const useRemoveDriver = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => driverApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  });
};
