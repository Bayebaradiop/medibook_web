import apiClient from "@/api/apiClient";
import { UTILISATEUR_API } from "../constantes/utilisateur.api";
import type { Medecin, MedecinForm, Secretaire, SecretaireForm } from "../types/utilisateur.types";

export const medecinService = {
  list: () =>
    apiClient.get<Medecin[]>(UTILISATEUR_API.MEDECINS.LIST),

  detail: (id: number) =>
    apiClient.get<Medecin>(UTILISATEUR_API.MEDECINS.DETAIL(id)),

  create: (data: MedecinForm) =>
    apiClient.post<Medecin>(UTILISATEUR_API.MEDECINS.CREATE, data),

  update: (id: number, data: MedecinForm) =>
    apiClient.put<Medecin>(UTILISATEUR_API.MEDECINS.UPDATE(id), data),

  delete: (id: number) =>
    apiClient.delete(UTILISATEUR_API.MEDECINS.DELETE(id)),

  toggleStatus: (id: number) =>
    apiClient.patch(UTILISATEUR_API.MEDECINS.TOGGLE_STATUS(id)),
};

export const secretaireService = {
  list: () =>
    apiClient.get<Secretaire[]>(UTILISATEUR_API.SECRETAIRES.LIST),

  detail: (id: number) =>
    apiClient.get<Secretaire>(UTILISATEUR_API.SECRETAIRES.DETAIL(id)),

  create: (data: SecretaireForm) =>
    apiClient.post<Secretaire>(UTILISATEUR_API.SECRETAIRES.CREATE, data),

  update: (id: number, data: SecretaireForm) =>
    apiClient.put<Secretaire>(UTILISATEUR_API.SECRETAIRES.UPDATE(id), data),

  delete: (id: number) =>
    apiClient.delete(UTILISATEUR_API.SECRETAIRES.DELETE(id)),

  toggleStatus: (id: number) =>
    apiClient.patch(UTILISATEUR_API.SECRETAIRES.TOGGLE_STATUS(id)),
};

export const secretaireMedecinsService = {
  list: () =>
    apiClient.get<Medecin[]>(UTILISATEUR_API.SECRETAIRE_MEDECINS.LIST),
};
