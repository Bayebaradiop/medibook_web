import apiClient from "@/api/apiClient";
import { ADMIN_API } from "../constantes/admin.api";

export const adminService = {
  list: (page = 0, size = 20) =>
    apiClient.get(ADMIN_API.LIST, { params: { page, size } }),
};
