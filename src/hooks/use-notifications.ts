
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { Notification } from "@/types/notification";
import {
  deleteNotification,
  getNotificationById,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/notifications";

export const notificationKeys = {
  all: ["notifications"] as const,
  detail: (id: string) => ["notification", id] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: getNotifications,
  });
}

export function useNotification(notificationId: string) {
  return useQuery({
    queryKey: notificationKeys.detail(notificationId),
    queryFn: () => getNotificationById(notificationId),
    enabled: Boolean(notificationId),
  });
}

export function useNotificationActions() {
  const queryClient = useQueryClient();

  const refreshNotifications = async () => {
    await queryClient.invalidateQueries({
      queryKey: notificationKeys.all,
    });
  };

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: refreshNotifications,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: refreshNotifications,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: refreshNotifications,
  });

  return {
    markAsRead: markReadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
