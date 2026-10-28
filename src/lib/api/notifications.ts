

import type { Notification } from "@/types/notification";
import api from "../axios";

export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get<Notification[]>("/api/notifications");
  return response.data;
}

export async function getNotificationById(
  notificationId: string
): Promise<Notification> {
  const response = await api.get<Notification>(
    `/api/notifications/${notificationId}`
  );
  return response.data;
}

export async function deleteNotification(
  notificationId: string
): Promise<void> {
  await api.delete(`/api/notifications/${notificationId}`);
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  await api.patch(`/api/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.patch("/api/notifications/read-all");
}
