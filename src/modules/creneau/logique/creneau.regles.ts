import type { Creneau } from "../types/creneau.types";

export const peutSupprimer = (creneau: Creneau): boolean =>
  creneau.disponible;
