import apiClient from "@/api/apiClient";
import { EXCEPTION_API } from "../constantes/exception.api";
import type { ExceptionPlanning, ExceptionForm } from "../types/exception.types";

export const exceptionMedecinService = {
  list: () =>
    apiClient.get<ExceptionPlanning[]>(EXCEPTION_API.MEDECIN_LIST),

  create: (data: ExceptionForm) =>
    apiClient.post<ExceptionPlanning>(EXCEPTION_API.MEDECIN_CREATE, data),

  update: (id: number, data: ExceptionForm) =>
    apiClient.put<ExceptionPlanning>(EXCEPTION_API.MEDECIN_UPDATE(id), data),

  delete: (id: number) =>
    apiClient.delete(EXCEPTION_API.MEDECIN_DELETE(id)),
};

export const exceptionSecretaireService = {
  list: (medecinId: number) =>
    apiClient.get<ExceptionPlanning[]>(EXCEPTION_API.SECRETAIRE_LIST(medecinId)),

  create: (medecinId: number, data: ExceptionForm) =>
    apiClient.post<ExceptionPlanning>(EXCEPTION_API.SECRETAIRE_CREATE(medecinId), data),

  update: (id: number, data: ExceptionForm) =>
    apiClient.put<ExceptionPlanning>(EXCEPTION_API.SECRETAIRE_UPDATE(id), data),

  delete: (medecinId: number, id: number) =>
    apiClient.delete(EXCEPTION_API.SECRETAIRE_DELETE(id)),
};
