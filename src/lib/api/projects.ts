import api from "@/lib/axios";
import { ProjectResponse } from "@/types/project";

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