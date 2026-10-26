
export type TaskPriority = 0 | 1 | 2 | 3;
export type TaskStatus = number;

export interface TaskResponse {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  assignedToIds: string[];
  assignedToNames: string[];
  createdById: string;
  milestoneId: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description: string | null;
  assignedToIds: string[];
  milestoneId: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
}

export interface UpdateTaskRequest extends CreateTaskRequest {}

export interface AssignTaskRequest {
  assignedToIds: string[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  fullName: string;
  email: string;
}
