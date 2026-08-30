import apiClient from "@/api/apiClient";
import { CRENEAU_API } from "../constantes/creneau.api";
import type { Creneau } from "../types/creneau.types";

export const creneauService = {
  listParMedecin: (medecinId: number) =>
    apiClient.get<Creneau[]>(CRENEAU_API.LIST(medecinId)),

  delete: (id: number) =>
    apiClient.delete(CRENEAU_API.DELETE(id)),
};
