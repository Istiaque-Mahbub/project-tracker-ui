"use client";

import { useState } from "react";
import {
    Loader2,
    Plus,
    Trash2,
    Users,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
    addProjectMember,
    getProjectMembers,
    getTenantMembers,
    removeProjectMember,
} from "@/lib/api/project-members";

import type {
    ProjectMember,
    TenantMember,
} from "@/types/project-member";

interface MembersSectionProps {
    tenantId: string;
    projectId: string;
}

function getTenantUserId(member: TenantMember): string {
    return member.userId || member.id;
}

export default function MembersSection({
    tenantId,
    projectId,
}: MembersSectionProps) {
    const queryClient = useQueryClient();

    const membersKey = ["project-members", tenantId, projectId];
    const tenantMembersKey = ["tenant-members", tenantId];

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [removingMember, setRemovingMember] =
        useState<ProjectMember | null>(null);

    const membersQuery = useQuery({
        queryKey: membersKey,
        queryFn: () => getProjectMembers(tenantId, projectId),
        enabled: Boolean(tenantId && projectId),
    });

    const tenantMembersQuery = useQuery({
        queryKey: tenantMembersKey,
        queryFn: () => getTenantMembers(tenantId),
        enabled: Boolean(tenantId && isAddOpen),
    });

    const refreshMembers = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: membersKey }),
            queryClient.invalidateQueries({ queryKey: tenantMembersKey }),
        ]);
    };

    const addMutation = useMutation({
        mutationFn: (userId: string) =>
            addProjectMember(tenantId, projectId, { userId }),
        onSuccess: async () => {
            await refreshMembers();
            setIsAddOpen(false);
            setSelectedUserId("");
            toast.success("Project member added successfully.");
        },
        onError: () => {
            toast.error("Could not add member. They may already belong to this project.");
        },
    });

    const removeMutation = useMutation({
        mutationFn: (userId: string) =>
            removeProjectMember(tenantId, projectId, userId),
        onSuccess: async () => {
            await refreshMembers();
            setRemovingMember(null);
            toast.success("Project member removed successfully.");
        },
        onError: () => toast.error("Failed to remove project member."),
    });

    const members = membersQuery.data ?? [];
    const tenantMembers = tenantMembersQuery.data ?? [];

    const existingUserIds = new Set(members.map((member) => member.userId));

    const availableMembers = tenantMembers.filter(
        (member) => !existingUserIds.has(getTenantUserId(member))
    );

    return (
        <section className="rounded-xl border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
                <div>
                    <h2 className="text-lg font-semibold">Members</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage the people working on this project.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    Add member
                </button>
            </div>

            <div className="p-5">
                {membersQuery.isPending ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading members...
                    </div>
                ) : membersQuery.isError ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-destructive">
                            Could not load project members.
                        </p>
                        <button
                            type="button"
                            onClick={() => membersQuery.refetch()}
                            className="mt-2 text-sm underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : members.length === 0 ? (
                    <div className="py-10 text-center">
                        <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-3 font-medium">No project members yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add tenant members to collaborate on this project.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between gap-3 rounded-lg border p-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                                        {member.fullName?.charAt(0)?.toUpperCase() || "U"}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {member.fullName}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {member.email}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setRemovingMember(member)}
                                    aria-label={`Remove ${member.fullName}`}
                                    className="rounded-md border border-destructive/30 p-2 text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-member-title"
                        className="w-full max-w-md rounded-xl border bg-background shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b p-5">
                            <h3 id="add-member-title" className="font-semibold">
                                Add project member
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAddOpen(false);
                                    setSelectedUserId("");
                                }}
                                disabled={addMutation.isPending}
                                aria-label="Close"
                                className="rounded-md p-1 hover:bg-muted"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 p-5">
                            {tenantMembersQuery.isPending ? (
                                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading tenant members...
                                </div>
                            ) : tenantMembersQuery.isError ? (
                                <div>
                                    <p className="text-sm text-destructive">
                                        Could not load tenant members.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => tenantMembersQuery.refetch()}
                                        className="mt-2 text-sm underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : availableMembers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No available tenant members to add. They may already be
                                    assigned to this project, or the tenant has no members.
                                </p>
                            ) : (
                                <div>
                                    <label
                                        htmlFor="tenant-member"
                                        className="mb-1 block text-sm font-medium"
                                    >
                                        Select tenant member
                                    </label>

                                    <select
                                        id="tenant-member"
                                        value={selectedUserId}
                                        onChange={(event) => setSelectedUserId(event.target.value)}
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Choose a member...</option>
                                        {availableMembers.map((member) => (
                                            <option
                                                key={getTenantUserId(member)}
                                                value={getTenantUserId(member)}
                                            >
                                                {member.fullName} ({member.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    disabled={addMutation.isPending}
                                    onClick={() => {
                                        setIsAddOpen(false);
                                        setSelectedUserId("");
                                    }}
                                    className="rounded-md border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        !selectedUserId ||
                                        addMutation.isPending ||
                                        tenantMembersQuery.isPending ||
                                        tenantMembersQuery.isError
                                    }
                                    onClick={() => addMutation.mutate(selectedUserId)}
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
                                >
                                    {addMutation.isPending && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {addMutation.isPending ? "Adding..." : "Add member"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {removingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="remove-member-title"
                        className="w-full max-w-md rounded-xl border bg-background shadow-xl"
                    >
                        <div className="p-5">
                            <h3 id="remove-member-title" className="font-semibold">
                                Remove project member?
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Remove{" "}
                                <strong className="text-foreground">
                                    {removingMember.fullName}
                                </strong>{" "}
                                from this project? Their tenant membership will remain
                                unchanged.
                            </p>

                            <div className="mt-5 flex justify-end gap-2">
                                <button
                                    type="button"
                                    disabled={removeMutation.isPending}
                                    onClick={() => setRemovingMember(null)}
                                    className="rounded-md border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    disabled={removeMutation.isPending}
                                    onClick={() => removeMutation.mutate(removingMember.userId)}
                                    className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground disabled:opacity-50"
                                >
                                    {removeMutation.isPending && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {removeMutation.isPending ? "Removing..." : "Remove"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
