
"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getLabels,
    getTaskLabels,
    addLabelToTask,
    removeLabelFromTask,
} from "@/lib/api/labels";

import type { LabelResponse } from "@/types/label";

interface TaskLabelsProps {
    tenantId: string;
    projectId: string;
    taskId: string;
}

export function TaskLabels({
    tenantId,
    projectId,
    taskId,
}: TaskLabelsProps) {
    const queryClient = useQueryClient();
    const [selectedLabelId, setSelectedLabelId] = useState("");

    const labelsQuery = useQuery({
        queryKey: ["project-labels", tenantId, projectId],
        queryFn: () => getLabels(tenantId, projectId),
        enabled: Boolean(tenantId && projectId),
    });

    const taskLabelsQuery = useQuery({
        queryKey: ["task-labels", tenantId, projectId, taskId],
        queryFn: () => getTaskLabels(tenantId, projectId, taskId),
        enabled: Boolean(tenantId && projectId && taskId),
    });

    const assignedLabels = taskLabelsQuery.data ?? [];
    const availableLabels = (labelsQuery.data ?? []).filter(
        (label: LabelResponse) =>
            !assignedLabels.some(
                (assigned) => assigned.labelId === label.id
            )
    );

    const refreshLabels = async () => {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: ["task-labels", tenantId, projectId, taskId],
            }),
            queryClient.invalidateQueries({
                queryKey: ["project-labels", tenantId, projectId],
            }),
        ]);
    };

    const addMutation = useMutation({
        mutationFn: (labelId: string) =>
            addLabelToTask(tenantId, projectId, taskId, labelId),
        onSuccess: async () => {
            setSelectedLabelId("");
            await refreshLabels();
            toast.success("Label added to task.");
        },
        onError: (error) => {
            console.error("Failed to add task label:", error);
            toast.error("Unable to add label to task.");
        },
    });

    const removeMutation = useMutation({
        mutationFn: (labelId: string) =>
            removeLabelFromTask(tenantId, projectId, taskId, labelId),
        onSuccess: async () => {
            await refreshLabels();
            toast.success("Label removed from task.");
        },
        onError: (error) => {
            console.error("Failed to remove task label:", error);
            toast.error("Unable to remove label from task.");
        },
    });

    if (labelsQuery.isLoading || taskLabelsQuery.isLoading) {
        return (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading labels...
            </div>
        );
    }

    if (labelsQuery.isError || taskLabelsQuery.isError) {
        return (
            <div className="mt-3">
                <p className="text-xs text-destructive">
                    Unable to load task labels.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        void labelsQuery.refetch();
                        void taskLabelsQuery.refetch();
                    }}
                    className="mt-1 text-xs underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                {assignedLabels.map((label) => (
                    <span
                        key={label.labelId}
                        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs"
                        style={{
                            backgroundColor: `${label.color}18`,
                            borderColor: `${label.color}70`,
                            color: label.color,
                        }}
                    >
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: label.color }}
                        />
                        {label.labelName}

                        <button
                            type="button"
                            aria-label={`Remove ${label.labelName} label`}
                            title={`Remove ${label.labelName}`}
                            disabled={removeMutation.isPending}
                            onClick={() =>
                                removeMutation.mutate(label.labelId)
                            }
                            className="ml-1 rounded-full hover:opacity-60 disabled:opacity-40"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}

                {assignedLabels.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                        No labels assigned
                    </span>
                )}
            </div>

            {availableLabels.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={selectedLabelId}
                        onChange={(event) =>
                            setSelectedLabelId(event.target.value)
                        }
                        disabled={addMutation.isPending}
                        aria-label="Choose a label"
                        className="max-w-48 rounded-md border bg-background px-2 py-1.5 text-xs"
                    >
                        <option value="">Choose a label...</option>
                        {availableLabels.map((label: LabelResponse) => (
                            <option key={label.id} value={label.id}>
                                {label.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        disabled={
                            !selectedLabelId || addMutation.isPending
                        }
                        onClick={() => addMutation.mutate(selectedLabelId)}
                        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {addMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Plus className="h-3.5 w-3.5" />
                        )}
                        Add label
                    </button>
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">
                    {assignedLabels.length > 0
                        ? "All project labels are assigned."
                        : "Create a label in the Labels section first."}
                </p>
            )}
        </div>
    );
}
