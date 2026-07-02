import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { routeApi } from "@modules/route/api/routeApi";
import { RoutePayload } from "@modules/route/types";

export const useRoutes = (params?: { search?: string }) =>
  useQuery({
    queryKey: ["routes", params],
    queryFn: () => routeApi.list(params),
  });

export const useRoute = (id: string) =>
  useQuery({
    queryKey: ["route", id],
    queryFn: () => routeApi.get(id),
    enabled: !!id,
  });

export const useCreateRoute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoutePayload) => routeApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routes"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useUpdateRoute = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<RoutePayload> & { isActive?: boolean }) =>
      routeApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routes"] });
      qc.invalidateQueries({ queryKey: ["route", id] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useSetRouteStudents = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentIds: string[]) => routeApi.setStudents(id, studentIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routes"] });
      qc.invalidateQueries({ queryKey: ["route", id] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useSubstituteDriver = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { driverId: string; until?: string }) =>
      routeApi.substituteDriver(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routes"] });
      qc.invalidateQueries({ queryKey: ["route", id] });
      qc.invalidateQueries({ queryKey: ["trips"] });
    },
  });
};

export const useOptimizeRoute = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (start?: { lat: number; lng: number }) =>
      routeApi.optimize(id, start),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["route", id] });
      qc.invalidateQueries({ queryKey: ["routes"] });
    },
  });
};

export const useRemoveRoute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routeApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] }),
  });
};
