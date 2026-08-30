import apiClient from "@/api/apiClient";
import { AUTH_API } from "../constantes/auth.api";
import type {
  ApiStandardResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  UpdateProfileRequest,
  Utilisateur,
} from "../types/auth.types";

export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>(AUTH_API.LOGIN, data),

  logout: () =>
    apiClient.post(AUTH_API.LOGOUT),

  getProfile: () =>
    apiClient.get<Utilisateur>(AUTH_API.PROFILE),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<Utilisateur>(AUTH_API.PROFILE, data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<ApiStandardResponse<null>>(AUTH_API.FORGOT_PASSWORD, data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<ApiStandardResponse<null>>(AUTH_API.RESET_PASSWORD, data),
};
