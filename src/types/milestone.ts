
export interface MilestoneResponse {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  createdAt: string;
}

export interface CreateMilestoneRequest {
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
}

export type UpdateMilestoneRequest = CreateMilestoneRequest;
