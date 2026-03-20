import apiClient from "@/api/apiClient";
import { PLANNING_API } from "../constantes/planning.api";
import type { Planning, PlanningForm } from "../types/planning.types";

export const planningService = {
  listMedecin: () =>
    apiClient.get<Planning[]>(PLANNING_API.MEDECIN_LIST),

  listParMedecin: (medecinId: number) =>
    apiClient.get<Planning[]>(PLANNING_API.SECRETAIRE_LIST(medecinId)),

  create: (data: PlanningForm) =>
    apiClient.post<Planning>(PLANNING_API.SECRETAIRE_CREATE, data),
};
