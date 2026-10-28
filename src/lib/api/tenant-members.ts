
import api from "../axios";

import type {
  TenantMember,
  AddTenantMemberRequest,
  UpdateTenantMemberRoleRequest,
} from "@/types/tenant-member";

const tenantMembersUrl = (tenantId: string) =>
  `/api/tenants/${tenantId}/members`;

export async function getTenantMembers(
  tenantId: string
): Promise<TenantMember[]> {
  const response = await api.get<TenantMember[]>(
    tenantMembersUrl(tenantId)
  );

  return response.data;
}

export async function getTenantMemberByUserId(
  tenantId: string,
  userId: string
): Promise<TenantMember> {
  const response = await api.get<TenantMember>(
    `${tenantMembersUrl(tenantId)}/${userId}`
  );

  return response.data;
}

export async function addTenantMember(
  tenantId: string,
  data: AddTenantMemberRequest
): Promise<TenantMember> {
  const response = await api.post<TenantMember>(
    tenantMembersUrl(tenantId),
    data
  );

  return response.data;
}

export async function updateTenantMemberRole(
  tenantId: string,
  userId: string,
  data: UpdateTenantMemberRoleRequest
): Promise<TenantMember> {
  const response = await api.put<TenantMember>(
    `${tenantMembersUrl(tenantId)}/${userId}`,
    data
  );

  return response.data;
}

export async function removeTenantMember(
  tenantId: string,
  userId: string
): Promise<void> {
  await api.delete(
    `${tenantMembersUrl(tenantId)}/${userId}`
  );
}
