import { apiClient } from "@api/apiClient";

export interface DashboardSummary {
  today: {
    date: string;
    totalStudents: number;
    pendingApproval: number;
    pickedUp: number;
    dropped: number;
    noShow: number;
    activeVehicles: number;
    activeTrips: number;
  };
  finance: {
    totalCollected: number;
    pending: number;
  };
  operations: {
    drivers: number;
    routes: number;
    vehicles: number;
  };
}

export const dashboardApi = {
  summary: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: DashboardSummary;
    }>("/dashboard/summary");
    return res.data.data;
  },
};
