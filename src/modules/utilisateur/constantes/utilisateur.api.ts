import { BASE_URL } from "@/constantes/global";

export const UTILISATEUR_API = {
  // Admin — Médecins
  MEDECINS: {
    LIST: `${BASE_URL}/admin/medecins`,
    CREATE: `${BASE_URL}/admin/medecins`,
    DETAIL: (id: number) => `${BASE_URL}/admin/medecins/${id}`,
    UPDATE: (id: number) => `${BASE_URL}/admin/medecins/${id}`,
    DELETE: (id: number) => `${BASE_URL}/admin/medecins/${id}`,
    TOGGLE_STATUS: (id: number) => `${BASE_URL}/admin/medecins/${id}/status`,
  },
  // Admin — Secrétaires
  SECRETAIRES: {
    LIST: `${BASE_URL}/admin/secretaires`,
    CREATE: `${BASE_URL}/admin/secretaires`,
    DETAIL: (id: number) => `${BASE_URL}/admin/secretaires/${id}`,
    UPDATE: (id: number) => `${BASE_URL}/admin/secretaires/${id}`,
    DELETE: (id: number) => `${BASE_URL}/admin/secretaires/${id}`,
    TOGGLE_STATUS: (id: number) => `${BASE_URL}/admin/secretaires/${id}/status`,
  },
  // Secrétaire — Liste des médecins
  SECRETAIRE_MEDECINS: {
    LIST: `${BASE_URL}/secretaire/medecins`,
  },
};
