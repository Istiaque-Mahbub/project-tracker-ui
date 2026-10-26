
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Circle,
    Clock3,
    FolderKanban,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    UserPlus,
    X,
} from "lucide-react";
import { toast } from "sonner";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { getAuth } from "@/lib/auth";
import { getCurrentTenantId } from "@/lib/tenant";
import { getProject } from "@/lib/api/projects";
import { getProjectMembers } from "@/lib/api/project-members";
import { createTask, updateTask, assignTask, deleteTask } from "@/lib/api/tasks";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";

import type { ProjectResponse } from "@/types/project";
import type {
    CreateTaskRequest,
    UpdateTaskRequest,
    TaskResponse,
    ProjectMember,
    TaskPriority,
} from "@/types/task";
import MilestonesSection from "@/components/projects/milestones-section";
import MembersSection from "@/components/projects/members-section";
import LabelsSection from "@/components/projects/labels-section";
import { TaskLabels } from "@/components/projects/task-labels";
import { TaskComments } from "@/components/projects/task-comments";
import ProjectTaskList from "@/components/projects/project-task-list";

const TASK_STATUS_LABELS: Record<number, string> = {
    0: "Backlog",
    1: "Todo",
    2: "In Progress",
    3: "Code Review",
    4: "Testing",
    5: "Completed",
};

const TASK_PRIORITY_LABELS: Record<number, string> = {
    0: "Low",
    1: "Medium",
    2: "High",
    3: "Critical",
};

export default function ProjectDetailsPage() {
    const router = useRouter();
    const params = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();

    const projectId = params.projectId;
    const tenantId = getCurrentTenantId();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
    const [assigningTask, setAssigningTask] = useState<TaskResponse | null>(null);
    const [deletingTask, setDeletingTask] = useState<TaskResponse | null>(null);

    useEffect(() => {
        if (!getAuth()) router.replace("/login");
    }, [router]);

    const projectQuery = useQuery<ProjectResponse>({
        queryKey: ["project", tenantId, projectId],
        queryFn: () => {
            if (!tenantId) throw new Error("No tenant selected.");
            return getProject(tenantId, projectId);
        },
        enabled: Boolean(tenantId && projectId),
    });

    const {
        updateProject,
        deleteProject,
        isUpdating,
        isDeleting,
    } = useProjects(tenantId);

    const {
        tasks,
        isLoading: isTasksLoading,
        isError: isTasksError,
        refetch: refetchTasks,
        isCreating: isCreatingTask,
    } = useTasks(tenantId, projectId);

    const membersQuery = useQuery({
        queryKey: ["project-members", tenantId, projectId],
        queryFn: () => {
            if (!tenantId || !projectId) {
                throw new Error("No tenant or project selected.");
            }

            return getProjectMembers(tenantId, projectId);
        },
        enabled: Boolean(tenantId && projectId),
    });

    const members = membersQuery.data ?? [];

    const refreshTasks = async () => {
        await queryClient.invalidateQueries({
            queryKey: ["tasks", tenantId, projectId],
        });
        await refetchTasks();
    };

    const createTaskMutation = useMutation({
        mutationFn: (data: CreateTaskRequest) => {
            if (!tenantId) throw new Error("No tenant selected.");
            return createTask(tenantId, projectId, data);
        },
        onSuccess: async () => {
            await refreshTasks();
            setIsCreateTaskDialogOpen(false);
            toast.success("Task created successfully.");
        },
        onError: (error) => {
            console.error("Failed to create task:", error);
            toast.error("Task creation failed.");
        },
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({
            taskId,
            data,
        }: {
            taskId: string;
            data: UpdateTaskRequest;
        }) => {
            if (!tenantId) throw new Error("No tenant selected.");

            return updateTask(tenantId, projectId, taskId, data);
        },
        onSuccess: async () => {
            await refreshTasks();
            setEditingTask(null);
            toast.success("Task updated successfully.");
        },
        onError: (error) => {
            console.error("Failed to update task:", error);
            toast.error("Task update failed. Check your permissions and request data.");
        },
    });

    const assignTaskMutation = useMutation({
        mutationFn: ({
            taskId,
            userIds,
        }: {
            taskId: string;
            userIds: string[];
        }) => {
            if (!tenantId) throw new Error("No tenant selected.");

            return assignTask(tenantId, projectId, taskId, {
                assignedToIds: userIds,
            });
        },
        onSuccess: async () => {
            await refreshTasks();
            setAssigningTask(null);
            toast.success("Members assigned successfully.");
        },
        onError: (error) => {
            console.error("Failed to assign task:", error);
            toast.error("Assignment failed. Check project membership and permissions.");
        },
    });


    const deleteTaskMutation = useMutation({
        mutationFn: (taskId: string) => {
            if (!tenantId) {
                throw new Error("No tenant selected.");
            }

            return deleteTask(tenantId, projectId, taskId);
        },
        onSuccess: async () => {
            await refreshTasks();
            setDeletingTask(null);
            toast.success("Task deleted successfully.");
        },
        onError: (error) => {
            console.error("Failed to delete task:", error);
            toast.error("Failed to delete task. Check your permissions.");
        },
    });


    const handleUpdateProject = async (
        name: string,
        description: string
    ) => {
        try {
            await updateProject({
                projectId,
                data: {
                    name,
                    description: description.trim() || null,
                },
            });

            await queryClient.invalidateQueries({
                queryKey: ["project", tenantId, projectId],
            });

            await projectQuery.refetch();
            setIsEditDialogOpen(false);
            toast.success("Project updated successfully.");
        } catch (error) {
            console.error("Failed to update project:", error);
            toast.error("Failed to update project.");
        }
    };

    const handleDeleteProject = async () => {
        try {
            await deleteProject(projectId);
            setIsDeleteDialogOpen(false);

            await queryClient.invalidateQueries({
                queryKey: ["projects", tenantId],
            });

            toast.success("Project deleted successfully.");
            router.push("/dashboard/projects");
        } catch (error) {
            console.error("Failed to delete project:", error);
            toast.error("Failed to delete project.");
        }
    };

    const handleCreateTask = async (data: CreateTaskRequest) => {
        await createTaskMutation.mutateAsync(data);
    };

    const handleUpdateTask = async (
        taskId: string,
        data: UpdateTaskRequest
    ) => {
        await updateTaskMutation.mutateAsync({ taskId, data });
    };

    const handleAssignTask = async (
        taskId: string,
        userIds: string[]
    ) => {
        await assignTaskMutation.mutateAsync({ taskId, userIds });
    };

    if (!tenantId) {
        return (
            <PageMessage
                title="No tenant available"
                description="Please log in again to continue."
            />
        );
    }

    const handleDeleteTask = async (taskId: string) => {
        await deleteTaskMutation.mutateAsync(taskId);
    };

    if (projectQuery.isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading project...
            </div>
        );
    }

    if (projectQuery.isError || !projectQuery.data) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <div className="rounded-xl border bg-card p-6">
                    <h2 className="font-semibold">Unable to load project</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        The project could not be loaded, or you may not have access.
                    </p>
                    <button
                        type="button"
                        onClick={() => projectQuery.refetch()}
                        className="mt-4 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/dashboard/projects"
                        className="ml-2 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    const project = projectQuery.data;

    return (
        <>
            <main className="space-y-6 p-6">
                <Link
                    href="/dashboard/projects"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Projects
                </Link>

                <section className="rounded-xl border bg-card p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FolderKanban className="h-7 w-7" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="break-words text-2xl font-bold">
                                    {project.name}
                                </h1>
                                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                                    {project.description || "No description provided."}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsEditDialogOpen(true)}
                                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit Project
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                className="inline-flex items-center gap-2 rounded-md bg-destructive px-3 py-2 text-sm text-destructive-foreground hover:bg-destructive/90"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4 border-t pt-5 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Created {formatDate(project.createAt)}
                        </span>
                        {project.updateAt && (
                            <span className="inline-flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Updated {formatDate(project.updateAt)}
                            </span>
                        )}
                    </div>
                </section>


                <ProjectTaskList
                    tenantId={tenantId}
                    projectId={projectId}
                    tasks={tasks}
                    isLoading={isTasksLoading}
                    isError={isTasksError}
                    onRetry={() => {
                        void refetchTasks();
                    }}
                    onCreateTask={() => setIsCreateTaskDialogOpen(true)}
                    onEditTask={(task) => setEditingTask(task)}
                    onAssignTask={(task) => setAssigningTask(task)}
                    onDeleteTask={(task) => setDeletingTask(task)}
                />


                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <MembersSection
                        tenantId={tenantId}
                        projectId={projectId}
                    />
                    <MilestonesSection
                        tenantId={tenantId}
                        projectId={projectId}
                    />
                    <LabelsSection
                        tenantId={tenantId}
                        projectId={projectId}
                    />
                </section>
            </main>

            {isEditDialogOpen && (
                <EditProjectDialog
                    project={project}
                    isSubmitting={isUpdating}
                    onClose={() => setIsEditDialogOpen(false)}
                    onSubmit={handleUpdateProject}
                />
            )}

            {isDeleteDialogOpen && (
                <DeleteProjectDialog
                    projectName={project.name}
                    isDeleting={isDeleting}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleDeleteProject}
                />
            )}

            {isCreateTaskDialogOpen && (
                <CreateTaskDialog
                    isSubmitting={createTaskMutation.isPending || isCreatingTask}
                    onClose={() => setIsCreateTaskDialogOpen(false)}
                    onSubmit={handleCreateTask}
                />
            )}

            {editingTask && (
                <EditTaskDialog
                    key={editingTask.id}
                    task={editingTask}
                    members={members}
                    isMembersLoading={membersQuery.isLoading}
                    isMembersError={membersQuery.isError}
                    isSubmitting={updateTaskMutation.isPending}
                    onClose={() => setEditingTask(null)}
                    onSubmit={handleUpdateTask}
                />
            )}

            {assigningTask && (
                <AssignTaskDialog
                    key={assigningTask.id}
                    task={assigningTask}
                    members={members}
                    isMembersLoading={membersQuery.isLoading}
                    isMembersError={membersQuery.isError}
                    isSubmitting={assignTaskMutation.isPending}
                    onClose={() => setAssigningTask(null)}
                    onSubmit={handleAssignTask}
                />
            )}
        </>
    );
}

function TaskStatusBadge({ status }: { status: string | number }) {
    const normalized = normalizeStatus(status);
    const className =
        normalized === "completed"
            ? "bg-green-500/10 text-green-600"
            : normalized === "inprogress"
                ? "bg-blue-500/10 text-blue-600"
                : normalized === "todo"
                    ? "bg-yellow-500/10 text-yellow-600"
                    : "bg-muted text-muted-foreground";

    return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
            {formatStatusText(status)}
        </span>
    );
}

function TaskPriorityBadge({ priority }: { priority: string | number }) {
    const normalized = normalizePriority(priority);
    const className =
        normalized === "critical" || normalized === "high"
            ? "bg-red-500/10 text-red-600"
            : normalized === "medium"
                ? "bg-orange-500/10 text-orange-600"
                : normalized === "low"
                    ? "bg-green-500/10 text-green-600"
                    : "bg-muted text-muted-foreground";

    return (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
            {formatPriorityText(priority)}
        </span>
    );
}

function CreateTaskDialog({
    isSubmitting,
    onClose,
    onSubmit,
}: {
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTaskRequest) => Promise<void>;
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>(1);
    const [dueDate, setDueDate] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            setError("Task title is required.");
            return;
        }

        if (trimmedTitle.length > 200) {
            setError("Task title cannot exceed 200 characters.");
            return;
        }

        setError(null);

        try {
            await onSubmit({
                title: trimmedTitle,
                description: description.trim() || null,
                assignedToIds: [],
                milestoneId: null,
                priority,
                status: 0,
                dueDate: dueDate
                    ? new Date(`${dueDate}T00:00:00`).toISOString()
                    : null,
            });
        } catch {
            setError("Unable to create task. Please try again.");
        }
    };

    return (
        <DialogShell title="Create Task" onClose={onClose} isSubmitting={isSubmitting}>
            <form onSubmit={handleSubmit} className="space-y-5 p-5">
                <Field label="Task title">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={200}
                        required
                        disabled={isSubmitting}
                        className={inputClass}
                        placeholder="Enter task title"
                    />
                </Field>

                <Field label="Description">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        disabled={isSubmitting}
                        className={inputClass}
                        placeholder="Describe the task..."
                    />
                </Field>

                <Field label="Priority">
                    <select
                        value={priority}
                        onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
                        disabled={isSubmitting}
                        className={inputClass}
                    >
                        <option value={0}>Low</option>
                        <option value={1}>Medium</option>
                        <option value={2}>High</option>
                        <option value={3}>Critical</option>
                    </select>
                </Field>

                <Field label="Due date">
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        disabled={isSubmitting}
                        className={inputClass}
                    />
                </Field>

                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

                <DialogActions
                    onClose={onClose}
                    isSubmitting={isSubmitting}
                    submitLabel="Create Task"
                />
            </form>
        </DialogShell>
    );
}

function EditTaskDialog({
    task,
    members,
    isMembersLoading,
    isMembersError,
    isSubmitting,
    onClose,
    onSubmit,
}: {
    task: TaskResponse;
    members: ProjectMember[];
    isMembersLoading: boolean;
    isMembersError: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (taskId: string, data: UpdateTaskRequest) => Promise<void>;
}) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? "");
    const [priority, setPriority] = useState<TaskPriority>(task.priority);
    const [status, setStatus] = useState(task.status);
    const [dueDate, setDueDate] = useState(toDateInputValue(task.dueDate));
    const [selectedIds, setSelectedIds] = useState<string[]>(
        task.assignedToIds ?? []
    );
    const [error, setError] = useState<string | null>(null);

    const toggleMember = (userId: string) => {
        setSelectedIds((current) =>
            current.includes(userId)
                ? current.filter((id) => id !== userId)
                : [...current, userId]
        );
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            setError("Task title is required.");
            return;
        }

        setError(null);

        try {
            await onSubmit(task.id, {
                title: trimmedTitle,
                description: description.trim() || null,
                assignedToIds: selectedIds,
                milestoneId: task.milestoneId ?? null,
                priority,
                status,
                dueDate: dueDate
                    ? new Date(`${dueDate}T00:00:00`).toISOString()
                    : null,
            });
        } catch {
            setError("Unable to update task. Please try again.");
        }
    };

    return (
        <DialogShell title="Edit Task" onClose={onClose} isSubmitting={isSubmitting}>
            <form onSubmit={handleSubmit} className="space-y-5 p-5">
                <Field label="Task title">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={200}
                        required
                        disabled={isSubmitting}
                        className={inputClass}
                    />
                </Field>

                <Field label="Description">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        disabled={isSubmitting}
                        className={inputClass}
                    />
                </Field>

                <Field label="Status">
                    <select
                        value={status}
                        onChange={(e) => setStatus(Number(e.target.value))}
                        disabled={isSubmitting}
                        className={inputClass}
                    >
                        {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Priority">
                    <select
                        value={priority}
                        onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
                        disabled={isSubmitting}
                        className={inputClass}
                    >
                        {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Due date">
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        disabled={isSubmitting}
                        className={inputClass}
                    />
                </Field>

                <Field label="Assigned project members">
                    {isMembersLoading ? (
                        <p className="text-sm text-muted-foreground">Loading members...</p>
                    ) : isMembersError ? (
                        <p role="alert" className="text-sm text-destructive">
                            Unable to load project members.
                        </p>
                    ) : members.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No project members are available.
                        </p>
                    ) : (
                        <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                            {members.map((member) => (
                                <label key={member.userId} className="flex items-center gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(member.userId)}
                                        onChange={() => toggleMember(member.userId)}
                                        disabled={isSubmitting}
                                        className="h-4 w-4"
                                    />
                                    <span className="min-w-0">
                                        <span className="block font-medium">{member.fullName}</span>
                                        <span className="block text-xs text-muted-foreground">{member.email}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </Field>

                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

                <DialogActions
                    onClose={onClose}
                    isSubmitting={isSubmitting}
                    submitLabel="Save Task"
                />
            </form>
        </DialogShell>
    );
}

function AssignTaskDialog({
    task,
    members,
    isMembersLoading,
    isMembersError,
    isSubmitting,
    onClose,
    onSubmit,
}: {
    task: TaskResponse;
    members: ProjectMember[];
    isMembersLoading: boolean;
    isMembersError: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (taskId: string, userIds: string[]) => Promise<void>;
}) {
    const existingIds = task.assignedToIds ?? [];
    const availableMembers = members.filter(
        (member) => !existingIds.includes(member.userId)
    );
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (selectedIds.length === 0) {
            setError("Select at least one new member.");
            return;
        }

        setError(null);

        try {
            await onSubmit(task.id, selectedIds);
        } catch {
            setError("Unable to assign members. Please try again.");
        }
    };

    return (
        <DialogShell title="Assign Members" onClose={onClose} isSubmitting={isSubmitting}>
            <form onSubmit={handleSubmit} className="space-y-5 p-5">
                <p className="text-sm text-muted-foreground">
                    Select project members to assign to <strong>{task.title}</strong>.
                    Existing assignees will remain assigned.
                </p>

                {isMembersLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading project members...
                    </div>
                ) : isMembersError ? (
                    <p role="alert" className="text-sm text-destructive">
                        Unable to load project members.
                    </p>
                ) : availableMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        There are no additional project members to assign.
                    </p>
                ) : (
                    <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-3">
                        {availableMembers.map((member) => (
                            <label key={member.userId} className="flex items-center gap-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(member.userId)}
                                    onChange={() =>
                                        setSelectedIds((current) =>
                                            current.includes(member.userId)
                                                ? current.filter((id) => id !== member.userId)
                                                : [...current, member.userId]
                                        )
                                    }
                                    disabled={isSubmitting}
                                    className="h-4 w-4"
                                />
                                <span className="min-w-0">
                                    <span className="block font-medium">{member.fullName}</span>
                                    <span className="block text-xs text-muted-foreground">{member.email}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                )}

                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

                <DialogActions
                    onClose={onClose}
                    isSubmitting={isSubmitting}
                    submitLabel="Assign Selected"
                    submitDisabled={isMembersLoading || isMembersError || availableMembers.length === 0}
                />
            </form>
        </DialogShell>
    );
}

function EditProjectDialog({
    project,
    isSubmitting,
    onClose,
    onSubmit,
}: {
    project: ProjectResponse;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (name: string, description: string) => Promise<void>;
}) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description ?? "");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Project name is required.");
            return;
        }

        if (trimmedName.length > 150) {
            setError("Project name cannot exceed 150 characters.");
            return;
        }

        setError(null);

        try {
            await onSubmit(trimmedName, description);
        } catch {
            setError("Unable to update project.");
        }
    };

    return (
        <DialogShell title="Edit Project" onClose={onClose} isSubmitting={isSubmitting}>
            <form onSubmit={handleSubmit} className="space-y-5 p-5">
                <Field label="Project name">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={150}
                        required
                        disabled={isSubmitting}
                        className={inputClass}
                    />
                </Field>

                <Field label="Description">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        disabled={isSubmitting}
                        className={inputClass}
                    />
                </Field>

                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

                <DialogActions onClose={onClose} isSubmitting={isSubmitting} submitLabel="Save Changes" />
            </form>
        </DialogShell>
    );
}

function DeleteProjectDialog({
    projectName,
    isDeleting,
    onClose,
    onConfirm,
}: {
    projectName: string;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    return (
        <DialogShell title="Delete Project" onClose={onClose} isSubmitting={isDeleting}>
            <div className="space-y-5 p-5">
                <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete{" "}
                    <strong className="text-foreground">{projectName}</strong>?
                    This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="rounded-md border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground disabled:opacity-50"
                    >
                        {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Delete Project
                    </button>
                </div>
            </div>
        </DialogShell>
    );
}

function DialogShell({
    title,
    children,
    onClose,
    isSubmitting,
}: {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    isSubmitting: boolean;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div className="w-full max-w-lg overflow-hidden rounded-xl border bg-background shadow-xl">
                <div className="flex items-center justify-between border-b p-5">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close dialog"
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function DialogActions({
    onClose,
    isSubmitting,
    submitLabel,
    submitDisabled = false,
}: {
    onClose: () => void;
    isSubmitting: boolean;
    submitLabel: string;
    submitDisabled?: boolean;
}) {
    return (
        <div className="flex justify-end gap-2">
            <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-md border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isSubmitting || submitDisabled}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Saving..." : submitLabel}
            </button>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium">{label}</label>
            {children}
        </div>
    );
}

function ProjectSectionPlaceholder({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function PageMessage({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
            <div className="text-center">
                <FolderKanban className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                <Link
                    href="/dashboard"
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}

const inputClass =
    "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function normalizeStatus(value: string | number): string {
    const text = String(value).trim();

    if (/^\d+$/.test(text)) {
        const label = TASK_STATUS_LABELS[Number(text)];
        if (label) return label.replace(/[\s-]/g, "").replace(/_/g, "").toLowerCase();
    }

    return text.replace(/[\s-]/g, "").replace(/_/g, "").toLowerCase();
}

function normalizePriority(value: string | number): string {
    const text = String(value).trim();

    if (/^\d+$/.test(text)) {
        const label = TASK_PRIORITY_LABELS[Number(text)];
        if (label) return label.toLowerCase();
    }

    return text.replace(/[\s-]/g, "").replace(/_/g, "").toLowerCase();
}

function formatStatusText(value: string | number): string {
    const text = String(value).trim();

    if (/^\d+$/.test(text)) {
        return TASK_STATUS_LABELS[Number(text)] ?? `Unknown (${text})`;
    }

    return formatEnumText(text);
}

function formatPriorityText(value: string | number): string {
    const text = String(value).trim();

    if (/^\d+$/.test(text)) {
        return TASK_PRIORITY_LABELS[Number(text)] ?? `Unknown (${text})`;
    }

    return formatEnumText(text);
}

function formatEnumText(value: string | number): string {
    return String(value)
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string | null | undefined): string {
    if (!value) return "Unknown date";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Unknown date";

    return date.toLocaleDateString();
}

function toDateInputValue(value: string | null | undefined): string {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
