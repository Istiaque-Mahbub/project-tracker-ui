import type {
  LabelResponse,
  CreateLabelRequest,
  UpdateLabelRequest,
  TaskLabelResponse,
} from "@/types/label";
import api from "../axios";

const labelsUrl = (tenantId: string, projectId: string) =>
  `/api/tenants/${tenantId}/projects/${projectId}/labels`;

export async function getLabels(
  tenantId: string,
  projectId: string
): Promise<LabelResponse[]> {
  const response = await api.get(labelsUrl(tenantId, projectId));
  return response.data;
}

export async function createLabel(
  tenantId: string,
  projectId: string,
  data: CreateLabelRequest
): Promise<LabelResponse> {
  const response = await api.post(
    labelsUrl(tenantId, projectId),
    data
  );
  return response.data;
}

export async function updateLabel(
  tenantId: string,
  projectId: string,
  labelId: string,
  data: UpdateLabelRequest
): Promise<LabelResponse> {
  const response = await api.put(
    `${labelsUrl(tenantId, projectId)}/${labelId}`,
    data
  );
  return response.data;
}

export async function deleteLabel(
  tenantId: string,
  projectId: string,
  labelId: string
): Promise<void> {
  await api.delete(`${labelsUrl(tenantId, projectId)}/${labelId}`);
}

export async function getTaskLabels(
  tenantId: string,
  projectId: string,
  taskId: string
): Promise<TaskLabelResponse[]> {
  const response = await api.get(
    `${labelsUrl(tenantId, projectId)}/tasks/${taskId}`
  );
  return response.data;
}

export async function addLabelToTask(
  tenantId: string,
  projectId: string,
  taskId: string,
  labelId: string
): Promise<TaskLabelResponse> {
  const response = await api.post(
    `${labelsUrl(tenantId, projectId)}/tasks/${taskId}/${labelId}`
  );
  return response.data;
}

export async function removeLabelFromTask(
  tenantId: string,
  projectId: string,
  taskId: string,
  labelId: string
): Promise<void> {
  await api.delete(
    `${labelsUrl(tenantId, projectId)}/tasks/${taskId}/${labelId}`
  );
}
