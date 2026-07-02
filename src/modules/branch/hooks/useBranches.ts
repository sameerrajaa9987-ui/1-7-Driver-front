import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { branchApi } from "@modules/branch/api/branchApi";
import { BranchPayload } from "@modules/branch/types";

export const useBranches = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) =>
  useQuery({
    queryKey: ["branches", params],
    queryFn: () => branchApi.list(params),
  });

export const useBranch = (id: string) =>
  useQuery({
    queryKey: ["branch", id],
    queryFn: () => branchApi.get(id),
    enabled: !!id,
  });

export const useCreateBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BranchPayload) => branchApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};

export const useUpdateBranch = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<BranchPayload> & { isActive?: boolean }) =>
      branchApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      qc.invalidateQueries({ queryKey: ["branch", id] });
    },
  });
};

export const useDeleteBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branches"] }),
  });
};
