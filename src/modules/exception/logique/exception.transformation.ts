import type { ExceptionPlanning } from "../types/exception.types";

export const formaterPeriode = (exception: ExceptionPlanning): string =>
  exception.heureDebut && exception.heureFin
    ? `${exception.dateDebut === exception.dateFin ? exception.dateDebut : `${exception.dateDebut} → ${exception.dateFin}`} (${exception.heureDebut} - ${exception.heureFin})`
    : `${exception.dateDebut === exception.dateFin ? exception.dateDebut : `${exception.dateDebut} → ${exception.dateFin}`} (${exception.dateDebut !== exception.dateFin ? "Jours complets" : "Journée complète"})`;

export const trierParDate = (exceptions: ExceptionPlanning[]): ExceptionPlanning[] =>
  [...exceptions].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());

export const estActive = (exception: ExceptionPlanning): boolean => {
  const maintenant = new Date();
  const dateDebut = new Date(exception.dateDebut);
  const dateFin = new Date(exception.dateFin);
  const maintenantDate = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  const debutDate = new Date(dateDebut.getFullYear(), dateDebut.getMonth(), dateDebut.getDate());
  const finDate = new Date(dateFin.getFullYear(), dateFin.getMonth(), dateFin.getDate());
  return maintenantDate >= debutDate && maintenantDate <= finDate;
};
