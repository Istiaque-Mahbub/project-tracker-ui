"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Activity,
    AlertCircle,
    Clock3,
    RefreshCw,
} from "lucide-react";

import { getTenantActivities } from "@/lib/api/activities";

interface RecentActivityProps {
    tenantId: string;
}

export default function RecentActivity({
    tenantId,
}: RecentActivityProps) {
    const {
        data: activities = [],
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["tenant-activities", tenantId],
        queryFn: () => getTenantActivities(tenantId),
        enabled: Boolean(tenantId),
        staleTime: 30_000,
    });

    function formatDateTime(value: string) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Unknown date";
        }

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(date);
    }

    const latestActivities = [...activities]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
        .slice(0, 8);

    return (
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
            {/* HEADER */}
            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                        <Activity className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-base font-bold text-white sm:text-lg">
                            Recent Activity
                        </h2>
                        <p className="text-xs text-slate-400">
                            Latest actions across this workspace
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="hidden rounded-full border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-slate-300 sm:inline-flex">
                        {activities.length} Events
                    </span>

                    <button
                        type="button"
                        onClick={() => void refetch()}
                        disabled={isFetching}
                        aria-label="Refresh activity"
                        title="Refresh activity"
                        className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* LOADING */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex animate-pulse gap-4 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4"
                        >
                            <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-800" />

                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 rounded bg-slate-800" />
                                <div className="h-3 w-2/3 rounded bg-slate-800" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : isError ? (
                /* ERROR */
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6 text-center">
                    <AlertCircle className="mx-auto mb-2 h-7 w-7 text-rose-400" />

                    <p className="font-semibold text-white">
                        Unable to load activity
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Check your connection and try again.
                    </p>

                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                        Try again
                    </button>
                </div>
            ) : latestActivities.length === 0 ? (
                /* EMPTY */
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 px-6 py-10 text-center">
                    <Activity className="mx-auto mb-3 h-8 w-8 text-slate-500" />

                    <p className="font-semibold text-white">
                        No activity yet
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Changes to projects and tasks will appear here when
                        recorded by the backend.
                    </p>
                </div>
            ) : (
                /* ACTIVITY LIST */
                <div className="space-y-3">
                    {latestActivities.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start gap-4 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/70"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-blue-500/20">
                                {(item.userName || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-white">
                                        {item.userName || "Unknown user"}
                                    </span>

                                    <span className="rounded-md border border-slate-700/60 bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                                        {item.action || "Activity"}
                                    </span>
                                </div>

                                <p className="mt-1 break-words text-sm text-slate-300">
                                    {item.description ||
                                        "An activity was recorded."}
                                </p>

                                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                                    <Clock3 className="h-3.5 w-3.5" />

                                    <time dateTime={item.createdAt}>
                                        {formatDateTime(item.createdAt)}
                                    </time>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}