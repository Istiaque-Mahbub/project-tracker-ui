import { getAuth } from "@/lib/auth";

export function getCurrentTenantId(): string | null {
  const auth = getAuth();

  if (!auth) {
    return null;
  }

  if (!auth.tenants || auth.tenants.length === 0) {
    return null;
  }

  return auth.tenants[0].id;
}

export function getCurrentTenant() {
  const auth = getAuth();

  if (!auth) {
    return null;
  }

  if (!auth.tenants || auth.tenants.length === 0) {
    return null;
  }

  return auth.tenants[0];
}