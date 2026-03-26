import { BASE_URL } from "@/constantes/global";

export const PLANNING_API = {
  // Médecin
  MEDECIN_LIST: `${BASE_URL}/medecin/plannings`,
  // Secrétaire
  SECRETAIRE_LIST: (medecinId: number) => `${BASE_URL}/secretaire/planning/medecin/${medecinId}`,
  SECRETAIRE_CREATE: `${BASE_URL}/secretaire/planning`,
  SECRETAIRE_DELETE: (id: number) => `${BASE_URL}/secretaire/planning/${id}`,
};
