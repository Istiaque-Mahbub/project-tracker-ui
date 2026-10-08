export enum TaskPriority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}

export enum TaskStatus {
  Todo = "Todo",
  InProgress = "InProgress",
  Review = "Review",
  Completed = "Completed",
}

export interface TaskResponse {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  assignedToId: string | null;
  createdById: string;
  milestoneId: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  assignedToName: string | null;
}