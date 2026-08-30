import apiClient from "@/api/apiClient";
import { SPECIALITE_API } from "../constantes/specialite.api";
import type { Specialite, SpecialiteForm } from "../types/specialite.types";

export const specialiteService = {
  list: () =>
    apiClient.get<Specialite[]>(SPECIALITE_API.LIST),

  detail: (id: number) =>
    apiClient.get<Specialite>(SPECIALITE_API.DETAIL(id)),

  create: (data: SpecialiteForm) =>
    apiClient.post<Specialite>(SPECIALITE_API.CREATE, data),

  update: (id: number, data: SpecialiteForm) =>
    apiClient.put<Specialite>(SPECIALITE_API.UPDATE(id), data),

  delete: (id: number) =>
    apiClient.delete(SPECIALITE_API.DELETE(id)),
};
