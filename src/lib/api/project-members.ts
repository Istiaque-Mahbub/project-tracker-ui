
import api from "@/lib/axios";
import type { ProjectMember } from "@/types/task";

export async function getProjectMembers(
  tenantId: string,
  projectId: string
): Promise<ProjectMember[]> {
  const response = await api.get<ProjectMember[]>(
    `/api/tenants/${tenantId}/projects/${projectId}/members`
  );

  return response.data;
}
