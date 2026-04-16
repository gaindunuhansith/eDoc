import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { NOTIFICATION_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

export type NotificationType =
  | "APPOINTMENT_REMINDER"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_CANCELLED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "TELEMEDICINE_STARTING"
  | "GENERAL";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface UnreadCountResponse {
  count: number;
}

export const fetchAllNotifications = () =>
  apiClient.get<Notification[]>(NOTIFICATION_ENDPOINTS.GET_ALL);

export const fetchNotificationById = (id: string) =>
  apiClient.get<Notification>(NOTIFICATION_ENDPOINTS.GET_BY_ID(id));

export const markNotificationRead = (id: string) =>
  apiClient.patch(NOTIFICATION_ENDPOINTS.MARK_READ(id));

export const markAllNotificationsRead = () =>
  apiClient.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);

export const deleteNotification = (id: string) =>
  apiClient.delete(NOTIFICATION_ENDPOINTS.DELETE(id));

export const fetchUnreadCount = () =>
  apiClient.get<UnreadCountResponse>(NOTIFICATION_ENDPOINTS.UNREAD_COUNT);

export const useGetAllNotifications = () =>
  useQuery({
    queryKey: queryKeys.notification.lists(),
    queryFn: () => fetchAllNotifications().then((r) => r.data),
  });

export const useGetNotificationById = (id: string) =>
  useQuery({
    queryKey: queryKeys.notification.detail(id),
    queryFn: () => fetchNotificationById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useGetUnreadCount = () =>
  useQuery({
    queryKey: queryKeys.notification.unreadCount(),
    queryFn: () => fetchUnreadCount().then((r) => r.data),
    // Poll every 60 seconds to keep unread count fresh
    refetchInterval: 60_000,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notification.lists() });
      qc.invalidateQueries({ queryKey: queryKeys.notification.unreadCount() });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notification.all });
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notification.lists() });
      qc.invalidateQueries({ queryKey: queryKeys.notification.unreadCount() });
    },
  });
};
