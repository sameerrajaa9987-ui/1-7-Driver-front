import { useQuery } from "@tanstack/react-query";
import { activityLogApi } from "@modules/activity-log/api/activityLogApi";
import { ActivityLogListParams } from "@modules/activity-log/types";

export const useActivityLogs = (params?: ActivityLogListParams) =>
  useQuery({
    queryKey: ["activity-logs", params],
    queryFn: () => activityLogApi.list(params),
  });
