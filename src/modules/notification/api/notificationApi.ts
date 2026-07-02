import { apiClient } from "@api/apiClient";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  studentId: string | null;
  tripId: string | null;
  data: Record<string, unknown>;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

export const notificationApi = {
  list: async (params?: NotificationListParams) => {
    const res = await apiClient.get<Paginated<Notification>>("/notifications", {
      params,
    });
    return res.data;
  },
  unreadCount: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: { count: number };
    }>("/notifications/unread-count");
    return res.data.data.count;
  },
  markAllRead: async () => {
    const res = await apiClient.post("/notifications/read-all");
    return res.data.data;
  },
  markRead: async (id: string) => {
    const res = await apiClient.post(`/notifications/${id}/read`);
    return res.data.data;
  },
};
