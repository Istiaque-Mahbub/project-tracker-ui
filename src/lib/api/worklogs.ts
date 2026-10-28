import type {
  Worklog,
  CreateWorklogRequest,
  UpdateWorklogRequest,
} from "@/types/worklog";
import api from "../axios";

const getWorklogsUrl = (
  tenantId: string,
  projectId: string,
  taskId: string
) =>
  `/api/tenants/${tenantId}/projects/${projectId}/tasks/${taskId}/worklogs`;

export async function getWorklogs(
  tenantId: string,
  projectId: string,
  taskId: string
): Promise<Worklog[]> {
  const response = await api.get<Worklog[]>(
    getWorklogsUrl(tenantId, projectId, taskId)
  );

  return response.data;
}

export async function getWorklogById(
  tenantId: string,
  projectId: string,
  taskId: string,
  workLogId: string
): Promise<Worklog> {
  const response = await api.get<Worklog>(
    `${getWorklogsUrl(tenantId, projectId, taskId)}/${workLogId}`
  );

  return response.data;
}

export async function createWorklog(
  tenantId: string,
  projectId: string,
  taskId: string,
  data: CreateWorklogRequest
): Promise<Worklog> {
  const response = await api.post<Worklog>(
    getWorklogsUrl(tenantId, projectId, taskId),
    data
  );

  return response.data;
}

export async function updateWorklog(
  tenantId: string,
  projectId: string,
  taskId: string,
  workLogId: string,
  data: UpdateWorklogRequest
): Promise<Worklog> {
  const response = await api.put<Worklog>(
    `${getWorklogsUrl(tenantId, projectId, taskId)}/${workLogId}`,
    data
  );

  return response.data;
}

export async function deleteWorklog(
  tenantId: string,
  projectId: string,
  taskId: string,
  workLogId: string
): Promise<void> {
  await api.delete(
    `${getWorklogsUrl(tenantId, projectId, taskId)}/${workLogId}`
  );
}
