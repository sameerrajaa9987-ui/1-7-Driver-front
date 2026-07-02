import { apiClient } from "@api/apiClient";
import {
  ActivityLog,
  ActivityLogListParams,
  Paginated,
} from "@modules/activity-log/types";

export const activityLogApi = {
  list: async (params?: ActivityLogListParams) => {
    const res = await apiClient.get<Paginated<ActivityLog>>("/activity-logs", {
      params,
    });
    return res.data;
  },
};
