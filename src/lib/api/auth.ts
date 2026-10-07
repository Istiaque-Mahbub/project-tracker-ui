import { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";
import api from "../axios";


export const register = async(
    data: RegisterRequest
): Promise<AuthResponse> =>{
    const response = await api.post(
        "/api/auth/register",
        data
    )

    return response.data;
}


export const login = async (
  data: LoginRequest
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/api/auth/login",
    data
  );

  return response.data;
};