import { BASE_URL } from "@/constantes/global";

export const CABINET_API = {
  LIST: `${BASE_URL}/super-admin/cabinets`,
  CREATE: `${BASE_URL}/super-admin/cabinets`,
  DETAIL: (id: number) => `${BASE_URL}/super-admin/cabinets/${id}`,
  UPDATE: (id: number) => `${BASE_URL}/super-admin/cabinets/${id}`,
  DELETE: (id: number) => `${BASE_URL}/super-admin/cabinets/${id}`,
  TOGGLE_STATUS: (id: number) => `${BASE_URL}/super-admin/cabinets/${id}/toggle-status`,
  UPDATE_LOGO: (id: number) => `${BASE_URL}/super-admin/cabinets/${id}/logo`,
  DASHBOARD: `${BASE_URL}/super-admin/dashboard/cabinets`,
};
