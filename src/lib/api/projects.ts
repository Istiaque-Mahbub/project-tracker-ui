
import api from "@/lib/axios";
import {
  CreateProjectRequest,
  ProjectResponse,
  UpdateProjectRequest,
} from "@/types/project";

export async function getProjects(
  tenantId: string
): Promise<ProjectResponse[]> {
  const response = await api.get<ProjectResponse[]>(
    `/api/tenants/${tenantId}/projects`
  );

  return response.data;
}

export async function getProject(
  tenantId: string,
  projectId: string
): Promise<ProjectResponse> {
  const response = await api.get<ProjectResponse>(
    `/api/tenants/${tenantId}/projects/${projectId}`
  );

  return response.data;
}

export async function createProject(
  tenantId: string,
  data: CreateProjectRequest
): Promise<ProjectResponse> {
  const response = await api.post<ProjectResponse>(
    `/api/tenants/${tenantId}/projects`,
    data
  );

  return response.data;
}

export async function updateProject(
  tenantId: string,
  projectId: string,
  data: UpdateProjectRequest
): Promise<ProjectResponse> {
  const response = await api.put<ProjectResponse>(
    `/api/tenants/${tenantId}/projects/${projectId}`,
    data
  );

  return response.data;
}

export async function deleteProject(
  tenantId: string,
  projectId: string
): Promise<void> {
  await api.delete(
    `/api/tenants/${tenantId}/projects/${projectId}`
  );
}

