
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAuth } from "@/lib/auth";
import { useDashboard } from "@/hooks/use-dashboard";

import {
    Activity,
    CheckSquare,
    CircleCheck,
    Clock3,
    FolderKanban,
} from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();

    const [tenantId, setTenantId] =
        useState<string | null>(null);

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

        if (
            !auth.tenants ||
            auth.tenants.length === 0
        ) {
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
        <div className="w-full space-y-8 px-4 py-6 sm:px-6 lg:px-8">

            {/* ========================================
                HEADER
            ======================================== */}

            <div>
                <p className="text-sm font-medium text-muted-foreground">
                    Developer Command Center
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight">
                    Dashboard
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    Overview of your projects, tasks,
                    and recent activity.
                </p>
            </div>

            {/* ========================================
                STATS
            ======================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

                <StatCard
                    title="Projects"
                    value={projects.length}
                    icon={
                        <FolderKanban className="h-5 w-5" />
                    }
                    description="Workspace projects"
                />

                <StatCard
                    title="Total Tasks"
                    value={tasks.length}
                    icon={
                        <CheckSquare className="h-5 w-5" />
                    }
                    description="Across all projects"
                />

                <StatCard
                    title="Completed"
                    value={completedTasks.length}
                    icon={
                        <CircleCheck className="h-5 w-5" />
                    }
                    description="Finished tasks"
                />

                <StatCard
                    title="In Progress"
                    value={inProgressTasks.length}
                    icon={
                        <Clock3 className="h-5 w-5" />
                    }
                    description="Currently active"
                />

                <StatCard
                    title="Completion"
                    value={`${completionRate}%`}
                    icon={
                        <Activity className="h-5 w-5" />
                    }
                    description="Overall progress"
                />

            </div>

            {/* ========================================
                MAIN CONTENT
            ======================================== */}

            <div className="grid min-w-0 gap-6 lg:grid-cols-3">

                {/* ====================================
                    ACTIVE PROJECTS
                ==================================== */}

                <section className="min-w-0 rounded-2xl border bg-card p-5 shadow-sm sm:p-6 lg:col-span-2">

                    <div className="mb-6">
                        <h2 className="font-semibold">
                            Active Projects
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Projects in your workspace.
                        </p>
                    </div>

                    {projects.length === 0 ? (
                        <EmptyState
                            title="No projects yet"
                            description="Create your first project to start organizing your development work."
                        />
                    ) : (
                        <div className="space-y-3">

                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="rounded-xl border p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex min-w-0 items-start justify-between gap-4">

                                        <div className="min-w-0">

                                            <h3 className="truncate font-medium">
                                                {project.name}
                                            </h3>

                                            {project.description ? (
                                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                    {project.description}
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    No description.
                                                </p>
                                            )}

                                        </div>

                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                </section>

                {/* ====================================
                    TASK OVERVIEW
                ==================================== */}

                <section className="min-w-0 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">

                    <div className="mb-6">
                        <h2 className="font-semibold">
                            Task Overview
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Current task distribution.
                        </p>
                    </div>

                    {tasks.length === 0 ? (
                        <EmptyState
                            title="No tasks yet"
                            description="Tasks will appear here once they are created."
                        />
                    ) : (
                        <div className="space-y-5">

                            <TaskStatusRow
                                label="To Do"
                                value={todoTasks.length}
                                total={tasks.length}
                            />

                            <TaskStatusRow
                                label="In Progress"
                                value={inProgressTasks.length}
                                total={tasks.length}
                            />

                            <TaskStatusRow
                                label="Completed"
                                value={completedTasks.length}
                                total={tasks.length}
                            />

                        </div>
                    )}

                </section>

            </div>

            {/* ========================================
                DUE THIS WEEK
            ======================================== */}

            <section className="min-w-0 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">

                <div className="mb-6">
                    <h2 className="font-semibold">
                        Due This Week
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Tasks approaching their deadline.
                    </p>
                </div>

                {dueThisWeek.length === 0 ? (
                    <EmptyState
                        title="Nothing due this week"
                        description="There are no upcoming unfinished tasks with deadlines in the next seven days."
                    />
                ) : (
                    <div className="space-y-3">

                        {dueThisWeek.map((task) => (
                            <div
                                key={task.id}
                                className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                            >

                                <div className="min-w-0">

                                    <p className="truncate font-medium">
                                        {task.title}
                                    </p>

                                    {task.assignedToName && (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Assigned to{" "}
                                            {task.assignedToName}
                                        </p>
                                    )}

                                </div>

                                <p className="shrink-0 text-sm text-muted-foreground">
                                    {formatDate(task.dueDate)}
                                </p>

                            </div>
                        ))}

                    </div>
                )}

            </section>

            {/* ========================================
                RECENT ACTIVITY
            ======================================== */}

            <section className="min-w-0 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">

                <div className="mb-6">
                    <h2 className="font-semibold">
                        Recent Activity
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Latest activity in this workspace.
                    </p>
                </div>

                {activities.length === 0 ? (
                    <EmptyState
                        title="No activity yet"
                        description="Activity will appear here when users create or update projects and tasks."
                    />
                ) : (
                    <div className="space-y-4">

                        {activities
                            .slice(0, 10)
                            .map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex gap-4 rounded-xl border p-4"
                                >

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                                        <Activity className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <div className="flex flex-wrap items-center gap-2">

                                            <span className="font-medium">
                                                {activity.userName ||
                                                    "Unknown user"}
                                            </span>

                                            <span className="text-xs text-muted-foreground">
                                                {activity.action}
                                            </span>

                                        </div>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {activity.description}
                                        </p>

                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {formatDateTime(
                                                activity.createdAt
                                            )}
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
    description?: string;
}

function StatCard({
    title,
    value,
    icon,
    description,
}: StatCardProps) {
    return (
        <div
            className="
                group
                relative
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                bg-card
                p-5
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-md
            "
        >

            {/* Decorative background circle */}

            <div
                className="
                    pointer-events-none
                    absolute
                    -right-8
                    -top-8
                    h-24
                    w-24
                    rounded-full
                    bg-primary/5
                    transition-transform
                    duration-300
                    group-hover:scale-125
                "
            />

            <div className="relative flex items-start justify-between gap-4">

                {/* Text */}

                <div className="min-w-0">

                    <p className="truncate text-sm font-medium text-muted-foreground">
                        {title}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight">
                        {value}
                    </p>

                    {description && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}

                </div>

                {/* Icon */}

                <div
                    className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        bg-muted/50
                        text-muted-foreground
                        transition-colors
                        group-hover:bg-primary/10
                        group-hover:text-primary
                    "
                >
                    {icon}
                </div>

            </div>

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
}

function TaskStatusRow({
    label,
    value,
    total,
}: TaskStatusRowProps) {
    const percentage =
        total === 0
            ? 0
            : Math.round(
                (value / total) * 100
            );

    return (
        <div>

            <div className="mb-2 flex justify-between text-sm">

                <span>{label}</span>

                <span className="text-muted-foreground">
                    {value}
                </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">

                <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
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
}

function EmptyState({
    title,
    description,
}: EmptyStateProps) {
    return (
        <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <FolderKanban className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="font-medium">
                {title}
            </p>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {description}
            </p>

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
        <div className="flex min-h-[60vh] items-center justify-center px-6">

            <div className="max-w-md text-center">

                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <FolderKanban className="h-6 w-6 text-muted-foreground" />
                </div>

                <h2 className="text-xl font-semibold">
                    No workspace available
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    Your account is not associated with
                    a workspace yet.
                </p>

                <p className="mt-1 max-w-md text-sm text-red-500">
                    Please contact admin to create a new tenant.
                </p>

            </div>

        </div>
    );
}

/*
 * ============================================
 * LOADING
 * ============================================
 */

function DashboardLoading() {
    return (
        <div className="w-full space-y-8 px-4 py-6 sm:px-6 lg:px-8">

            <div>

                <div className="h-4 w-40 animate-pulse rounded bg-muted" />

                <div className="mt-3 h-9 w-56 animate-pulse rounded bg-muted" />

                <div className="mt-3 h-4 w-80 animate-pulse rounded bg-muted" />

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

                {Array.from({
                    length: 5,
                }).map((_, index) => (
                    <div
                        key={index}
                        className="h-32 animate-pulse rounded-2xl bg-muted"
                    />
                ))}

            </div>

            <div className="grid gap-6 lg:grid-cols-3">

                <div className="h-72 animate-pulse rounded-2xl bg-muted lg:col-span-2" />

                <div className="h-72 animate-pulse rounded-2xl bg-muted" />

            </div>

            <div className="h-52 animate-pulse rounded-2xl bg-muted" />

            <div className="h-64 animate-pulse rounded-2xl bg-muted" />

        </div>
    );
}

/*
 * ============================================
 * ERROR
 * ============================================
 */

function DashboardError() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center px-6">

            <div className="max-w-md text-center">

                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Activity className="h-6 w-6 text-muted-foreground" />
                </div>

                <h2 className="text-xl font-semibold">
                    Unable to load dashboard
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    We couldn't retrieve your workspace
                    data. Please try again.
                </p>

            </div>

        </div>
    );
}

/*
 * ============================================
 * DATE HELPERS
 * ============================================
 */

function formatDate(
    value: string | null
) {
    if (!value) {
        return "No deadline";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    ).format(new Date(value));
}

function formatDateTime(
    value: string
) {
    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }
    ).format(new Date(value));
}

