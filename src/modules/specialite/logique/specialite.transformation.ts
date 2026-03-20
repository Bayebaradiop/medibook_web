import type { Specialite } from "../types/specialite.types";

export const trierParNom = (specialites: Specialite[]): Specialite[] =>
  [...specialites].sort((a, b) => a.nom.localeCompare(b.nom));
