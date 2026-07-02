import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  notificationApi,
  NotificationListParams,
} from "@modules/notification/api/notificationApi";

export const useNotifications = (params?: NotificationListParams) =>
  useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationApi.list(params),
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => notificationApi.unreadCount(),
  });

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
};

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
};
