
"use client";

import { useState } from "react";
import {
    Clock3,
    Loader2,
    Plus,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
    useWorklogActions,
    useWorklogs,
} from "@/hooks/use-worklogs";

function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;

    return `${hours}h ${remainingMinutes}m`;
}

function toLocalInputValue(date: Date) {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
}

export default function TaskWorklogs({
    tenantId,
    projectId,
    taskId,
}: {
    tenantId: string;
    projectId: string;
    taskId: string;
}) {
    const { data: worklogs = [], isLoading, isError, refetch } =
        useWorklogs(tenantId, projectId, taskId);

    const {
        createWorklog,
        deleteWorklog,
        isCreating,
        isDeleting,
    } = useWorklogActions(tenantId, projectId, taskId);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [startedAt, setStartedAt] = useState(
        toLocalInputValue(new Date(Date.now() - 60 * 60 * 1000))
    );
    const [endedAt, setEndedAt] = useState(
        toLocalInputValue(new Date())
    );
    const [description, setDescription] = useState("");

    const totalMinutes = worklogs.reduce(
        (total, item) => total + item.durationMinutes,
        0
    );

    const handleCreate = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const start = new Date(startedAt);
        const end = new Date(endedAt);

        if (
            !startedAt ||
            !endedAt ||
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end <= start
        ) {
            toast.error("End time must be after start time.");
            return;
        }

        if (!description.trim()) {
            toast.error("Please enter a description.");
            return;
        }

        const durationMinutes = Math.round(
            (end.getTime() - start.getTime()) / 60_000
        );

        try {
            await createWorklog({
                startedAt: start.toISOString(),
                endedAt: end.toISOString(),
                durationMinutes,
                description: description.trim(),
            });

            toast.success("Worklog created successfully.");
            setDescription("");
            setIsFormOpen(false);
        } catch {
            toast.error("Failed to create worklog.");
        }
    };

    const handleDelete = async (workLogId: string) => {
        if (!window.confirm("Delete this worklog?")) return;

        try {
            await deleteWorklog(workLogId);
            toast.success("Worklog deleted successfully.");
        } catch {
            toast.error("Failed to delete worklog.");
        }
    };

    return (
        <section className="space-y-5 rounded-xl border border-slate-800 bg-slate-950 p-5 text-slate-100 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Worklogs</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Total logged: {formatDuration(totalMinutes)}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsFormOpen((open) => !open)}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                    <Plus className="h-4 w-4" />
                    Log time
                </button>
            </div>

            {isFormOpen && (
                <form
                    onSubmit={handleCreate}
                    className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="worklog-start"
                                className="mb-1.5 block text-sm text-slate-300"
                            >
                                Started at
                            </label>
                            <input
                                id="worklog-start"
                                type="datetime-local"
                                value={startedAt}
                                onChange={(event) => setStartedAt(event.target.value)}
                                required
                                disabled={isCreating}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="worklog-end"
                                className="mb-1.5 block text-sm text-slate-300"
                            >
                                Ended at
                            </label>
                            <input
                                id="worklog-end"
                                type="datetime-local"
                                value={endedAt}
                                onChange={(event) => setEndedAt(event.target.value)}
                                required
                                disabled={isCreating}
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="worklog-description"
                            className="mb-1.5 block text-sm text-slate-300"
                        >
                            Description
                        </label>
                        <textarea
                            id="worklog-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={3}
                            maxLength={2000}
                            required
                            disabled={isCreating}
                            placeholder="What work did you complete?"
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                        />
                    </div>

                    <p className="text-xs text-slate-500">
                        Duration is calculated from the start and end times.
                    </p>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            disabled={isCreating}
                            className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isCreating}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {isCreating && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Save worklog
                        </button>
                    </div>
                </form>
            )}

            {isLoading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading worklogs...
                </div>
            ) : isError ? (
                <div className="rounded-lg border border-slate-800 p-5 text-sm text-slate-400">
                    Unable to load worklogs.
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="ml-2 text-indigo-400 hover:text-indigo-300"
                    >
                        Try again
                    </button>
                </div>
            ) : worklogs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center">
                    <Clock3 className="mx-auto h-8 w-8 text-slate-500" />
                    <p className="mt-3 font-medium">No worklogs yet</p>
                    <p className="mt-1 text-sm text-slate-400">
                        Log time to track the work completed on this task.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-slate-800">
                    {worklogs.map((worklog) => (
                        <article
                            key={worklog.id}
                            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">
                                        {worklog.userName}
                                    </span>
                                    <span className="rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-300">
                                        {formatDuration(worklog.durationMinutes)}
                                    </span>
                                </div>

                                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
                                    {worklog.description}
                                </p>

                                <p className="mt-2 text-xs text-slate-500">
                                    {new Date(worklog.startedAt).toLocaleString()}
                                    {" – "}
                                    {new Date(worklog.endedAt).toLocaleString()}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleDelete(worklog.id)}
                                disabled={isDeleting}
                                aria-label={`Delete worklog by ${worklog.userName}`}
                                className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
