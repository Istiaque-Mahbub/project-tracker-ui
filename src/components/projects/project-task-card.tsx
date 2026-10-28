import {
    CalendarDays,
    CheckCircle2,
    Circle,
    Clock3,
    Eye,
    Pencil,
    Trash2,
    UserPlus,
} from "lucide-react";

import type { TaskResponse } from "@/types/task";

// Add onView to your existing ProjectTaskCardProps:
interface ProjectTaskCardProps {
    task: TaskResponse;
    tenantId: string;
    projectId: string;
    onView: () => void;
    onEdit: () => void;
    onAssign: () => void;
    onDelete: () => void;
}

// Keep any other existing imports and helper functions.
// Ensure your component declaration is a DEFAULT export:
export default function ProjectTaskCard({
    task,
    tenantId,
    projectId,
    onView,
    onEdit,
    onAssign,
    onDelete,
}: ProjectTaskCardProps) {
    return (
        <div className="rounded-xl border bg-card p-5">
            {/* Keep your existing task title, description,
                labels, assignees, status, priority, due date,
                and TaskComments sections here. */}

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={onView}
                    aria-label={`View task ${task.title}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                >
                    <Eye className="h-3.5 w-3.5" />
                    View
                </button>

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
    );
}