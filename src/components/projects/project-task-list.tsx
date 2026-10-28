
"use client";

import {
    AlertCircle,
    Eye,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    UserPlus,
    ListTodo,
} from "lucide-react";

import type { TaskResponse } from "@/types/task";

interface ProjectTaskListProps {
    tenantId: string;
    projectId: string;
    tasks: TaskResponse[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    onCreateTask: () => void;
    onViewTask: (task: TaskResponse) => void;
    onEditTask: (task: TaskResponse) => void;
    onAssignTask: (task: TaskResponse) => void;
    onDeleteTask: (task: TaskResponse) => void;
}

const STATUS_LABELS: Record<number, string> = {
    0: "Backlog",
    1: "Todo",
    2: "In Progress",
    3: "Code Review",
    4: "Testing",
    5: "Completed",
};

const PRIORITY_LABELS: Record<number, string> = {
    0: "Low",
    1: "Medium",
    2: "High",
    3: "Critical",
};

const PRIORITY_STYLES: Record<number, string> = {
    0: "bg-slate-500/10 text-slate-500",
    1: "bg-blue-500/10 text-blue-500",
    2: "bg-orange-500/10 text-orange-500",
    3: "bg-red-500/10 text-red-500",
};

export default function ProjectTaskList({
    tasks,
    isLoading,
    isError,
    onRetry,
    onCreateTask,
    onViewTask,
    onEditTask,
    onAssignTask,
    onDeleteTask,
}: ProjectTaskListProps) {
    return (
        <section className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ListTodo className="h-5 w-5" />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold">
                            Tasks
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Manage tasks for this project.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onCreateTask}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Create Task
                </button>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading tasks...
                </div>
            )}

            {/* Error */}
            {!isLoading && isError && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
                    <AlertCircle className="mb-3 h-8 w-8 text-destructive" />

                    <h3 className="font-semibold">
                        Unable to load tasks
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Something went wrong while loading this project's tasks.
                    </p>

                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <ListTodo className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <h3 className="font-semibold">
                        No tasks yet
                    </h3>

                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        Create your first task to start organizing work in this project.
                    </p>

                    <button
                        type="button"
                        onClick={onCreateTask}
                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Create Task
                    </button>
                </div>
            )}

            {/* Task list */}
            {!isLoading && !isError && tasks.length > 0 && (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <article
                            key={task.id}
                            className="min-w-0 rounded-xl border bg-background p-4 transition-colors hover:border-primary/30 sm:p-5"
                        >
                            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                {/* Title and description */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <h3
                                            className="min-w-0 flex-1 truncate text-base font-semibold text-foreground"
                                            title={task.title}
                                        >
                                            {task.title}
                                        </h3>

                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[task.priority] ??
                                                PRIORITY_STYLES[1]
                                                }`}
                                        >
                                            {PRIORITY_LABELS[task.priority] ??
                                                "Medium"}
                                        </span>
                                    </div>

                                    <p
                                        className="mt-1.5 line-clamp-2 break-words text-sm leading-5 text-muted-foreground"
                                        title={task.description || ""}
                                    >
                                        {task.description?.trim() ||
                                            "No description provided."}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                            {STATUS_LABELS[task.status] ??
                                                "Unknown status"}
                                        </span>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex shrink-0 flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onViewTask(task)}
                                        title="View task"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>View</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onEditTask(task)}
                                        title="Edit task"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span>Edit</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onAssignTask(task)}
                                        title="Assign task"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        <span>Assign</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onDeleteTask(task)}
                                        title="Delete task"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
