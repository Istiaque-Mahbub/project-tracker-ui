
"use client";

import { useEffect } from "react";
import { CalendarDays, Clock3, X } from "lucide-react";
import type { TaskResponse } from "@/types/task";
import TaskWorklogs from "./task-worklogs";


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

function getLabel(
    value: string | number,
    labels: Record<number, string>
): string {
    if (typeof value === "number" || /^\d+$/.test(String(value))) {
        return labels[Number(value)] ?? `Unknown (${value})`;
    }

    return String(value)
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTaskDate(value?: string | null): string {
    if (!value) return "Not set";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "Not set"
        : date.toLocaleDateString();
}

export default function TaskDetailsDialog({
    task,
    tenantId,
    projectId,
    onClose,
}: {
    task: TaskResponse;
    tenantId: string;
    projectId: string;
    onClose: () => void;
}) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="task-details-title"
                className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border bg-background shadow-xl"
            >
                <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background p-5">
                    <div className="min-w-0">
                        <h2
                            id="task-details-title"
                            className="break-words text-xl font-semibold"
                        >
                            {task.title}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Task details and tracked work time
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close task details"
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <div className="space-y-6 p-5">
                    <section className="space-y-2">
                        <h3 className="text-sm font-semibold">Description</h3>

                        <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                            {task.description || "No description provided."}
                        </p>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border p-4">
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className="mt-1 font-medium">
                                {getLabel(task.status, STATUS_LABELS)}
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <p className="text-xs text-muted-foreground">Priority</p>
                            <p className="mt-1 font-medium">
                                {getLabel(task.priority, PRIORITY_LABELS)}
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                Due date
                            </div>
                            <p className="mt-1 font-medium">
                                {formatTaskDate(task.dueDate)}
                            </p>
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock3 className="h-4 w-4" />
                                Created
                            </div>
                            <p className="mt-1 font-medium">
                                {formatTaskDate(task.createdAt)}
                            </p>
                        </div>
                    </section>

                    <section className="border-t pt-5">
                        <h3 className="mb-4 text-lg font-semibold">Worklogs</h3>

                        <TaskWorklogs
                            tenantId={tenantId}
                            projectId={projectId}
                            taskId={task.id}
                        />
                    </section>
                </div>
            </section>
        </div>
    );
}
