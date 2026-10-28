
export interface Worklog {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  description: string;
}

export interface CreateWorklogRequest {
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  description: string;
}

export type UpdateWorklogRequest = CreateWorklogRequest;
