import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "@modules/student/api/studentApi";
import {
  StudentPayload,
  ApprovePayload,
  StudentListParams,
} from "@modules/student/types";

export const useStudents = (params?: StudentListParams) =>
  useQuery({
    queryKey: ["students", params],
    queryFn: () => studentApi.list(params),
  });

export const useStudent = (id: string) =>
  useQuery({
    queryKey: ["student", id],
    queryFn: () => studentApi.get(id),
    enabled: !!id,
  });

export const useStudentQr = (id: string) =>
  useQuery({
    queryKey: ["student-qr", id],
    queryFn: () => studentApi.qrToken(id),
    enabled: !!id,
  });

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StudentPayload) => studentApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useUpdateStudent = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<StudentPayload>) =>
      studentApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["student", id] });
    },
  });
};

export const useApproveStudent = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApprovePayload) => studentApi.approve(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["student", id] });
    },
  });
};

export const useRemoveStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
};
