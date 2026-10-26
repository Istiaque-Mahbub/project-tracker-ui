import type {
  MilestoneResponse,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
} from "@/types/milestone";
import api from "../axios";

const milestoneUrl = (tenantId: string, projectId: string) =>
  `/api/tenants/${tenantId}/projects/${projectId}/milestones`;

export async function getMilestones(
  tenantId: string,
  projectId: string
): Promise<MilestoneResponse[]> {
  const response = await api.get(milestoneUrl(tenantId, projectId));
  return response.data;
}

export async function createMilestone(
  tenantId: string,
  projectId: string,
  data: CreateMilestoneRequest
): Promise<MilestoneResponse> {
  const response = await api.post(
    milestoneUrl(tenantId, projectId),
    data
  );
  return response.data;
}

export async function updateMilestone(
  tenantId: string,
  projectId: string,
  milestoneId: string,
  data: UpdateMilestoneRequest
): Promise<MilestoneResponse> {
  const response = await api.put(
    `${milestoneUrl(tenantId, projectId)}/${milestoneId}`,
    data
  );
  return response.data;
}

export async function deleteMilestone(
  tenantId: string,
  projectId: string,
  milestoneId: string
): Promise<void> {
  await api.delete(
    `${milestoneUrl(tenantId, projectId)}/${milestoneId}`
  );
}
