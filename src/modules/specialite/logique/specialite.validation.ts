import { SPECIALITE_ERREURS } from "../messages/specialite.erreurs";
import type { SpecialiteForm } from "../types/specialite.types";

export const validerSpecialiteForm = (data: SpecialiteForm): Record<string, string> => {
  const erreurs: Record<string, string> = {};
  if (!data.nom.trim()) erreurs.nom = SPECIALITE_ERREURS.NOM_REQUIS;
  else if (data.nom.length > 100) erreurs.nom = SPECIALITE_ERREURS.NOM_TROP_LONG;

  if (data.description && data.description.length > 500) {
    erreurs.description = SPECIALITE_ERREURS.DESCRIPTION_TROP_LONGUE;
  }

  return erreurs;
};
