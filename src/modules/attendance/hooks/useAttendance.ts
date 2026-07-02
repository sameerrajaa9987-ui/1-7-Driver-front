import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@modules/attendance/api/attendanceApi";
import { ScanPayload } from "@modules/attendance/types";

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
