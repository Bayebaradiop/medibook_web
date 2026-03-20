import apiClient from "@/api/apiClient";
import { STATS_API } from "../constantes/stats.api";
import type { StatsSuperAdmin, StatsAdmin, StatsMedecin } from "../types/stats.types";

export const statsService = {
  superAdmin: () =>
    apiClient.get<StatsSuperAdmin>(STATS_API.SUPER_ADMIN),

  admin: () =>
    apiClient.get<StatsAdmin>(STATS_API.ADMIN),

  medecin: () =>
    apiClient.get<StatsMedecin>(STATS_API.MEDECIN),
};
