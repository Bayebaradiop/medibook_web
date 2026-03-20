import apiClient from "@/api/apiClient";
import { CABINET_API } from "../constantes/cabinet.api";
import type { Cabinet, CabinetForm } from "../types/cabinet.types";

export const cabinetService = {
  list: () =>
    apiClient.get<Cabinet[]>(CABINET_API.LIST),

  detail: (id: number) =>
    apiClient.get<Cabinet>(CABINET_API.DETAIL(id)),

  create: (data: CabinetForm) =>
    apiClient.post<Cabinet>(CABINET_API.CREATE, data),

  update: (id: number, data: CabinetForm) =>
    apiClient.put<Cabinet>(CABINET_API.UPDATE(id), data),

  delete: (id: number) =>
    apiClient.delete(CABINET_API.DELETE(id)),

  toggleStatus: (id: number) =>
    apiClient.patch(CABINET_API.TOGGLE_STATUS(id)),

  updateLogo: (id: number, formData: FormData) =>
    apiClient.put(CABINET_API.UPDATE_LOGO(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
