"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getAuth } from "@/lib/auth";
import { useDashboard } from "@/hooks/use-dashboard";

import {
    Activity,
    AlertCircle,
    ArrowUpRight,
    Calendar,
    CheckSquare,
    ChevronRight,
    CircleCheck,
    Clock3,
    FolderKanban,
    Sparkles,
    User,
} from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();

    const [tenantId, setTenantId] = useState<string | null>(null);

    /*
     * ----------------------------------------
     * AUTHENTICATION
     * ----------------------------------------
     */

    useEffect(() => {
        const auth = getAuth();

        if (!auth) {
            router.replace("/login");
            return;
        }

        if (!auth.tenants || auth.tenants.length === 0) {
            setTenantId(null);
            return;
        }

        setTenantId(auth.tenants[0].id);
    }, [router]);

    /*
     * ----------------------------------------
     * DASHBOARD DATA
     * ----------------------------------------
     */

    const {
        projects,
        tasks,
        activities,

        completedTasks,
        inProgressTasks,
        todoTasks,

        completionRate,
        dueThisWeek,

        isLoading,
        isError,
    } = useDashboard(tenantId);

    /*
     * ----------------------------------------
     * NO TENANT
     * ----------------------------------------
     */

    if (!tenantId) {
        return <EmptyWorkspace />;
    }

    /*
     * ----------------------------------------
     * LOADING
     * ----------------------------------------
     */

    if (isLoading) {
        return <DashboardLoading />;
    }

    /*
     * ----------------------------------------
     * ERROR
     * ----------------------------------------
     */

    if (isError) {
        return <DashboardError />;
    }

    /*
     * ----------------------------------------
     * DASHBOARD
     * ----------------------------------------
     */

    return (
        <div className="space-y-8 p-6 sm:p-8 lg:p-10">

            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Developer Command Center
                        </p>
                    </div>

                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                        Overview of your workspace projects, tasks, sprints, and recent activity.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/projects"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                    >
                        <FolderKanban className="h-4 w-4 text-blue-400" />
                        <span>View Projects</span>
                    </Link>

                    <Link
                        href="/dashboard/tasks"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
                    >
                        <CheckSquare className="h-4 w-4" />
                        <span>Manage Tasks</span>
                    </Link>
                </div>
            </div>

            {/* STATS TILES */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard
                    title="Active Projects"
                    value={projects.length}
                    icon={<FolderKanban className="h-5 w-5" />}
                    description="Workspace repositories"
                    accentColor="blue"
                />

                <StatCard
                    title="Total Tasks"
                    value={tasks.length}
                    icon={<CheckSquare className="h-5 w-5" />}
                    description="Sprint items"
                    accentColor="violet"
                />

                <StatCard
                    title="Completed"
                    value={completedTasks.length}
                    icon={<CircleCheck className="h-5 w-5" />}
                    description="Resolved tasks"
                    accentColor="emerald"
                />

                <StatCard
                    title="In Progress"
                    value={inProgressTasks.length}
                    icon={<Clock3 className="h-5 w-5" />}
                    description="Currently active"
                    accentColor="amber"
                />

                <StatCard
                    title="Completion Rate"
                    value={`${completionRate}%`}
                    icon={<Activity className="h-5 w-5" />}
                    description="Overall efficiency"
                    accentColor="cyan"
                    progress={completionRate}
                />
            </div>

            {/* MAIN CONTENT: PROJECTS & TASK SUMMARY */}
            <div className="grid gap-6 lg:grid-cols-3">

                {/* ACTIVE PROJECTS */}
                <section className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-xl lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                                <FolderKanban className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white sm:text-lg">
                                    Active Projects
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Tracked projects in this workspace
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="rounded-full border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-slate-300">
                                {projects.length} Total
                            </span>
                            <Link
                                href="/dashboard/projects"
                                className="hidden items-center gap-1 text-xs font-medium text-blue-400 transition hover:text-blue-300 sm:flex"
                            >
                                <span>See all</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>

                    {projects.length === 0 ? (
                        <EmptyState
                            title="No projects yet"
                            description="Create your first project to start organizing your team's development work."
                            href="/dashboard/projects"
                            actionLabel="Create Project"
                        />
                    ) : (
                        <div className="space-y-3">
                            {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href="/dashboard/projects"
                                    className="group flex items-center justify-between gap-4 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-md"
                                >
                                    <div className="flex min-w-0 items-center gap-3.5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm font-bold text-blue-400 group-hover:border-blue-500/30 group-hover:bg-blue-600/10 transition">
                                            {project.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="truncate font-semibold text-white transition group-hover:text-blue-400">
                                                {project.name}
                                            </h3>

                                            {project.description ? (
                                                <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                                                    {project.description}
                                                </p>
                                            ) : (
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    No description provided
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3">
                                        <span className="hidden rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium text-slate-400 sm:inline-block">
                                            Active
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-blue-400" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* TASK SUMMARY */}
                <section className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
                                <CheckSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white sm:text-lg">
                                    Task Overview
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Status distribution
                                </p>
                            </div>
                        </div>

                        <span className="rounded-full border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-slate-300">
                            {tasks.length} Tasks
                        </span>
                    </div>

                    {tasks.length === 0 ? (
                        <EmptyState
                            title="No tasks yet"
                            description="Tasks will appear here once they are created in your projects."
                            href="/dashboard/tasks"
                            actionLabel="Create Task"
                        />
                    ) : (
                        <div className="space-y-6">
                            {/* Segmented multi-color progress bar */}
                            <div>
                                <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                                    <span>Task Distribution</span>
                                    <span className="font-semibold text-slate-300">
                                        {completedTasks.length} / {tasks.length} Done ({completionRate}%)
                                    </span>
                                </div>
                                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-950/80 p-0.5 ring-1 ring-slate-800">
                                    {completedTasks.length > 0 && (
                                        <div
                                            className="h-full rounded-l-full bg-emerald-500 transition-all duration-500"
                                            style={{
                                                width: `${(completedTasks.length / tasks.length) * 100}%`,
                                            }}
                                            title={`Completed: ${completedTasks.length}`}
                                        />
                                    )}
                                    {inProgressTasks.length > 0 && (
                                        <div
                                            className="h-full bg-amber-500 transition-all duration-500"
                                            style={{
                                                width: `${(inProgressTasks.length / tasks.length) * 100}%`,
                                            }}
                                            title={`In Progress: ${inProgressTasks.length}`}
                                        />
                                    )}
                                    {todoTasks.length > 0 && (
                                        <div
                                            className="h-full rounded-r-full bg-slate-600 transition-all duration-500"
                                            style={{
                                                width: `${(todoTasks.length / tasks.length) * 100}%`,
                                            }}
                                            title={`To Do: ${todoTasks.length}`}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <TaskStatusRow
                                    label="Completed"
                                    value={completedTasks.length}
                                    total={tasks.length}
                                    color="emerald"
                                />

                                <TaskStatusRow
                                    label="In Progress"
                                    value={inProgressTasks.length}
                                    total={tasks.length}
                                    color="amber"
                                />

                                <TaskStatusRow
                                    label="To Do"
                                    value={todoTasks.length}
                                    total={tasks.length}
                                    color="slate"
                                />
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* DUE THIS WEEK */}
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                            <Clock3 className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white sm:text-lg">
                                Due This Week
                            </h2>
                            <p className="text-xs text-slate-400">
                                Deadlines approaching in the next 7 days
                            </p>
                        </div>
                    </div>

                    <span className="rounded-full border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-slate-300">
                        {dueThisWeek.length} Upcoming
                    </span>
                </div>

                {dueThisWeek.length === 0 ? (
                    <EmptyState
                        title="Nothing due this week"
                        description="There are no upcoming unfinished tasks with deadlines in the next seven days."
                    />
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {dueThisWeek.map((task) => (
                            <div
                                key={task.id}
                                className="group flex flex-col justify-between rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/80"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(task.dueDate)}
                                        </span>

                                        <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                            {task.priority || "Normal"}
                                        </span>
                                    </div>

                                    <p className="mt-3 font-semibold text-white group-hover:text-amber-300 transition">
                                        {task.title}
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center gap-2 border-t border-slate-800/60 pt-3 text-xs text-slate-400">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                                        <User className="h-3 w-3" />
                                    </div>
                                    <span className="truncate">
                                        {task.assignedToName || "Unassigned"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* RECENT ACTIVITY */}
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white sm:text-lg">
                                Recent Activity
                            </h2>
                            <p className="text-xs text-slate-400">
                                Latest actions and audit log in this workspace
                            </p>
                        </div>
                    </div>

                    <span className="rounded-full border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-slate-300">
                        Live Feed
                    </span>
                </div>

                {activities.length === 0 ? (
                    <EmptyState
                        title="No activity yet"
                        description="Activity events will be logged here when users create or modify projects, tasks, and milestones."
                    />
                ) : (
                    <div className="space-y-3">
                        {activities.slice(0, 8).map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-4 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/70"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-blue-500/20">
                                    {(activity.userName || "U").charAt(0).toUpperCase()}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-semibold text-white">
                                            {activity.userName || "Unknown user"}
                                        </span>

                                        <span className="rounded-md border border-slate-700/60 bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                                            {activity.action}
                                        </span>

                                        <span className="ml-auto text-xs text-slate-500">
                                            {formatDateTime(activity.createdAt)}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm text-slate-300">
                                        {activity.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}

/*
 * ============================================
 * STAT CARD
 * ============================================
 */

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    description: string;
    accentColor: "blue" | "violet" | "emerald" | "amber" | "cyan";
    progress?: number;
}

const colorStyles = {
    blue: {
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        glow: "from-blue-500/10 to-transparent",
        hoverBorder: "hover:border-blue-500/40",
    },
    violet: {
        badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
        glow: "from-violet-500/10 to-transparent",
        hoverBorder: "hover:border-violet-500/40",
    },
    emerald: {
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        glow: "from-emerald-500/10 to-transparent",
        hoverBorder: "hover:border-emerald-500/40",
    },
    amber: {
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        glow: "from-amber-500/10 to-transparent",
        hoverBorder: "hover:border-amber-500/40",
    },
    cyan: {
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        glow: "from-cyan-500/10 to-transparent",
        hoverBorder: "hover:border-cyan-500/40",
    },
};

function StatCard({
    title,
    value,
    icon,
    description,
    accentColor,
    progress,
}: StatCardProps) {
    const style = colorStyles[accentColor];

    return (
        <div
            className={`
                group relative overflow-hidden rounded-2xl border border-slate-800/80
                bg-slate-900/60 p-5 shadow-lg shadow-black/20 backdrop-blur-xl
                transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/90
                ${style.hoverBorder}
            `}
        >
            {/* Ambient Glow */}
            <div
                className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${style.glow} blur-xl transition-transform duration-500 group-hover:scale-150`}
            />

            <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                        {value}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${style.badge} shadow-inner transition-transform duration-300 group-hover:scale-110`}
                >
                    {icon}
                </div>
            </div>

            {progress !== undefined && (
                <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-950">
                        <div
                            className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

/*
 * ============================================
 * TASK STATUS ROW
 * ============================================
 */

interface TaskStatusRowProps {
    label: string;
    value: number;
    total: number;
    color: "emerald" | "amber" | "slate";
}

const statusColors = {
    emerald: {
        dot: "bg-emerald-400 ring-emerald-500/20",
        badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        bar: "bg-emerald-500",
    },
    amber: {
        dot: "bg-amber-400 ring-amber-500/20",
        badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
        bar: "bg-amber-500",
    },
    slate: {
        dot: "bg-slate-400 ring-slate-500/20",
        badge: "bg-slate-800 text-slate-300 border-slate-700",
        bar: "bg-slate-500",
    },
};

function TaskStatusRow({
    label,
    value,
    total,
    color,
}: TaskStatusRowProps) {
    const percentage = total === 0 ? 0 : Math.round((value / total) * 100);
    const style = statusColors[color];

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ring-2 ${style.dot}`} />
                    <span className="font-medium text-slate-200">{label}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${style.badge}`}>
                        {value}
                    </span>
                    <span className="w-10 text-right text-xs font-medium text-slate-400">
                        {percentage}%
                    </span>
                </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950 ring-1 ring-slate-800/80">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

/*
 * ============================================
 * EMPTY STATE
 * ============================================
 */

interface EmptyStateProps {
    title: string;
    description: string;
    href?: string;
    actionLabel?: string;
}

function EmptyState({
    title,
    description,
    href,
    actionLabel,
}: EmptyStateProps) {
    return (
        <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 shadow-inner">
                <FolderKanban className="h-5 w-5" />
            </div>

            <p className="font-bold text-white">
                {title}
            </p>

            <p className="mt-1 max-w-sm text-xs text-slate-400">
                {description}
            </p>

            {href && actionLabel && (
                <Link
                    href={href}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-500"
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{actionLabel}</span>
                </Link>
            )}
        </div>
    );
}

/*
 * ============================================
 * EMPTY WORKSPACE
 * ============================================
 */

function EmptyWorkspace() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
            <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10">
                    <AlertCircle className="h-7 w-7" />
                </div>

                <h2 className="text-xl font-bold text-white">
                    No Workspace Available
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                    Your account is currently not associated with any active tenant workspace.
                </p>

                <p className="mt-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                    Please contact your system administrator to assign you to a workspace.
                </p>
            </div>
        </div>
    );
}

/*
 * ============================================
 * LOADING SKELETON
 * ============================================
 */

function DashboardLoading() {
    return (
        <div className="space-y-8 p-6 sm:p-8 lg:p-10">
            <div>
                <div className="h-4 w-44 animate-pulse rounded-lg bg-slate-800/80" />
                <div className="mt-3 h-9 w-64 animate-pulse rounded-xl bg-slate-800/80" />
                <div className="mt-2 h-4 w-96 animate-pulse rounded-lg bg-slate-800/80" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-32 animate-pulse rounded-2xl border border-slate-800/60 bg-slate-900/40"
                    />
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="h-80 animate-pulse rounded-2xl border border-slate-800/60 bg-slate-900/40 lg:col-span-2" />
                <div className="h-80 animate-pulse rounded-2xl border border-slate-800/60 bg-slate-900/40" />
            </div>

            <div className="h-64 animate-pulse rounded-2xl border border-slate-800/60 bg-slate-900/40" />
        </div>
    );
}

/*
 * ============================================
 * ERROR STATE
 * ============================================
 */

function DashboardError() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
            <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
                    <AlertCircle className="h-7 w-7" />
                </div>

                <h2 className="text-xl font-bold text-white">
                    Unable to load dashboard
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                    We could not retrieve your workspace data from the server. Please check your network connection and try again.
                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );
}

/*
 * ============================================
 * DATE HELPERS
 * ============================================
 */

function formatDate(value: string | null) {
    if (!value) {
        return "No deadline";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
}