import type { StatsMedecin } from "../types/stats.types";

export const calculerTauxCompletion = (stats: StatsMedecin): number => {
  if (stats.totalRdv === 0) return 0;
  return Math.round((stats.rdvTermines / stats.totalRdv) * 100);
};
