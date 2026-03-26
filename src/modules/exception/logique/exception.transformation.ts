import type { ExceptionPlanning } from "../types/exception.types";

export const formaterPeriode = (exception: ExceptionPlanning): string =>
  exception.heureDebut && exception.heureFin
    ? `${exception.date} (${exception.heureDebut} - ${exception.heureFin})`
    : `${exception.date} (Journée complète)`;

export const trierParDate = (exceptions: ExceptionPlanning[]): ExceptionPlanning[] =>
  [...exceptions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export const estActive = (exception: ExceptionPlanning): boolean => {
  const maintenant = new Date();
  const date = new Date(exception.date);
  return (
    date.getFullYear() === maintenant.getFullYear() &&
    date.getMonth() === maintenant.getMonth() &&
    date.getDate() === maintenant.getDate()
  );
};
