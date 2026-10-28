export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export interface AuthResponse {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  tenants: Tenant[];
}


export interface LogoutRequest {
  refreshToken: string;
}
