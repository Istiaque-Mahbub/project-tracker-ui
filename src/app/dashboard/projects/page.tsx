
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    FolderKanban,
    Layers3,
    Loader2,
    Plus,
    RefreshCw,
    Search,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { getAuth } from "@/lib/auth";
import { getCurrentTenantId } from "@/lib/tenant";
import { useProjects } from "@/hooks/use-projects";
import { ProjectResponse } from "@/types/project";


function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}


export default function ProjectsPage() {
    const router = useRouter();

    const [tenantId, setTenantId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    useEffect(() => {
        const auth = getAuth();

        if (!auth) {
            router.replace("/login");
            return;
        }

        setTenantId(getCurrentTenantId());
    }, [router]);


    const {
        projects,
        isLoading,
        isError,
        error,
        createProject,
        isCreating,
        refetch,
    } = useProjects(tenantId);


    const filteredProjects = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return projects;
        }

        return projects.filter((project) => {
            const name = project.name.toLowerCase();
            const description =
                project.description?.toLowerCase() ?? "";

            return (
                name.includes(query) ||
                description.includes(query)
            );
        });
    }, [projects, searchQuery]);


    const handleCreateProject = async (data: {
        name: string;
        description: string;
    }) => {
        try {
            await createProject({
                name: data.name.trim(),
                description: data.description.trim() || null,
            });

            toast.success("Project created successfully.");

            setIsCreateDialogOpen(false);
        } catch (error) {
            console.error("Create project failed:", error);

            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to create project.";

            toast.error(message);
        }
    };


    const clearSearch = () => {
        setSearchQuery("");
    };


    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <div className="mb-5">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </div>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                                    <FolderKanban className="h-5 w-5 text-blue-400" />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                                        Workspace
                                    </p>

                                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                        Projects
                                    </h1>
                                </div>
                            </div>

                            <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                                View and manage the projects available in your
                                workspace.
                            </p>
                        </div>


                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                            {!isLoading && !isError && (
                                <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                                    <Layers3 className="h-4 w-4 text-slate-400" />

                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Total Projects
                                        </p>

                                        <p className="text-lg font-semibold text-white">
                                            {projects.length}
                                        </p>
                                    </div>
                                </div>
                            )}


                            <button
                                type="button"
                                onClick={() => setIsCreateDialogOpen(true)}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 active:scale-[0.98]"
                            >
                                <Plus className="h-4 w-4" />
                                New Project
                            </button>

                        </div>
                    </div>
                </div>


                {/* Search */}
                {!isLoading &&
                    !isError &&
                    projects.length > 0 && (
                        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div className="relative w-full sm:max-w-md">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(event) =>
                                            setSearchQuery(event.target.value)
                                        }
                                        placeholder="Search projects..."
                                        className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                                    />

                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            aria-label="Clear search"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>


                                <div className="text-sm text-slate-500">
                                    Showing{" "}
                                    <span className="font-semibold text-slate-300">
                                        {filteredProjects.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-slate-300">
                                        {projects.length}
                                    </span>{" "}
                                    projects
                                </div>

                            </div>
                        </div>
                    )}


                {/* Loading */}
                {isLoading && (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <ProjectSkeleton key={index} />
                        ))}
                    </div>
                )}


                {/* Error */}
                {!isLoading && isError && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
                        <div className="mx-auto flex max-w-md flex-col items-center text-center">

                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                                <AlertCircle className="h-6 w-6 text-red-400" />
                            </div>

                            <h2 className="text-lg font-semibold text-white">
                                Unable to load projects
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Something went wrong while loading your projects.
                                Please try again.
                            </p>

                            {error instanceof Error && error.message && (
                                <p className="mt-3 max-w-full break-words text-xs text-slate-600">
                                    {error.message}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:border-slate-600 hover:bg-slate-800"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </button>

                        </div>
                    </div>
                )}


                {/* No projects */}
                {!isLoading &&
                    !isError &&
                    projects.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16">
                            <div className="mx-auto flex max-w-md flex-col items-center text-center">

                                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                                    <FolderKanban className="h-7 w-7 text-blue-400" />
                                </div>

                                <h2 className="text-xl font-semibold text-white">
                                    No projects yet
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    There are currently no projects available in this
                                    workspace.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setIsCreateDialogOpen(true)}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Your First Project
                                </button>

                            </div>
                        </div>
                    )}


                {/* Search empty */}
                {!isLoading &&
                    !isError &&
                    projects.length > 0 &&
                    filteredProjects.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-16">
                            <div className="mx-auto flex max-w-md flex-col items-center text-center">

                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
                                    <Search className="h-6 w-6 text-slate-500" />
                                </div>

                                <h2 className="text-lg font-semibold text-white">
                                    No matching projects
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    No projects match{" "}
                                    <span className="font-medium text-slate-300">
                                        "{searchQuery}"
                                    </span>
                                    .
                                </p>

                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:border-slate-600 hover:bg-slate-800"
                                >
                                    <X className="h-4 w-4" />
                                    Clear Search
                                </button>

                            </div>
                        </div>
                    )}


                {/* Projects */}
                {!isLoading &&
                    !isError &&
                    filteredProjects.length > 0 && (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                        </div>
                    )}

            </div>


            {/* Create Project Dialog */}
            {isCreateDialogOpen && (
                <CreateProjectDialog
                    isCreating={isCreating}
                    onClose={() => {
                        if (!isCreating) {
                            setIsCreateDialogOpen(false);
                        }
                    }}
                    onSubmit={handleCreateProject}
                />
            )}

        </main>
    );
}


/* -------------------------------------------------------------------------- */
/* Project Card                                                               */
/* -------------------------------------------------------------------------- */

interface ProjectCardProps {
    project: {
        id: string;
        name: string;
        description: string | null;
        ownerId: string;
        createAt: string;
        updateAt: string | null;
    };
}



function ProjectCard({
    project,
}: {
    project: ProjectResponse;
}) {
    return (
        <Link
            href={`/dashboard/projects/${project.id}`}
            className="group block rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FolderKanban className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                        <h3 className="truncate font-semibold transition-colors group-hover:text-primary">
                            {project.name}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Project
                        </p>
                    </div>
                </div>
            </div>

            <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                {project.description || "No description provided."}
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />

                <span>
                    Created{" "}
                    {new Date(project.createAt).toLocaleDateString()}
                </span>
            </div>
        </Link>
    );
}




/* -------------------------------------------------------------------------- */
/* Create Project Dialog                                                      */
/* -------------------------------------------------------------------------- */

interface CreateProjectDialogProps {
    isCreating: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        description: string;
    }) => Promise<void>;
}


function CreateProjectDialog({
    isCreating,
    onClose,
    onSubmit,
}: CreateProjectDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [nameError, setNameError] = useState("");


    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setNameError("Project name is required.");
            return;
        }

        if (trimmedName.length > 150) {
            setNameError(
                "Project name must be 150 characters or less."
            );
            return;
        }

        setNameError("");

        await onSubmit({
            name: trimmedName,
            description,
        });
    };


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isCreating) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50">

                {/* Dialog Header */}
                <div className="flex items-start justify-between border-b border-slate-800 px-6 py-5">

                    <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                            <Plus className="h-5 w-5 text-blue-400" />
                        </div>

                        <h2 className="text-xl font-semibold text-white">
                            Create New Project
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Add a new project to your workspace.
                        </p>
                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isCreating}
                        aria-label="Close dialog"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>

                </div>


                {/* Form */}
                <form onSubmit={handleSubmit}>

                    <div className="space-y-5 px-6 py-6">

                        {/* Name */}
                        <div>
                            <label
                                htmlFor="project-name"
                                className="mb-2 block text-sm font-medium text-slate-200"
                            >
                                Project Name
                            </label>

                            <input
                                id="project-name"
                                type="text"
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);

                                    if (nameError) {
                                        setNameError("");
                                    }
                                }}
                                placeholder="e.g. Developer Portal"
                                maxLength={150}
                                autoFocus
                                disabled={isCreating}
                                className={`h-11 w-full rounded-xl border bg-slate-950 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60 ${nameError
                                    ? "border-red-500/50 focus:border-red-500"
                                    : "border-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                                    }`}
                            />

                            <div className="mt-2 flex items-center justify-between">
                                {nameError ? (
                                    <p className="text-xs text-red-400">
                                        {nameError}
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-600">
                                        Choose a clear name for your project.
                                    </p>
                                )}

                                <span className="text-xs text-slate-600">
                                    {name.length}/150
                                </span>
                            </div>
                        </div>


                        {/* Description */}
                        <div>
                            <label
                                htmlFor="project-description"
                                className="mb-2 block text-sm font-medium text-slate-200"
                            >
                                Description
                                <span className="ml-2 font-normal text-slate-600">
                                    Optional
                                </span>
                            </label>

                            <textarea
                                id="project-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                                placeholder="Describe what this project is about..."
                                rows={5}
                                disabled={isCreating}
                                className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                    </div>


                    {/* Footer */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/40 px-6 py-4 sm:flex-row sm:justify-end">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isCreating}
                            className="h-11 rounded-xl border border-slate-700 bg-slate-900 px-5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={isCreating}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Create Project
                                </>
                            )}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}


/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

function ProjectSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5">

            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">

                    <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-800" />

                    <div className="space-y-2">
                        <div className="h-2.5 w-16 animate-pulse rounded bg-slate-800" />
                        <div className="h-5 w-32 animate-pulse rounded bg-slate-800" />
                    </div>

                </div>

                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-800" />
            </div>


            <div className="mt-6 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-slate-800" />
                <div className="h-3 w-11/12 animate-pulse rounded bg-slate-800" />
                <div className="h-3 w-8/12 animate-pulse rounded bg-slate-800" />
            </div>


            <div className="my-5 h-px bg-slate-800" />


            <div className="space-y-4">
                <div className="flex justify-between">
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />
                </div>

                <div className="flex justify-between">
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-800" />
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
                </div>
            </div>

        </div>
    );
}

