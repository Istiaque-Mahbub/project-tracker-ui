
import { AuthResponse } from "@/types/auth";

const AUTH_KEY = "developer_project_tracker_auth";
export const AUTH_COOKIE = "auth_token";

export function saveAuth(auth: AuthResponse): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));

  // Sync token to cookie for proxy/middleware server-side checks
  let maxAge = 60 * 60 * 24 * 7; // 7 days fallback
  if (auth.accessTokenExpiresAt) {
    const expiresMs = new Date(auth.accessTokenExpiresAt).getTime() - Date.now();
    if (expiresMs > 0) {
      maxAge = Math.floor(expiresMs / 1000);
    }
  }

  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(
    auth.accessToken
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
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
  document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  const auth = getAuth();

  return auth?.accessToken ?? null;
}

export function isAuthenticated(): boolean {
  const auth = getAuth();
  if (!auth?.accessToken) {
    return false;
  }

  if (auth.accessTokenExpiresAt) {
    const expiresAt = new Date(auth.accessTokenExpiresAt).getTime();
    if (!isNaN(expiresAt) && expiresAt <= Date.now()) {
      clearAuth();
      return false;
    }
  }

  return true;
}

export function syncAuthCookie(): void {
  if (typeof window === "undefined") {
    return;
  }

  const auth = getAuth();
  if (auth?.accessToken) {
    document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(
      auth.accessToken
    )}; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

