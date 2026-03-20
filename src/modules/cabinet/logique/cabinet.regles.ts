import type { Cabinet } from "../types/cabinet.types";

export const peutSupprimer = (cabinet: Cabinet): boolean =>
  cabinet.statut === "INACTIF";

export const peutDesactiver = (cabinet: Cabinet): boolean =>
  cabinet.statut === "ACTIF";
