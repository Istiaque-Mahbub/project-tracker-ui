import api from "@/lib/axios";
import { TaskResponse } from "@/types/task";

export async function getTasks(
  tenantId: string,
  projectId: string
): Promise<TaskResponse[]> {
  const response = await api.get<TaskResponse[]>(
    `/api/tenants/${tenantId}/projects/${projectId}/tasks`
  );

  return response.data;
}

export async function getTask(
  tenantId: string,
  projectId: string,
  taskId: string
): Promise<TaskResponse> {
  const response = await api.get<TaskResponse>(
    `/api/tenants/${tenantId}/projects/${projectId}/tasks/${taskId}`
  );

  return response.data;
}