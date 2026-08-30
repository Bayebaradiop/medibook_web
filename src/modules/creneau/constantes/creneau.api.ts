import { BASE_URL } from "@/constantes/global";

export const CRENEAU_API = {
  LIST: (medecinId: number) => `${BASE_URL}/secretaire/creneaux/medecin/${medecinId}`,
  DELETE: (id: number) => `${BASE_URL}/secretaire/creneaux/${id}`,
};
