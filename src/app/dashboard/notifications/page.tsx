
"use client";

import Link from "next/link";
import {
    Bell,
    CheckCheck,
    Loader2,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
    useNotificationActions,
    useNotifications,
} from "@/hooks/use-notifications";

export default function NotificationsPage() {
    const {
        data: notifications = [],
        isLoading,
        isError,
        refetch,
    } = useNotifications();

    const {
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isMarkingRead,
        isMarkingAllRead,
        isDeleting,
    } = useNotificationActions();

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    const handleMarkRead = async (id: string) => {
        try {
            await markAsRead(id);
            toast.success("Notification marked as read.");
        } catch {
            toast.error("Failed to mark notification as read.");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            toast.success("All notifications marked as read.");
        } catch {
            toast.error("Failed to mark all notifications as read.");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification(id);
            toast.success("Notification deleted.");
        } catch {
            toast.error("Failed to delete notification.");
        }
    };

    return (
        <main className="space-y-6 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href="/dashboard"
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Back to Dashboard
                    </Link>

                    <div className="mt-3 flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-3 text-primary">
                            <Bell className="h-6 w-6" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                Notifications
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {unreadCount} unread of {notifications.length}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0 || isMarkingAllRead}
                    className="inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isMarkingAllRead ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCheck className="h-4 w-4" />
                    )}
                    Mark all as read
                </button>
            </div>

            {isLoading ? (
                <div className="flex min-h-40 items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading notifications...
                </div>
            ) : isError ? (
                <div className="rounded-xl border p-8 text-center">
                    <p className="font-medium">
                        Unable to load notifications.
                    </p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-3 rounded-md border px-4 py-2 text-sm hover:bg-muted"
                    >
                        Try again
                    </button>
                </div>
            ) : notifications.length === 0 ? (
                <div className="rounded-xl border bg-card p-12 text-center">
                    <Bell className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h2 className="mt-4 font-semibold">
                        You&apos;re all caught up
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        New notifications will appear here.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border bg-card">
                    <div className="divide-y">
                        {notifications.map((notification) => (
                            <article
                                key={notification.id}
                                className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between ${notification.isRead
                                        ? ""
                                        : "bg-primary/[0.04]"
                                    }`}
                            >
                                <div className="flex min-w-0 gap-3">
                                    <span
                                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.isRead
                                                ? "bg-muted"
                                                : "bg-primary"
                                            }`}
                                    />

                                    <div className="min-w-0">
                                        <h2 className="font-semibold">
                                            {notification.title}
                                        </h2>

                                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                                            {notification.message}
                                        </p>

                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {new Date(
                                                notification.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 gap-2 sm:justify-end">
                                    {!notification.isRead && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMarkRead(notification.id)
                                            }
                                            disabled={isMarkingRead}
                                            className="rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
                                        >
                                            Mark read
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(notification.id)
                                        }
                                        disabled={isDeleting}
                                        aria-label={`Delete ${notification.title}`}
                                        className="inline-flex items-center justify-center rounded-md border p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
