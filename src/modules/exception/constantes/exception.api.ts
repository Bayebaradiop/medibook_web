import { BASE_URL } from "@/constantes/global";

export const EXCEPTION_API = {
  // Médecin
  MEDECIN_LIST: `${BASE_URL}/medecin/exceptions`,
  MEDECIN_CREATE: `${BASE_URL}/medecin/exceptions`,
  MEDECIN_UPDATE: (id: number) => `${BASE_URL}/medecin/exceptions/${id}`,
  MEDECIN_DELETE: (id: number) => `${BASE_URL}/medecin/exceptions/${id}`,
  // Secrétaire
  SECRETAIRE_LIST: (medecinId: number) => `${BASE_URL}/secretaire/exceptions/medecin/${medecinId}`,
  SECRETAIRE_CREATE: (medecinId: number) => `${BASE_URL}/secretaire/exceptions/medecin/${medecinId}`,
  SECRETAIRE_UPDATE: (id: number) => `${BASE_URL}/secretaire/exceptions/${id}`,
  SECRETAIRE_DELETE: (id: number) => `${BASE_URL}/secretaire/exceptions/${id}`,
};
