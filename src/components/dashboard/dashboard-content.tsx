"use client";

import {
    Activity,
    AlertCircle,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleDashed,
    Clock3,
    FolderKanban,
    ListTodo,
    RefreshCw,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { useDashboard } from "@/hooks/use-dashboard";
import RecentActivity from "@/components/dashboard/recent-activity";
import type { TaskResponse } from "@/types/task";

function formatDate(value?: string | null): string {
    if (!value) return "No deadline";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "No deadline";

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getStatusLabel(status: number): string {
    switch (status) {
        case 0:
            return "Backlog";
        case 1:
            return "To do";
        case 2:
            return "In progress";
        case 3:
            return "Code review";
        case 4:
            return "Testing";
        case 5:
            return "Completed";
        default:
            return "Unknown";
    }
}

function getStatusBadgeClasses(status: number): string {
    switch (status) {
        case 2:
            return "border-blue-500/20 bg-blue-500/10 text-blue-400";
        case 3:
            return "border-violet-500/20 bg-violet-500/10 text-violet-400";
        case 4:
            return "border-cyan-500/20 bg-cyan-500/10 text-cyan-400";
        case 5:
            return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
        case 0:
        case 1:
        default:
            return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    }
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    iconContainerClass,
    href,
}: {
    title: string;
    value: number | string;
    description: string;
    icon: typeof FolderKanban;
    iconContainerClass: string;
    href?: string;
}) {
    return (
        <Link
            href={href || "/dashboard/projects"}
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900/80"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-400">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                        {value}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <div className={`rounded-xl border p-3 ${iconContainerClass}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors group-hover:text-white">
                View details
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

function TaskStatusRow({ task }: { task: TaskResponse }) {
    return (
        <div className="flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-900/70">
            <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 truncate font-medium text-white">
                    {task.title}
                </p>

                <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(task.status)}`}
                >
                    {getStatusLabel(task.status)}
                </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span className="truncate">
                    Assigned:{" "}
                    <span className="font-medium text-slate-300">
                        {task.assignedToNames?.length
                            ? task.assignedToNames.join(", ")
                            : "Unassigned"}
                    </span>
                </span>

                <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                    {formatDate(task.dueDate)}
                </span>
            </div>
        </div>
    );
}

function EmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 px-5 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400">
                <ListTodo className="h-6 w-6" />
            </div>

            <h3 className="font-semibold text-white">{title}</h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                {description}
            </p>
        </div>
    );
}

function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-slate-800" />
                <div className="h-9 w-64 animate-pulse rounded-xl bg-slate-800" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-36 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60"
                    />
                ))}
            </div>

            <div className="h-40 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="h-80 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
                <div className="h-80 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
            </div>
        </div>
    );
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400">
                <AlertCircle className="h-6 w-6" />
            </div>

            <h2 className="text-lg font-semibold text-white">
                Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
                Something went wrong while loading your projects and tasks.
            </p>

            <button
                type="button"
                onClick={onRetry}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:border-slate-600 hover:bg-slate-800"
            >
                <RefreshCw className="h-4 w-4" />
                Try again
            </button>
        </div>
    );
}

export function DashboardContent({
    tenantId,
}: {
    tenantId: string | null;
}) {
    const {
        projects,
        tasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        completionRate,
        dueThisWeek,
        isLoading,
        isError,
        refetch,
    } = useDashboard(tenantId);

    if (!tenantId) {
        return (
            <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
                <div className="mx-auto max-w-7xl rounded-2xl border border-amber-500/20 bg-slate-900/80 p-8 text-center shadow-xl backdrop-blur-xl">
                    <h1 className="text-lg font-semibold text-white">
                        No workspace selected
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Select a tenant or workspace to view its dashboard.
                    </p>
                </div>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <DashboardLoading />
                </div>
            </main>
        );
    }

    if (isError) {
        return (
            <main className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <DashboardError onRetry={() => void refetch()} />
                </div>
            </main>
        );
    }

    const totalTasks = tasks.length;

    const statusRows = [
        {
            label: "Backlog",
            count: tasks.filter((task) => task.status === 0).length,
            color: "bg-slate-500",
            icon: CircleDashed,
            textColor: "text-slate-400",
        },
        {
            label: "To do",
            count: todoTasks.length,
            color: "bg-amber-400",
            icon: CircleDashed,
            textColor: "text-amber-400",
        },
        {
            label: "In progress",
            count: inProgressTasks.length,
            color: "bg-blue-500",
            icon: Clock3,
            textColor: "text-blue-400",
        },
        {
            label: "Code review",
            count: tasks.filter((task) => task.status === 3).length,
            color: "bg-violet-500",
            icon: Activity,
            textColor: "text-violet-400",
        },
        {
            label: "Testing",
            count: tasks.filter((task) => task.status === 4).length,
            color: "bg-cyan-400",
            icon: CheckCircle2,
            textColor: "text-cyan-400",
        },
        {
            label: "Completed",
            count: completedTasks.length,
            color: "bg-emerald-400",
            icon: CheckCircle2,
            textColor: "text-emerald-400",
        },
    ];

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                                <Activity className="h-5 w-5 text-blue-400" />
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                                    Workspace Overview
                                </p>
                                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    Dashboard
                                </h1>
                            </div>
                        </div>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                            Track your projects, tasks, progress, and recent activity.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/dashboard/projects"
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                        >
                            <FolderKanban className="h-4 w-4 text-blue-400" />
                            View projects
                        </Link>
                    </div>
                </header>

                {/* Stat Cards */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Projects"
                        value={projects.length}
                        description="Projects in this workspace"
                        icon={FolderKanban}
                        iconContainerClass="border-violet-500/20 bg-violet-500/10 text-violet-400"
                        href="/dashboard/projects"
                    />

                    <StatCard
                        title="Total Tasks"
                        value={totalTasks}
                        description="Tasks across your projects"
                        icon={ListTodo}
                        iconContainerClass="border-blue-500/20 bg-blue-500/10 text-blue-400"
                        href="/dashboard/projects"
                    />

                    <StatCard
                        title="In Progress"
                        value={inProgressTasks.length}
                        description="Tasks currently being worked on"
                        icon={Clock3}
                        iconContainerClass="border-amber-500/20 bg-amber-500/10 text-amber-400"
                        href="/dashboard/projects"
                    />

                    <StatCard
                        title="Completed Tasks"
                        value={completedTasks.length}
                        description="Tasks marked as completed"
                        icon={CheckCircle2}
                        iconContainerClass="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        href="/dashboard/projects"
                    />
                </section>

                {/* Task Completion Banner */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Task completion
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Overall progress across your tasks
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-emerald-400">
                            <TrendingUp className="h-4 w-4" />

                            <span className="text-xl font-bold">
                                {completionRate}%
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 h-3.5 overflow-hidden rounded-full bg-slate-950 p-0.5 ring-1 ring-slate-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                            style={{
                                width: `${Math.min(100, Math.max(0, completionRate))}%`,
                            }}
                        />
                    </div>

                    <div className="mt-3 flex justify-between text-xs text-slate-400">
                        <span>
                            <strong className="text-emerald-400 font-semibold">{completedTasks.length}</strong> completed
                        </span>
                        <span>
                            <strong className="text-white font-semibold">{totalTasks}</strong> total tasks
                        </span>
                    </div>
                </section>

                {/* Due This Week & Task Status Breakdown */}
                <section className="grid gap-6 xl:grid-cols-2">
                    {/* Due This Week */}
                    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                                    <Clock3 className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-white sm:text-lg">
                                        Tasks due this week
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        Upcoming deadlines for unfinished tasks
                                    </p>
                                </div>
                            </div>

                            <span className="rounded-full border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-slate-300">
                                {dueThisWeek.length} Upcoming
                            </span>
                        </div>

                        {dueThisWeek.length === 0 ? (
                            <div className="my-auto">
                                <EmptyState
                                    title="Nothing due this week"
                                    description="You have no upcoming task deadlines for this week."
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dueThisWeek.slice(0, 6).map((task) => (
                                    <TaskStatusRow key={task.id} task={task} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Task Status */}
                    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                                    <ListTodo className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-white sm:text-lg">
                                        Task status
                                    </h2>
                                    <p className="text-xs text-slate-400">
                                        Breakdown of your current workload
                                    </p>
                                </div>
                            </div>

                            <span className="rounded-full border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-slate-300">
                                {totalTasks} Tasks
                            </span>
                        </div>

                        <div className="my-auto space-y-4">
                            {statusRows.map((row) => {
                                const Icon = row.icon;
                                const percentage =
                                    totalTasks > 0
                                        ? Math.round((row.count / totalTasks) * 100)
                                        : 0;

                                return (
                                    <div key={row.label} className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="flex items-center gap-2 font-medium text-slate-300">
                                                <Icon
                                                    className={`h-3.5 w-3.5 ${row.textColor}`}
                                                />
                                                {row.label}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-white">
                                                    {row.count}
                                                </span>
                                                <span className="w-9 text-right text-slate-500">
                                                    {percentage}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-slate-950 ring-1 ring-slate-800/80">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${row.color}`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Recent Activity */}
                <section>
                    <RecentActivity tenantId={tenantId} />
                </section>
            </div>
        </main>
    );
}
