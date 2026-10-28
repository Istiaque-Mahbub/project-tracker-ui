export interface ActivityResponse {
  id: string;
  tenantId: string;
  projectId: string;
  taskId: string | null;
  userId: string;
  userName: string;
  action: string;
  description: string;
  createdAt: string;
}