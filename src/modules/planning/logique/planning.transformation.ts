import type { Planning } from "../types/planning.types";

const JOURS_ORDRE = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"];

export const trierParJour = (plannings: Planning[]): Planning[] =>
  [...plannings].sort((a, b) => JOURS_ORDRE.indexOf(a.jourSemaine) - JOURS_ORDRE.indexOf(b.jourSemaine));

export const formaterHeure = (heure: string): string => {
  const [h, m] = heure.split(":");
  return `${h}h${m}`;
};

export const grouperParJour = (plannings: Planning[]): Record<string, Planning[]> =>
  plannings.reduce((acc, p) => {
    acc[p.jourSemaine] = acc[p.jourSemaine] || [];
    acc[p.jourSemaine].push(p);
    return acc;
  }, {} as Record<string, Planning[]>);
