
import api from "@/lib/axios";

import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignTaskRequest,
  TaskResponse,
} from "@/types/task";

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

export async function createTask(
  tenantId: string,
  projectId: string,
  data: CreateTaskRequest
): Promise<TaskResponse> {
  const response = await api.post<TaskResponse>(
    `/api/tenants/${tenantId}/projects/${projectId}/tasks`,
    data
  );

  return response.data;
}

export async function updateTask(
  tenantId: string,
  projectId: string,
  taskId: string,
  data: UpdateTaskRequest
): Promise<TaskResponse> {
  const response = await api.put<TaskResponse>(
    `/api/tenants/${tenantId}/projects/${projectId}/tasks/${taskId}`,
    data
  );

  return response.data;
}

export async function assignTask(
  tenantId: string,
  projectId: string,
  taskId: string,
  data: AssignTaskRequest
): Promise<TaskResponse> {
  const response = await api.put<TaskResponse>(
    `/api/tenants/${tenantId}/projects/${projectId}/tasks/${taskId}/assign`,
    data
  );

  return response.data;
}



export async function deleteTask(
  tenantId: string,
  projectId: string,
  taskId: string
): Promise<void> {
  await api.delete(
    `/api/tenants/${tenantId}/projects/${projectId}/tasks/${taskId}`
  );
}
