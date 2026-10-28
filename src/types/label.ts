
export interface LabelResponse {
  id: string;
  projectId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface CreateLabelRequest {
  name: string;
  color: string;
}

export type UpdateLabelRequest = CreateLabelRequest;

export interface TaskLabelResponse {
  taskId: string;
  labelId: string;
  labelName: string;
  color: string;
}
