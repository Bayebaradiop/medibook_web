import { SPECIALITE_ERREURS } from "../messages/specialite.erreurs";
import type { SpecialiteForm } from "../types/specialite.types";

export const validerSpecialiteForm = (data: SpecialiteForm): Record<string, string> => {
  const erreurs: Record<string, string> = {};
  if (!data.nom.trim()) erreurs.nom = SPECIALITE_ERREURS.NOM_REQUIS;
  return erreurs;
};
