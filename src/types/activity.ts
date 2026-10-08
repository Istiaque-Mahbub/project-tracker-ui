export interface ActivityLogResponse {
  id: string;
  tenantId: string;
  projectId: string | null;
  taskId: string | null;
  userId: string;
  userName: string;
  action: string;
  description: string;
  createdAt: string;
}