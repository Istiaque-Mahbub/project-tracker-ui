
export interface TenantMember {
    userId: string;
    fullName: string;
    email: string;
    role: number;
    joinedAt: string;
}

export interface AddTenantMemberRequest {
    email: string;
    role: number;
}

export interface UpdateTenantMemberRoleRequest {
    role: number;
}

export enum TenantRole {
    Admin = 1,
    ProjectManager = 2,
    Developer = 3,
    Reviewer = 4,
}

export const TENANT_ROLE_OPTIONS = [
    { value: TenantRole.Admin, label: "Admin" },
    { value: TenantRole.ProjectManager, label: "Project Manager" },
    { value: TenantRole.Developer, label: "Developer" },
    { value: TenantRole.Reviewer, label: "Reviewer" },
] as const;
