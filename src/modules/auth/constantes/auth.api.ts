import { BASE_URL } from "@/constantes/global";

export const AUTH_API = {
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  PROFILE: `${BASE_URL}/auth/profile`,
  FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
};
