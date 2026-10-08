
import { AuthResponse } from "@/types/auth";

const AUTH_KEY = "developer_project_tracker_auth";

export function saveAuth(auth: AuthResponse): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function getAuth(): AuthResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedAuth = localStorage.getItem(AUTH_KEY);

  if (!storedAuth) {
    return null;
  }

  try {
    return JSON.parse(storedAuth) as AuthResponse;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_KEY);
}

export function getAccessToken(): string | null {
  const auth = getAuth();

  return auth?.accessToken ?? null;
}

