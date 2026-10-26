
"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw, Search, Users, X } from "lucide-react";
import type { TaskResponse } from "@/types/task";
import ProjectTaskCard from "@/components/projects/project-task-card";

interface ProjectTaskListProps {
    tenantId: string;
    projectId: string;
    tasks: TaskResponse[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    onCreateTask: () => void;
    onEditTask: (task: TaskResponse) => void;
    onAssignTask: (task: TaskResponse) => void;
    onDeleteTask: (task: TaskResponse) => void;
}

export default function ProjectTaskList({
    tenantId,
    projectId,
    tasks,
    isLoading,
    isError,
    onRetry,
    onCreateTask,
    onEditTask,
    onAssignTask,
    onDeleteTask,
}: ProjectTaskListProps) {
    const [search, setSearch] = useState("");
    const [assignedFilter, setAssignedFilter] = useState("all");

    // Collect unique developer names from the tasks.
    const assigneeNames = useMemo(() => {
        return [
            ...new Set(
                tasks.flatMap((task) =>
                    (task.assignedToNames ?? [])
                        .filter((name): name is string => Boolean(name?.trim()))
                        .map((name) => name.trim())
                )
            ),
        ].sort((a, b) => a.localeCompare(b));
    }, [tasks]);

    // Search by assigned developer name and filter by a selected developer.
    const filteredTasks = useMemo(() => {
        const query = search.trim().toLowerCase();

        return tasks.filter((task) => {
            const names = (task.assignedToNames ?? []).filter(
                (name): name is string => Boolean(name?.trim())
            );

            const matchesSearch =
                !query ||
                names.some((name) => name.toLowerCase().includes(query)) ||
                task.title.toLowerCase().includes(query);

            const matchesAssignee =
                assignedFilter === "all"
                    ? true
                    : assignedFilter === "unassigned"
                        ? names.length === 0
                        : names.some((name) => name === assignedFilter);

            return matchesSearch && matchesAssignee;
        });
    }, [tasks, search, assignedFilter]);

    const clearFilters = () => {
        setSearch("");
        setAssignedFilter("all");
    };

    const hasFilters = search.trim() !== "" || assignedFilter !== "all";

    return (
        <section className="space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Tasks</h2>
                    <p className="text-sm text-muted-foreground">
                        {filteredTasks.length} of {tasks.length} tasks
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onCreateTask}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                    <Plus className="h-4 w-4" />
                    New Task
                </button>
            </div>

            {/* Search and assignee filter */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_240px_auto]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by developer or task title..."
                        aria-label="Search tasks by assigned developer or title"
                        className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="relative">
                    <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <select
                        value={assignedFilter}
                        onChange={(event) => setAssignedFilter(event.target.value)}
                        aria-label="Filter tasks by assigned developer"
                        className="w-full appearance-none rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All developers</option>
                        <option value="unassigned">Unassigned</option>

                        {assigneeNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                {hasFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </button>
                )}
            </div>

            {/* Task states */}
            {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading tasks...
                </div>
            ) : isError ? (
                <div className="rounded-lg border p-6 text-center">
                    <p className="text-sm text-destructive">
                        Failed to load tasks.
                    </p>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </button>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="font-medium">
                        {hasFilters ? "No matching tasks found" : "No tasks yet"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {hasFilters
                            ? "Try another developer name or clear your filters."
                            : "Create a task to get started."}
                    </p>

                    {hasFilters ? (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-3 rounded-md border px-3 py-2 text-sm"
                        >
                            Clear filters
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onCreateTask}
                            className="mt-3 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                        >
                            Create task
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTasks.map((task) => (
                        <ProjectTaskCard
                            key={task.id}
                            task={task}
                            tenantId={tenantId}
                            projectId={projectId}
                            onEdit={() => onEditTask(task)}
                            onAssign={() => onAssignTask(task)}
                            onDelete={() => onDeleteTask(task)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
