import type { ExceptionPlanning } from "../types/exception.types";

export const formaterPeriode = (exception: ExceptionPlanning): string =>
  `Du ${exception.dateDebut} au ${exception.dateFin}`;

export const trierParDate = (exceptions: ExceptionPlanning[]): ExceptionPlanning[] =>
  [...exceptions].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());

export const estActive = (exception: ExceptionPlanning): boolean => {
  const maintenant = new Date();
  return new Date(exception.dateDebut) <= maintenant && maintenant <= new Date(exception.dateFin);
};
