"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CalendarDays,
    FolderKanban,
    Loader2,
    Pencil,
    RefreshCw,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getAuth } from "@/lib/auth";
import { getCurrentTenantId } from "@/lib/tenant";
import {
    getProject,
} from "@/lib/api/projects";
import { useProjects } from "@/hooks/use-projects";
import { ProjectResponse } from "@/types/project";

export default function ProjectDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();

    const projectId = params.projectId as string;
    const tenantId = getCurrentTenantId();

    const [isEditDialogOpen, setIsEditDialogOpen] =
        useState(false);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
        useState(false);

    useEffect(() => {
        const auth = getAuth();

        if (!auth) {
            router.replace("/login");
        }
    }, [router]);

    const projectQuery = useQuery<ProjectResponse>({
        queryKey: ["project", tenantId, projectId],

        queryFn: () => {
            if (!tenantId) {
                return Promise.reject(
                    new Error("No tenant selected.")
                );
            }

            return getProject(
                tenantId,
                projectId
            );
        },

        enabled:
            Boolean(tenantId) &&
            Boolean(projectId),
    });

    const {
        updateProject,
        deleteProject,
        isUpdating,
        isDeleting,
    } = useProjects(tenantId);

    const handleUpdateProject = async (
        name: string,
        description: string
    ) => {
        if (!projectQuery.data) {
            return;
        }

        try {
            await updateProject({
                projectId,
                data: {
                    name,
                    description:
                        description.trim() || null,
                },
            });

            await queryClient.invalidateQueries({
                queryKey: [
                    "project",
                    tenantId,
                    projectId,
                ],
            });

            toast.success(
                "Project updated successfully."
            );

            setIsEditDialogOpen(false);

            await projectQuery.refetch();
        } catch (error) {
            console.error(
                "Failed to update project:",
                error
            );

            toast.error(
                "Failed to update project."
            );
        }
    };

    const handleDeleteProject = async () => {
        try {
            await deleteProject(projectId);

            toast.success(
                "Project deleted successfully."
            );

            setIsDeleteDialogOpen(false);

            await queryClient.invalidateQueries({
                queryKey: [
                    "projects",
                    tenantId,
                ],
            });

            router.push(
                "/dashboard/projects"
            );
        } catch (error) {
            console.error(
                "Failed to delete project:",
                error
            );

            toast.error(
                "Failed to delete project."
            );
        }
    };

    if (!tenantId) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <FolderKanban className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

                    <h2 className="text-lg font-semibold">
                        No tenant available
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Please log in again to continue.
                    </p>
                </div>
            </div>
        );
    }

    if (projectQuery.isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading project...</span>
                </div>
            </div>
        );
    }

    if (projectQuery.isError) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                            <FolderKanban className="h-5 w-5" />
                        </div>

                        <div className="flex-1">
                            <h2 className="font-semibold">
                                Unable to load project
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                The project could not be loaded.
                                It may have been deleted or you
                                may not have access to it.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        projectQuery.refetch()
                                    }
                                    className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </button>

                                <Link
                                    href="/dashboard/projects"
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Projects
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const project = projectQuery.data;

    if (!project) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <div className="rounded-xl border bg-card p-8 text-center">
                    <FolderKanban className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

                    <h2 className="text-lg font-semibold">
                        Project not found
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        The requested project could not be found.
                    </p>

                    <Link
                        href="/dashboard/projects"
                        className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <main className="space-y-6 p-6">
                {/* Back */}
                <div>
                    <Link
                        href="/dashboard/projects"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Projects
                    </Link>
                </div>

                {/* Project Header */}
                <section className="rounded-xl border bg-card p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FolderKanban className="h-7 w-7" />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {project.name}
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    {project.description ||
                                        "No description provided for this project."}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsEditDialogOpen(true)
                                }
                                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsDeleteDialogOpen(true)
                                }
                                className="inline-flex items-center gap-2 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-6 flex flex-wrap gap-4 border-t pt-5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />

                            <span>
                                Created{" "}
                                {new Date(
                                    project.createAt
                                ).toLocaleDateString()}
                            </span>
                        </div>

                        {project.updateAt && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <RefreshCw className="h-4 w-4" />

                                <span>
                                    Updated{" "}
                                    {new Date(
                                        project.updateAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Future project sections */}
                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <ProjectSectionPlaceholder
                        title="Tasks"
                        description="Project tasks will appear here."
                    />

                    <ProjectSectionPlaceholder
                        title="Members"
                        description="Project members will appear here."
                    />

                    <ProjectSectionPlaceholder
                        title="Milestones"
                        description="Project milestones will appear here."
                    />

                    <ProjectSectionPlaceholder
                        title="Labels"
                        description="Project labels will appear here."
                    />

                    <ProjectSectionPlaceholder
                        title="Comments"
                        description="Project comments will appear here."
                    />

                    <ProjectSectionPlaceholder
                        title="Activity"
                        description="Project activity will appear here."
                    />
                </section>
            </main>

            {/* Edit Dialog */}
            {isEditDialogOpen && (
                <EditProjectDialog
                    project={project}
                    isSubmitting={isUpdating}
                    onClose={() =>
                        setIsEditDialogOpen(false)
                    }
                    onSubmit={handleUpdateProject}
                />
            )}

            {/* Delete Dialog */}
            {isDeleteDialogOpen && (
                <DeleteProjectDialog
                    projectName={project.name}
                    isDeleting={isDeleting}
                    onClose={() =>
                        setIsDeleteDialogOpen(false)
                    }
                    onConfirm={handleDeleteProject}
                />
            )}
        </>
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
    onSubmit: (
        name: string,
        description: string
    ) => Promise<void>;
}) {
    const [name, setName] = useState(
        project.name
    );

    const [description, setDescription] =
        useState(
            project.description ?? ""
        );

    const [error, setError] =
        useState<string | null>(null);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError(
                "Project name is required."
            );
            return;
        }

        if (trimmedName.length > 150) {
            setError(
                "Project name cannot exceed 150 characters."
            );
            return;
        }

        setError(null);

        await onSubmit(
            trimmedName,
            description
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl border bg-background shadow-xl">
                <div className="flex items-center justify-between border-b p-5">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Edit Project
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Update your project information.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-5"
                >
                    <div>
                        <label
                            htmlFor="project-name"
                            className="mb-2 block text-sm font-medium"
                        >
                            Project Name
                        </label>

                        <input
                            id="project-name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            disabled={isSubmitting}
                            maxLength={150}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Enter project name"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="project-description"
                            className="mb-2 block text-sm font-medium"
                        >
                            Description
                        </label>

                        <textarea
                            id="project-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            disabled={isSubmitting}
                            rows={5}
                            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="Describe your project..."
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {isSubmitting
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border bg-background shadow-xl">
                <div className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <Trash2 className="h-5 w-5" />
                    </div>

                    <h2 className="text-lg font-semibold">
                        Delete Project
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <span className="font-medium text-foreground">
                            "{projectName}"
                        </span>
                        ?
                        <br />
                        This action cannot be undone.
                    </p>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isDeleting && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {isDeleting
                                ? "Deleting..."
                                : "Delete Project"}
                        </button>
                    </div>
                </div>
            </div>
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
            <h2 className="font-semibold">
                {title}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

