
"use client";

import { useMemo, useState } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    AlertCircle,
    Check,
    Loader2,
    Mail,
    Plus,
    Search,
    Trash2,
    UserPlus,
    Users,
    X,
    ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { getCurrentTenantId } from "@/lib/tenant";

import {
    addTenantMember,
    getTenantMembers,
    removeTenantMember,
    updateTenantMemberRole,
} from "@/lib/api/tenant-members";

import type {
    TenantMember,
    AddTenantMemberRequest,
} from "@/types/tenant-member";

import { TENANT_ROLE_OPTIONS } from "@/types/tenant-member";

function getRoleLabel(role: number): string {
    return (
        TENANT_ROLE_OPTIONS.find(
            (item) => item.value === role
        )?.label ?? "Unknown role"
    );
}

export default function TeamPage() {
    const queryClient = useQueryClient();
    const tenantId = getCurrentTenantId();

    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);

    const [memberToRemove, setMemberToRemove] =
        useState<TenantMember | null>(null);

    const membersQuery = useQuery({
        queryKey: ["tenant-members", tenantId],

        queryFn: () => {
            if (!tenantId) {
                throw new Error("No tenant is selected.");
            }

            return getTenantMembers(tenantId);
        },

        enabled: Boolean(tenantId),
    });

    const refreshMembers = async () => {
        await queryClient.invalidateQueries({
            queryKey: ["tenant-members", tenantId],
        });
    };

    const addMutation = useMutation({
        mutationFn: (data: AddTenantMemberRequest) => {
            if (!tenantId) {
                throw new Error("No tenant is selected.");
            }

            return addTenantMember(tenantId, data);
        },

        onSuccess: async () => {
            await refreshMembers();

            toast.success("Team member added successfully.");
            setIsAddOpen(false);
        },

        onError: (error) => {
            console.error(
                "Failed to add tenant member:",
                error
            );

            toast.error(
                "Could not add member. Check that the user exists and is not already a tenant member."
            );
        },
    });

    const roleMutation = useMutation({
        mutationFn: ({
            userId,
            role,
        }: {
            userId: string;
            role: number;
        }) => {
            if (!tenantId) {
                throw new Error("No tenant is selected.");
            }

            return updateTenantMemberRole(
                tenantId,
                userId,
                { role }
            );
        },

        onSuccess: async () => {
            await refreshMembers();

            toast.success("Member role updated.");
        },

        onError: (error) => {
            console.error(
                "Failed to update member role:",
                error
            );

            toast.error("Could not update member role.");
        },
    });

    const removeMutation = useMutation({
        mutationFn: (userId: string) => {
            if (!tenantId) {
                throw new Error("No tenant is selected.");
            }

            return removeTenantMember(
                tenantId,
                userId
            );
        },

        onSuccess: async () => {
            await refreshMembers();

            toast.success(
                "Member removed from this workspace."
            );

            setMemberToRemove(null);
        },

        onError: (error) => {
            console.error(
                "Failed to remove tenant member:",
                error
            );

            toast.error("Could not remove member.");
        },
    });

    const members = membersQuery.data ?? [];

    const filteredMembers = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return members;
        }

        return members.filter(
            (member) =>
                member.fullName
                    ?.toLowerCase()
                    .includes(term) ||
                member.email
                    ?.toLowerCase()
                    .includes(term) ||
                getRoleLabel(member.role)
                    .toLowerCase()
                    .includes(term)
        );
    }, [members, search]);

    const handleRemoveMember = () => {
        if (!memberToRemove?.userId) {
            toast.error("The member's user ID is missing.");
            return;
        }

        removeMutation.mutate(memberToRemove.userId);
    };

    const handleRoleChange = (
        member: TenantMember,
        roleValue: string
    ) => {
        const role = Number(roleValue);

        const isValidRole = TENANT_ROLE_OPTIONS.some(
            (item) => item.value === role
        );

        if (!member.userId || !isValidRole) {
            toast.error("Invalid member or role.");
            return;
        }

        if (role === member.role) {
            return;
        }

        roleMutation.mutate({
            userId: member.userId,
            role,
        });
    };

    if (!tenantId) {
        return (
            <main className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6">
                <EmptyPanel
                    title="No workspace selected"
                    description="Sign in to an account with a tenant membership to manage its team."
                />
            </main>
        );
    }

    return (
        <main className="min-h-screen space-y-6 bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-8">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-cyan-400">
                        <Users className="h-4 w-4" />
                        Workspace management
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight">
                        Team members
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                        Manage workspace members and their tenant roles.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                    <Plus className="h-4 w-4" />
                    Add member
                </button>
            </header>

            <section className="grid gap-4 sm:grid-cols-2">
                <SummaryCard
                    icon={<Users className="h-5 w-5" />}
                    label="Total members"
                    value={
                        membersQuery.isLoading
                            ? "—"
                            : members.length
                    }
                    description="People in this workspace"
                />

                <SummaryCard
                    icon={<ShieldCheck className="h-5 w-5" />}
                    label="Matching members"
                    value={
                        membersQuery.isLoading
                            ? "—"
                            : filteredMembers.length
                    }
                    description="Members matching your search"
                />
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/10">
                <div className="border-b border-slate-800 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="font-semibold">
                                All members
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                View members, update roles, or remove access.
                            </p>
                        </div>

                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search name, email, or role"
                                aria-label="Search team members"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-cyan-500 sm:w-80"
                            />
                        </div>
                    </div>
                </div>

                {membersQuery.isLoading ? (
                    <div className="flex items-center justify-center gap-3 p-12 text-sm text-slate-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading team members...
                    </div>
                ) : membersQuery.isError ? (
                    <div className="p-8">
                        <EmptyPanel
                            title="Unable to load team members"
                            description="Check the tenant-members API route, your access token, and your permissions."
                            icon={
                                <AlertCircle className="h-6 w-6 text-rose-400" />
                            }
                        />

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() =>
                                    void membersQuery.refetch()
                                }
                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <EmptyPanel
                        title={
                            search
                                ? "No matching members"
                                : "Your team is just getting started"
                        }
                        description={
                            search
                                ? "Try a different search term."
                                : "Add an existing account to give it access to this workspace."
                        }
                    />
                ) : (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4 font-medium">
                                            Member
                                        </th>

                                        <th className="px-5 py-4 font-medium">
                                            Tenant role
                                        </th>

                                        <th className="px-5 py-4 font-medium">
                                            Joined
                                        </th>

                                        <th className="px-5 py-4 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800/80">
                                    {filteredMembers.map((member) => (
                                        <tr
                                            key={member.userId}
                                            className="transition hover:bg-slate-800/30"
                                        >
                                            <td className="px-5 py-4">
                                                <MemberIdentity
                                                    member={member}
                                                />
                                            </td>

                                            <td className="px-5 py-4">
                                                <RoleSelector
                                                    role={member.role}
                                                    disabled={
                                                        roleMutation.isPending
                                                    }
                                                    onChange={(value) =>
                                                        handleRoleChange(
                                                            member,
                                                            value
                                                        )
                                                    }
                                                />
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                                                {formatDate(
                                                    member.joinedAt
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setMemberToRemove(
                                                            member
                                                        )
                                                    }
                                                    aria-label={`Remove ${member.fullName || member.email}`}
                                                    title="Remove member"
                                                    className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-3 p-3 md:hidden">
                            {filteredMembers.map((member) => (
                                <div
                                    key={member.userId}
                                    className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <MemberIdentity
                                            member={member}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMemberToRemove(
                                                    member
                                                )
                                            }
                                            aria-label={`Remove ${member.fullName || member.email}`}
                                            title="Remove member"
                                            className="shrink-0 rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-rose-500/40 hover:text-rose-300"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-4 space-y-3 border-t border-slate-800 pt-3">
                                        <div>
                                            <p className="mb-2 text-xs text-slate-500">
                                                Tenant role
                                            </p>

                                            <RoleSelector
                                                role={member.role}
                                                disabled={
                                                    roleMutation.isPending
                                                }
                                                onChange={(value) =>
                                                    handleRoleChange(
                                                        member,
                                                        value
                                                    )
                                                }
                                            />
                                        </div>

                                        <p className="text-xs text-slate-500">
                                            Joined:{" "}
                                            {formatDate(
                                                member.joinedAt
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <footer className="border-t border-slate-800 px-5 py-3 text-xs text-slate-500">
                    Showing {filteredMembers.length} of{" "}
                    {members.length} members
                </footer>
            </section>

            {isAddOpen && (
                <AddMemberDialog
                    isSubmitting={addMutation.isPending}
                    onClose={() => setIsAddOpen(false)}
                    onSubmit={(data) =>
                        addMutation.mutate(data)
                    }
                />
            )}

            {memberToRemove && (
                <RemoveMemberDialog
                    member={memberToRemove}
                    isSubmitting={removeMutation.isPending}
                    onClose={() => setMemberToRemove(null)}
                    onConfirm={handleRemoveMember}
                />
            )}
        </main>
    );
}

function RoleSelector({
    role,
    disabled,
    onChange,
}: {
    role: number;
    disabled: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <select
            value={String(role)}
            onChange={(event) =>
                onChange(event.target.value)
            }
            disabled={disabled}
            aria-label="Tenant role"
            className="w-full min-w-36 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {TENANT_ROLE_OPTIONS.map((item) => (
                <option
                    key={item.value}
                    value={String(item.value)}
                >
                    {item.label}
                </option>
            ))}
        </select>
    );
}

function formatDate(
    value: string | undefined
): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString();
}

function SummaryCard({
    icon,
    label,
    value,
    description,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-slate-400">
                        {label}
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-400">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function getInitials(
    member: TenantMember
): string {
    const name = member.fullName?.trim();

    if (!name) {
        return member.email?.[0]?.toUpperCase() ?? "U";
    }

    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function MemberIdentity({
    member,
}: {
    member: TenantMember;
}) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-sm font-bold text-cyan-300 ring-1 ring-cyan-500/20">
                {getInitials(member)}
            </div>

            <div className="min-w-0">
                <p className="truncate font-semibold text-slate-100">
                    {member.fullName || "Unnamed member"}
                </p>

                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-400">
                    <Mail className="h-3 w-3 shrink-0" />
                    {member.email}
                </p>
            </div>
        </div>
    );
}

function AddMemberDialog({
    isSubmitting,
    onClose,
    onSubmit,
}: {
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (
        data: AddTenantMemberRequest
    ) => void;
}) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("3");
    const [formError, setFormError] = useState("");

    function submit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const normalizedEmail = email
            .trim()
            .toLowerCase();

        const selectedRole = Number(role);

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                normalizedEmail
            )
        ) {
            setFormError(
                "Enter a valid email address."
            );
            return;
        }

        const isValidRole = TENANT_ROLE_OPTIONS.some(
            (item) => item.value === selectedRole
        );

        if (!isValidRole) {
            setFormError("Select a valid tenant role.");
            return;
        }

        setFormError("");

        onSubmit({
            email: normalizedEmail,
            role: selectedRole,
        });
    }

    return (
        <Modal onClose={onClose}>
            <div className="flex items-start justify-between border-b border-slate-800 p-5">
                <div>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                        <UserPlus className="h-5 w-5" />
                    </div>

                    <h2 className="text-lg font-semibold">
                        Add team member
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Add an existing account and assign its tenant role.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    aria-label="Close dialog"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 disabled:opacity-50"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <form
                onSubmit={submit}
                className="space-y-5 p-5"
            >
                <div>
                    <label
                        htmlFor="member-email"
                        className="mb-2 block text-sm font-medium"
                    >
                        Email address
                    </label>

                    <input
                        id="member-email"
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        disabled={isSubmitting}
                        placeholder="teammate@example.com"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 disabled:opacity-50"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                        The account must already exist in your system.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="member-role"
                        className="mb-2 block text-sm font-medium"
                    >
                        Tenant role
                    </label>

                    <select
                        id="member-role"
                        value={role}
                        onChange={(event) =>
                            setRole(event.target.value)
                        }
                        disabled={isSubmitting}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 disabled:opacity-50"
                    >
                        {TENANT_ROLE_OPTIONS.map((item) => (
                            <option
                                key={item.value}
                                value={String(item.value)}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                {formError && (
                    <p className="text-sm text-rose-300">
                        {formError}
                    </p>
                )}

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm transition hover:bg-slate-800 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}

                        {isSubmitting
                            ? "Adding..."
                            : "Add member"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function RemoveMemberDialog({
    member,
    isSubmitting,
    onClose,
    onConfirm,
}: {
    member: TenantMember;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Modal onClose={onClose}>
            <div className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                    <Trash2 className="h-5 w-5" />
                </div>

                <h2 className="text-lg font-semibold">
                    Remove team member?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                    Remove{" "}
                    <span className="font-medium text-slate-100">
                        {member.fullName || member.email}
                    </span>{" "}
                    from this workspace? This removes their tenant
                    membership, not their user account.
                </p>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm transition hover:bg-slate-800 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={
                            isSubmitting || !member.userId
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}

                        {isSubmitting
                            ? "Removing..."
                            : "Remove member"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function Modal({
    children,
    onClose,
}: {
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
            >
                {children}
            </div>
        </div>
    );
}

function EmptyPanel({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-10 text-center">
            <div className="mx-auto mb-3 flex justify-center">
                {icon ?? (
                    <Users className="h-7 w-7 text-slate-500" />
                )}
            </div>

            <h2 className="font-semibold">{title}</h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                {description}
            </p>
        </div>
    );
}
