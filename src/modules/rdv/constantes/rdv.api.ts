import { BASE_URL } from "@/constantes/global";

export const RDV_API = {
  // Médecin
  MEDECIN_LIST: `${BASE_URL}/medecin/rdv`,
  MEDECIN_EN_ATTENTE: `${BASE_URL}/medecin/rdv/en-attente`,
  MEDECIN_CONFIRMER: (id: number) => `${BASE_URL}/medecin/rdv/${id}/confirmer`,
  MEDECIN_TERMINER: (id: number) => `${BASE_URL}/medecin/rdv/${id}/terminer`,
  // Secrétaire
  SECRETAIRE_LIST: `${BASE_URL}/secretaire/rdv`,
  SECRETAIRE_EN_ATTENTE: `${BASE_URL}/secretaire/rdv/en-attente`,
  SECRETAIRE_CONFIRMER: (id: number) => `${BASE_URL}/secretaire/rdv/${id}/confirmer`,
  SECRETAIRE_ANNULER: (id: number) => `${BASE_URL}/secretaire/rdv/${id}/annuler`,
};
