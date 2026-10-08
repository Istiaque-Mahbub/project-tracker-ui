import api from "@/lib/axios";
import { ActivityLogResponse } from "@/types/activity";

export async function getActivities(
  tenantId: string
): Promise<ActivityLogResponse[]> {
  const response = await api.get<ActivityLogResponse[]>(
    `/api/tenants/${tenantId}/activities`
  );

  return response.data;
}

export async function getProjectActivities(
  tenantId: string,
  projectId: string
): Promise<ActivityLogResponse[]> {
  const response = await api.get<ActivityLogResponse[]>(
    `/api/tenants/${tenantId}/activities/projects/${projectId}`
  );

  return response.data;
}

export async function getTaskActivities(
  tenantId: string,
  projectId: string,
  taskId: string
): Promise<ActivityLogResponse[]> {
  const response = await api.get<ActivityLogResponse[]>(
    `/api/tenants/${tenantId}/activities/projects/${projectId}/tasks/${taskId}`
  );

  return response.data;
}