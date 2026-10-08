export interface ProjectResponse {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  ownerId: string;
  createAt: string;
  updateAt: string | null;
}