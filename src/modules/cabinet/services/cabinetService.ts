import apiClient from "@/api/apiClient";
import { CABINET_API } from "../constantes/cabinet.api";
import type { Cabinet, CabinetCreateDTO, ApiStandardResponse } from "../types/cabinet.types";

export const cabinetService = {
  list: () =>
    apiClient.get<Cabinet[]>(CABINET_API.LIST),

  detail: (id: number) =>
    apiClient.get<Cabinet>(CABINET_API.DETAIL(id)),

  create: (data: CabinetCreateDTO, logo?: File) => {
    const formData = new FormData();
    formData.append("dto", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (logo) formData.append("logo", logo);
    return apiClient.post<ApiStandardResponse<Cabinet>>(CABINET_API.CREATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id: number, data: CabinetCreateDTO, logo?: File) => {
    const formData = new FormData();
    formData.append("dto", new Blob([JSON.stringify(data)], { type: "application/json" }));
    if (logo) formData.append("logo", logo);
    return apiClient.put<ApiStandardResponse<Cabinet>>(CABINET_API.UPDATE(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id: number) =>
    apiClient.delete(CABINET_API.DELETE(id)),

  toggleStatus: (id: number) =>
    apiClient.patch<Cabinet>(CABINET_API.TOGGLE_STATUS(id)),

  updateLogo: (id: number, logo: File) => {
    const formData = new FormData();
    formData.append("logo", logo);
    return apiClient.patch<Cabinet>(CABINET_API.UPDATE_LOGO(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
