
"use client";

import { useState, type FormEvent } from "react";
import {
    CalendarDays,
    Loader2,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    createMilestone,
    deleteMilestone,
    getMilestones,
    updateMilestone,
} from "@/lib/api/milestones";

import type {
    MilestoneResponse,
    CreateMilestoneRequest,
} from "@/types/milestone";

interface MilestonesSectionProps {
    tenantId: string;
    projectId: string;
}

const emptyForm: CreateMilestoneRequest = {
    name: "",
    description: "",
    startDate: "",
    dueDate: "",
};

function toDateInput(value?: string) {
    if (!value) return "";
    return value.slice(0, 10);
}

function formatDate(value: string) {
    if (!value) return "Not set";

    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function MilestonesSection({
    tenantId,
    projectId,
}: MilestonesSectionProps) {
    const queryClient = useQueryClient();
    const queryKey = ["milestones", tenantId, projectId];

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] =
        useState<MilestoneResponse | null>(null);
    const [deletingMilestone, setDeletingMilestone] =
        useState<MilestoneResponse | null>(null);
    const [form, setForm] =
        useState<CreateMilestoneRequest>(emptyForm);

    const milestonesQuery = useQuery({
        queryKey,
        queryFn: () => getMilestones(tenantId, projectId),
        enabled: Boolean(tenantId && projectId),
    });

    const refreshMilestones = () =>
        queryClient.invalidateQueries({ queryKey });

    const createMutation = useMutation({
        mutationFn: (data: CreateMilestoneRequest) =>
            createMilestone(tenantId, projectId, data),
        onSuccess: async () => {
            await refreshMilestones();
            setIsFormOpen(false);
            setForm(emptyForm);
            toast.success("Milestone created successfully.");
        },
        onError: () => toast.error("Failed to create milestone."),
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: CreateMilestoneRequest;
        }) => updateMilestone(tenantId, projectId, id, data),
        onSuccess: async () => {
            await refreshMilestones();
            setIsFormOpen(false);
            setEditingMilestone(null);
            setForm(emptyForm);
            toast.success("Milestone updated successfully.");
        },
        onError: () => toast.error("Failed to update milestone."),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) =>
            deleteMilestone(tenantId, projectId, id),
        onSuccess: async () => {
            await refreshMilestones();
            setDeletingMilestone(null);
            toast.success("Milestone deleted successfully.");
        },
        onError: () => toast.error("Failed to delete milestone."),
    });

    const isSaving = createMutation.isPending || updateMutation.isPending;

    function openCreateForm() {
        setEditingMilestone(null);
        setForm(emptyForm);
        setIsFormOpen(true);
    }

    function openEditForm(milestone: MilestoneResponse) {
        setEditingMilestone(milestone);
        setForm({
            name: milestone.name,
            description: milestone.description ?? "",
            startDate: toDateInput(milestone.startDate),
            dueDate: toDateInput(milestone.dueDate),
        });
        setIsFormOpen(true);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (form.dueDate < form.startDate) {
            toast.error("The due date cannot be before the start date.");
            return;
        }

        const data: CreateMilestoneRequest = {
            name: form.name.trim(),
            description: form.description.trim(),
            startDate: new Date(`${form.startDate}T00:00:00`).toISOString(),
            dueDate: new Date(`${form.dueDate}T23:59:59`).toISOString(),
        };

        if (editingMilestone) {
            await updateMutation.mutateAsync({
                id: editingMilestone.id,
                data,
            });
        } else {
            await createMutation.mutateAsync(data);
        }
    }

    const milestones = milestonesQuery.data ?? [];

    return (
        <section className="rounded-xl border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
                <div>
                    <h2 className="text-lg font-semibold">Milestones</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Track important project dates and deliverables.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateForm}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    Add milestone
                </button>
            </div>

            <div className="p-5">
                {milestonesQuery.isPending ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading milestones...
                    </div>
                ) : milestonesQuery.isError ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-destructive">
                            Could not load milestones.
                        </p>
                        <button
                            type="button"
                            onClick={() => milestonesQuery.refetch()}
                            className="mt-3 text-sm underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : milestones.length === 0 ? (
                    <div className="py-10 text-center">
                        <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-3 font-medium">No milestones yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create your first milestone to track project progress.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {milestones.map((milestone) => (
                            <article
                                key={milestone.id}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-medium">{milestone.name}</h3>

                                        {milestone.description && (
                                            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                                                {milestone.description}
                                            </p>
                                        )}

                                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                                            <span>
                                                Start: {formatDate(milestone.startDate)}
                                            </span>
                                            <span>
                                                Due: {formatDate(milestone.dueDate)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditForm(milestone)}
                                            aria-label={`Edit ${milestone.name}`}
                                            className="rounded-md border p-2 hover:bg-muted"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setDeletingMilestone(milestone)}
                                            aria-label={`Delete ${milestone.name}`}
                                            className="rounded-md border border-destructive/30 p-2 text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="milestone-dialog-title"
                        className="my-auto w-full max-w-lg rounded-xl border bg-background shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b p-5">
                            <h3 id="milestone-dialog-title" className="font-semibold">
                                {editingMilestone ? "Edit milestone" : "Create milestone"}
                            </h3>
                            <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => setIsFormOpen(false)}
                                aria-label="Close"
                                className="rounded-md p-1 hover:bg-muted"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 p-5">
                            <div>
                                <label htmlFor="milestone-name" className="mb-1 block text-sm font-medium">
                                    Name
                                </label>
                                <input
                                    id="milestone-name"
                                    required
                                    maxLength={150}
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm({ ...form, name: event.target.value })
                                    }
                                    placeholder="e.g. MVP release"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="milestone-description" className="mb-1 block text-sm font-medium">
                                    Description
                                </label>
                                <textarea
                                    id="milestone-description"
                                    rows={3}
                                    maxLength={3000}
                                    value={form.description}
                                    onChange={(event) =>
                                        setForm({ ...form, description: event.target.value })
                                    }
                                    placeholder="Describe the milestone..."
                                    className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="milestone-start" className="mb-1 block text-sm font-medium">
                                        Start date
                                    </label>
                                    <input
                                        id="milestone-start"
                                        type="date"
                                        required
                                        value={form.startDate}
                                        onChange={(event) =>
                                            setForm({ ...form, startDate: event.target.value })
                                        }
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="milestone-due" className="mb-1 block text-sm font-medium">
                                        Due date
                                    </label>
                                    <input
                                        id="milestone-due"
                                        type="date"
                                        required
                                        min={form.startDate || undefined}
                                        value={form.dueDate}
                                        onChange={(event) =>
                                            setForm({ ...form, dueDate: event.target.value })
                                        }
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => setIsFormOpen(false)}
                                    className="rounded-md border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
                                >
                                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isSaving
                                        ? "Saving..."
                                        : editingMilestone
                                            ? "Save changes"
                                            : "Create milestone"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingMilestone && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-milestone-title"
                        className="w-full max-w-md rounded-xl border bg-background shadow-xl"
                    >
                        <div className="p-5">
                            <h3 id="delete-milestone-title" className="font-semibold">
                                Delete milestone?
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Are you sure you want to delete{" "}
                                <strong className="text-foreground">
                                    {deletingMilestone.name}
                                </strong>
                                ? This action cannot be undone.
                            </p>

                            <div className="mt-5 flex justify-end gap-2">
                                <button
                                    type="button"
                                    disabled={deleteMutation.isPending}
                                    onClick={() => setDeletingMilestone(null)}
                                    className="rounded-md border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={deleteMutation.isPending}
                                    onClick={() => deleteMutation.mutate(deletingMilestone.id)}
                                    className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground disabled:opacity-50"
                                >
                                    {deleteMutation.isPending && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
