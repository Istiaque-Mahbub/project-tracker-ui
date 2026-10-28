
"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    createLabel,
    deleteLabel,
    getLabels,
    updateLabel,
} from "@/lib/api/labels";

import type {
    CreateLabelRequest,
    LabelResponse,
} from "@/types/label";

interface LabelsSectionProps {
    tenantId: string;
    projectId: string;
}

const defaultLabel: CreateLabelRequest = {
    name: "",
    color: "#6366f1",
};

export default function LabelsSection({
    tenantId,
    projectId,
}: LabelsSectionProps) {
    const queryClient = useQueryClient();
    const queryKey = ["project-labels", tenantId, projectId];

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<LabelResponse | null>(null);
    const [deletingLabel, setDeletingLabel] = useState<LabelResponse | null>(null);
    const [form, setForm] = useState<CreateLabelRequest>(defaultLabel);

    const labelsQuery = useQuery({
        queryKey,
        queryFn: () => getLabels(tenantId, projectId),
        enabled: Boolean(tenantId && projectId),
    });

    const refreshLabels = () =>
        queryClient.invalidateQueries({ queryKey });

    const createMutation = useMutation({
        mutationFn: (data: CreateLabelRequest) =>
            createLabel(tenantId, projectId, data),
        onSuccess: async () => {
            await refreshLabels();
            setIsFormOpen(false);
            setForm(defaultLabel);
            toast.success("Label created.");
        },
        onError: () => toast.error("Could not create label."),
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: CreateLabelRequest;
        }) => updateLabel(tenantId, projectId, id, data),
        onSuccess: async () => {
            await refreshLabels();
            setIsFormOpen(false);
            setEditingLabel(null);
            setForm(defaultLabel);
            toast.success("Label updated.");
        },
        onError: () => toast.error("Could not update label."),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteLabel(tenantId, projectId, id),
        onSuccess: async () => {
            await refreshLabels();
            setDeletingLabel(null);
            toast.success("Label deleted.");
        },
        onError: () => toast.error("Could not delete label."),
    });

    const isSaving = createMutation.isPending || updateMutation.isPending;

    function openCreate() {
        setEditingLabel(null);
        setForm(defaultLabel);
        setIsFormOpen(true);
    }

    function openEdit(label: LabelResponse) {
        setEditingLabel(label);
        setForm({ name: label.name, color: label.color });
        setIsFormOpen(true);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = {
            name: form.name.trim(),
            color: form.color,
        };

        if (!data.name) {
            toast.error("Enter a label name.");
            return;
        }

        if (editingLabel) {
            await updateMutation.mutateAsync({ id: editingLabel.id, data });
        } else {
            await createMutation.mutateAsync(data);
        }
    }

    const labels = labelsQuery.data ?? [];

    return (
        <section className="rounded-xl border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
                <div>
                    <h2 className="text-lg font-semibold">Labels</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Create colored labels to organize project tasks.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                >
                    <Plus className="h-4 w-4" />
                    Create label
                </button>
            </div>

            <div className="p-5">
                {labelsQuery.isPending ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading labels...
                    </div>
                ) : labelsQuery.isError ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-destructive">Could not load labels.</p>
                        <button
                            type="button"
                            onClick={() => labelsQuery.refetch()}
                            className="mt-2 text-sm underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : labels.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="font-medium">No labels yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create a label to start organizing tasks.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {labels.map((label) => (
                            <div
                                key={label.id}
                                className="flex items-center gap-3 rounded-lg border p-3"
                            >
                                <span
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: label.color }}
                                />
                                <span className="text-sm font-medium">{label.name}</span>

                                <button
                                    type="button"
                                    onClick={() => openEdit(label)}
                                    aria-label={`Edit ${label.name}`}
                                    className="rounded-md p-1.5 hover:bg-muted"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDeletingLabel(label)}
                                    aria-label={`Delete ${label.name}`}
                                    className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="label-form-title"
                        className="w-full max-w-md rounded-xl border bg-background shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b p-5">
                            <h3 id="label-form-title" className="font-semibold">
                                {editingLabel ? "Edit label" : "Create label"}
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
                                <label htmlFor="label-name" className="mb-1 block text-sm font-medium">
                                    Label name
                                </label>
                                <input
                                    id="label-name"
                                    required
                                    maxLength={100}
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm({ ...form, name: event.target.value })
                                    }
                                    placeholder="e.g. Bug, Feature, Urgent"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="label-color" className="mb-1 block text-sm font-medium">
                                    Label color
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="label-color"
                                        type="color"
                                        value={form.color}
                                        onChange={(event) =>
                                            setForm({ ...form, color: event.target.value })
                                        }
                                        className="h-10 w-14 cursor-pointer rounded border bg-background p-1"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {form.color}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => setIsFormOpen(false)}
                                    className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
                                >
                                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isSaving ? "Saving..." : editingLabel ? "Save changes" : "Create label"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingLabel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="label-delete-title"
                        className="w-full max-w-md rounded-xl border bg-background p-5 shadow-xl"
                    >
                        <h3 id="label-delete-title" className="font-semibold">
                            Delete label?
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Delete{" "}
                            <strong className="text-foreground">{deletingLabel.name}</strong>?
                            This may affect tasks using this label.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={deleteMutation.isPending}
                                onClick={() => setDeletingLabel(null)}
                                className="rounded-md border px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleteMutation.isPending}
                                onClick={() => deleteMutation.mutate(deletingLabel.id)}
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
            )}
        </section>
    );
}
