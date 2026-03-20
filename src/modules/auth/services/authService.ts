import apiClient from "@/api/apiClient";
import { AUTH_API } from "../constantes/auth.api";
import type { LoginRequest, LoginResponse, ForgotPasswordRequest, ResetPasswordRequest, Utilisateur } from "../types/auth.types";

export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>(AUTH_API.LOGIN, data),

  logout: () =>
    apiClient.post(AUTH_API.LOGOUT),

  getProfile: () =>
    apiClient.get<Utilisateur>(AUTH_API.PROFILE),

  updateProfile: (data: Partial<Utilisateur>) =>
    apiClient.put<Utilisateur>(AUTH_API.PROFILE, data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post(AUTH_API.FORGOT_PASSWORD, data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post(AUTH_API.RESET_PASSWORD, data),
};
