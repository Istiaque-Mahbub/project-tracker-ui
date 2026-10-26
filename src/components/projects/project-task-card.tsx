
"use client";

import {
    CalendarDays,
    CheckCircle2,
    Circle,
    Clock3,
    Pencil,
    Trash2,
    UserPlus,
} from "lucide-react";

import type { TaskResponse } from "@/types/task";
import { TaskLabels } from "@/components/projects/task-labels";
import { TaskComments } from "@/components/projects/task-comments";

interface ProjectTaskCardProps {
    task: TaskResponse;
    tenantId: string;
    projectId: string;
    onEdit: () => void;
    onAssign: () => void;
    onDelete: () => void;
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

function normalize(value: string | number): string {
    const text = String(value).trim();

    if (/^\d+$/.test(text)) {
        const label =
            STATUS_LABELS[Number(text)] ??
            PRIORITY_LABELS[Number(text)];

        if (label) {
            return label.replace(/[\s-]/g, "").toLowerCase();
        }
    }

    return text.replace(/[\s_-]/g, "").toLowerCase();
}

function formatEnum(value: string | number): string {
    const text = String(value).trim();

    if (/^\d+$/.test(text)) {
        return STATUS_LABELS[Number(text)] ??
            PRIORITY_LABELS[Number(text)] ??
            `Unknown (${text})`;
    }

    return text
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTaskDate(value: string | null | undefined): string {
    if (!value) return "No due date";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "Invalid date"
        : date.toLocaleDateString();
}

function TaskStatusBadge({ status }: { status: string | number }) {
    const normalized = normalize(status);

    const color =
        normalized === "completed"
            ? "bg-green-500/10 text-green-600"
            : normalized === "inprogress"
                ? "bg-blue-500/10 text-blue-600"
                : normalized === "todo"
                    ? "bg-yellow-500/10 text-yellow-600"
                    : "bg-muted text-muted-foreground";

    return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
            {formatEnum(status)}
        </span>
    );
}

function TaskPriorityBadge({ priority }: { priority: string | number }) {
    const normalized = normalize(priority);

    const color =
        normalized === "critical" || normalized === "high"
            ? "bg-red-500/10 text-red-600"
            : normalized === "medium"
                ? "bg-orange-500/10 text-orange-600"
                : normalized === "low"
                    ? "bg-green-500/10 text-green-600"
                    : "bg-muted text-muted-foreground";

    return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
            {formatEnum(priority)}
        </span>
    );
}

export default function ProjectTaskCard({
    task,
    tenantId,
    projectId,
    onEdit,
    onAssign,
    onDelete,
}: ProjectTaskCardProps) {
    const status = normalize(task.status);

    return (
        <article className="overflow-hidden rounded-xl border bg-card transition-colors hover:border-border/80">
            <div className="flex flex-col gap-5 p-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                        {status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : status === "inprogress" ? (
                            <Clock3 className="h-5 w-5 text-blue-500" />
                        ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="break-words text-base font-semibold">
                            {task.title}
                        </h3>

                        {task.description && (
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                                {task.description}
                            </p>
                        )}

                        <div className="mt-3">
                            <TaskLabels
                                tenantId={tenantId}
                                projectId={projectId}
                                taskId={task.id}
                            />
                        </div>

                        <p className="mt-3 break-words text-sm text-muted-foreground">
                            Assigned to:{" "}
                            <span className="font-medium text-foreground">
                                {task.assignedToNames?.length
                                    ? task.assignedToNames.join(", ")
                                    : "Unassigned"}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 xl:max-w-[45%] xl:justify-end">
                    <TaskStatusBadge status={task.status} />
                    <TaskPriorityBadge priority={task.priority} />

                    {task.dueDate && (
                        <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatTaskDate(task.dueDate)}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={onAssign}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                    >
                        <UserPlus className="h-3.5 w-3.5" />
                        Assign
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </button>
                </div>
            </div>

            <section className="w-full min-w-0 border-t bg-muted/20 p-4 sm:p-5">
                <TaskComments
                    tenantId={tenantId}
                    projectId={projectId}
                    taskId={task.id}
                />
            </section>
        </article>
    );
}
