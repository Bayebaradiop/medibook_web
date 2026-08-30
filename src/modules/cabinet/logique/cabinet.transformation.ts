import type { Cabinet } from "../types/cabinet.types";

export const formaterAdresse = (cabinet: Cabinet): string =>
  cabinet.adresse;

export const filtrerParStatut = (cabinets: Cabinet[], statut: Cabinet["statut"]): Cabinet[] =>
  cabinets.filter((c) => c.statut === statut);
