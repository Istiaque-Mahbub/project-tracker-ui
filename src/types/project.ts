
export interface ProjectResponse {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  ownerId: string;
  createAt: string;
  updateAt: string | null;
}

export interface CreateProjectRequest {
  name: string;
  description?: string | null;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string | null;
}

