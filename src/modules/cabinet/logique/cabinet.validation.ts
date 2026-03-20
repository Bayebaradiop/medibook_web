import { CABINET_ERREURS } from "../messages/cabinet.erreurs";
import type { CabinetForm } from "../types/cabinet.types";

export const validerCabinetForm = (data: CabinetForm): Record<string, string> => {
  const erreurs: Record<string, string> = {};

  if (!data.nom.trim()) erreurs.nom = CABINET_ERREURS.NOM_REQUIS;
  if (!data.adresse.trim()) erreurs.adresse = CABINET_ERREURS.ADRESSE_REQUISE;
  if (!data.ville.trim()) erreurs.ville = CABINET_ERREURS.VILLE_REQUISE;
  if (!data.telephone.trim()) erreurs.telephone = CABINET_ERREURS.TELEPHONE_REQUIS;
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    erreurs.email = CABINET_ERREURS.EMAIL_INVALIDE;
  }

  return erreurs;
};
