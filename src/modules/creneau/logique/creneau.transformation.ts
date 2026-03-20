import type { Creneau } from "../types/creneau.types";

export const grouperParDate = (creneaux: Creneau[]): Record<string, Creneau[]> =>
  creneaux.reduce((acc, c) => {
    acc[c.date] = acc[c.date] || [];
    acc[c.date].push(c);
    return acc;
  }, {} as Record<string, Creneau[]>);

export const formaterCreneauHoraire = (creneau: Creneau): string =>
  `${creneau.heureDebut} - ${creneau.heureFin}`;
