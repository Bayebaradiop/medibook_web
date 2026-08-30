import { BASE_URL } from "@/constantes/global";

export const SPECIALITE_API = {
  LIST: `${BASE_URL}/admin/specialites`,
  CREATE: `${BASE_URL}/admin/specialites`,
  DETAIL: (id: number) => `${BASE_URL}/admin/specialites/${id}`,
  UPDATE: (id: number) => `${BASE_URL}/admin/specialites/${id}`,
  DELETE: (id: number) => `${BASE_URL}/admin/specialites/${id}`,
};
