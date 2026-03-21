import apiClient from "@/api/apiClient";
import { UTILISATEUR_API } from "../constantes/utilisateur.api";
import type { Medecin, MedecinForm, Secretaire, SecretaireForm } from "../types/utilisateur.types";

export const medecinService = {
  list: () =>
    apiClient.get<Medecin[]>(UTILISATEUR_API.MEDECINS.LIST),

  detail: (id: number) =>
    apiClient.get<Medecin>(UTILISATEUR_API.MEDECINS.DETAIL(id)),

  create: (data: MedecinForm, photo?: File) => {
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (photo) formData.append("photo", photo);
    return apiClient.post(UTILISATEUR_API.MEDECINS.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: number, data: MedecinForm, photo?: File) => {
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (photo) formData.append("photo", photo);
    return apiClient.put(UTILISATEUR_API.MEDECINS.UPDATE(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

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

  create: (data: SecretaireForm, photo?: File) => {
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (photo) formData.append("photo", photo);
    return apiClient.post(UTILISATEUR_API.SECRETAIRES.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: number, data: SecretaireForm, photo?: File) => {
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (photo) formData.append("photo", photo);
    return apiClient.put(UTILISATEUR_API.SECRETAIRES.UPDATE(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id: number) =>
    apiClient.delete(UTILISATEUR_API.SECRETAIRES.DELETE(id)),

  toggleStatus: (id: number) =>
    apiClient.patch(UTILISATEUR_API.SECRETAIRES.TOGGLE_STATUS(id)),
};

export const secretaireMedecinsService = {
  list: () =>
    apiClient.get<Medecin[]>(UTILISATEUR_API.SECRETAIRE_MEDECINS.LIST),
};
