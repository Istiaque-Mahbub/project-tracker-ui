"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Activity,
    Clock3,
    Loader2,
    RefreshCw,
    UserRound,
} from "lucide-react";

import { getProjectActivities } from "@/lib/api/activities";

interface ProjectActivityProps {
    tenantId: string;
    projectId: string;
}

export default function ProjectActivity({
    tenantId,
    projectId,
}: ProjectActivityProps) {
    const {
        data: activities = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["project-activities", tenantId, projectId],
        queryFn: () => getProjectActivities(tenantId, projectId),
        enabled: Boolean(tenantId && projectId),
    });

    function formatDate(date: string) {
        return new Date(date).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    return (
        <section className="overflow-hidden rounded-xl border bg-card">
            <div className="flex items-center justify-between border-b p-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <Activity className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                        <h2 className="font-semibold">Activity Timeline</h2>
                        <p className="text-sm text-muted-foreground">
                            Recent activity in this project
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => void refetch()}
                    disabled={isLoading}
                    aria-label="Refresh activities"
                    className="rounded-md border p-2 hover:bg-muted disabled:opacity-50"
                >
                    <RefreshCw className="h-4 w-4" />
                </button>
            </div>

            <div className="p-5">
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading activities...
                    </div>
                ) : isError ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-destructive">
                            Failed to load project activities.
                        </p>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="mt-3 text-sm font-medium text-primary hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="py-10 text-center">
                        <Activity className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="font-medium">No activity yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Project updates will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="relative space-y-6">
                        {activities.map((item, index) => (
                            <div key={item.id} className="relative flex gap-3">
                                {index !== activities.length - 1 && (
                                    <div className="absolute left-4 top-9 h-[calc(100%+1.5rem)] w-px bg-border" />
                                )}

                                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
                                    <UserRound className="h-4 w-4 text-muted-foreground" />
                                </div>

                                <div className="min-w-0 flex-1 pb-1">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span className="font-medium">
                                            {item.userName || "Unknown user"}
                                        </span>

                                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                                            {item.action}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {item.description}
                                    </p>

                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock3 className="h-3.5 w-3.5" />
                                        <time dateTime={item.createdAt}>
                                            {formatDate(item.createdAt)}
                                        </time>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}