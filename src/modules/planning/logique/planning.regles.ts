import type { Planning } from "../types/planning.types";

export const detecterChevauchement = (nouveau: Planning, existants: Planning[]): boolean =>
  existants.some(
    (p) =>
      p.jour === nouveau.jour &&
      p.id !== nouveau.id &&
      nouveau.heureDebut < p.heureFin &&
      nouveau.heureFin > p.heureDebut
  );
