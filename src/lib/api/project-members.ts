

import type {
  ProjectMember,
  TenantMember,
  AddProjectMemberRequest,
} from "@/types/project-member";
import api from "../axios";

const projectMembersUrl = (tenantId: string, projectId: string) =>
  `/api/tenants/${tenantId}/projects/${projectId}/members`;

export async function getProjectMembers(
  tenantId: string,
  projectId: string
): Promise<ProjectMember[]> {
  const response = await api.get(
    projectMembersUrl(tenantId, projectId)
  );
  return response.data;
}

export async function getTenantMembers(
  tenantId: string
): Promise<TenantMember[]> {
  const response = await api.get(
    `/api/tenants/${tenantId}/members`
  );
  return response.data;
}

export async function addProjectMember(
  tenantId: string,
  projectId: string,
  data: AddProjectMemberRequest
): Promise<void> {
  await api.post(projectMembersUrl(tenantId, projectId), data);
}

export async function removeProjectMember(
  tenantId: string,
  projectId: string,
  userId: string
): Promise<void> {
  await api.delete(
    `${projectMembersUrl(tenantId, projectId)}/${userId}`
  );
}

export async function addTenantMember(
  tenantId: string,
  data: {
    email: string;
    role: string;
  }
): Promise<void> {
  await api.post(
    `/api/tenants/${tenantId}/members`,
    data
  );
}

export async function removeTenantMember(
  tenantId: string,
  userId: string
): Promise<void> {
  await api.delete(
    `/api/tenants/${tenantId}/members/${userId}`
  );
}
