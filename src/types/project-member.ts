
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  fullName: string;
  email: string;
}

export interface TenantMember {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
}

export interface AddProjectMemberRequest {
  userId: string;
}

