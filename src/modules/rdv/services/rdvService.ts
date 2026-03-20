import apiClient from "@/api/apiClient";
import { RDV_API } from "../constantes/rdv.api";
import type { RendezVous } from "../types/rdv.types";

export const rdvMedecinService = {
  list: () =>
    apiClient.get<RendezVous[]>(RDV_API.MEDECIN_LIST),

  enAttente: () =>
    apiClient.get<RendezVous[]>(RDV_API.MEDECIN_EN_ATTENTE),

  confirmer: (id: number) =>
    apiClient.patch(RDV_API.MEDECIN_CONFIRMER(id)),

  terminer: (id: number) =>
    apiClient.patch(RDV_API.MEDECIN_TERMINER(id)),
};

export const rdvSecretaireService = {
  list: () =>
    apiClient.get<RendezVous[]>(RDV_API.SECRETAIRE_LIST),

  enAttente: () =>
    apiClient.get<RendezVous[]>(RDV_API.SECRETAIRE_EN_ATTENTE),

  confirmer: (id: number) =>
    apiClient.patch(RDV_API.SECRETAIRE_CONFIRMER(id)),

  annuler: (id: number) =>
    apiClient.patch(RDV_API.SECRETAIRE_ANNULER(id)),
};
