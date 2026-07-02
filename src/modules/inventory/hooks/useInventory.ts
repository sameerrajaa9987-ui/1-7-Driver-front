import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  inventoryApi,
  InventoryPayload,
  InventoryStatus,
} from "@modules/inventory/api/inventoryApi";

export const useInventory = (params?: {
  vehicleId?: string;
  status?: InventoryStatus;
}) =>
  useQuery({
    queryKey: ["inventory", params],
    queryFn: () => inventoryApi.list(params),
  });

export const useInventoryCounts = () =>
  useQuery({
    queryKey: ["inventory-counts"],
    queryFn: () => inventoryApi.statusCounts(),
  });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["inventory"] });
    qc.invalidateQueries({ queryKey: ["inventory-counts"] });
  };
};

export const useAddInventory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: InventoryPayload) => inventoryApi.create(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateInventory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Partial<InventoryPayload>) =>
      inventoryApi.update(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteInventory = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.remove(id),
    onSuccess: invalidate,
  });
};
