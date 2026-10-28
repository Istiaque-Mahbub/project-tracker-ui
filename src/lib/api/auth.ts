import { AuthResponse, LoginRequest, LogoutRequest, RegisterRequest } from "@/types/auth";
import api from "../axios";


export const register = async(
    data: RegisterRequest
): Promise<AuthResponse> =>{
    const response = await api.post<AuthResponse>(
        "/api/Auth/register",
        data
    )

    return response.data;
}


export const login = async (
  data: LoginRequest
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/api/Auth/login",
    data
  );

  return response.data;
};

export async function logout(
  request: LogoutRequest
): Promise<void> {
  await api.post("/api/auth/logout", request);
}