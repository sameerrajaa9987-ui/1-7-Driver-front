import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@modules/attendance/api/attendanceApi";
import { ScanPayload } from "@modules/attendance/types";

export const useAttendanceSummary = (studentId: string) =>
  useQuery({
    queryKey: ["attendance-summary", studentId],
    queryFn: () => attendanceApi.studentSummary(studentId),
    enabled: !!studentId,
  });

export const useAttendanceList = (params?: {
  studentId?: string;
  limit?: number;
}) =>
  useQuery({
    queryKey: ["attendance-list", params],
    queryFn: () => attendanceApi.list(params),
  });

export const useScanAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ScanPayload) => attendanceApi.scan(payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["trip", vars.tripId] });
    },
  });
};
