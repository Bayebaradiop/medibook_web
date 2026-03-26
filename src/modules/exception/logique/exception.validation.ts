import { EXCEPTION_ERREURS } from "../messages/exception.erreurs";
import type { ExceptionForm } from "../types/exception.types";

export const validerExceptionForm = (data: ExceptionForm): Record<string, string> => {
  const erreurs: Record<string, string> = {};

  if (!data.date) erreurs.date = EXCEPTION_ERREURS.DATE_REQUISE;
  if (data.date && new Date(data.date) < new Date(new Date().toDateString())) {
    erreurs.date = EXCEPTION_ERREURS.DATE_PASSEE;
  }
  if (
    data.heureDebut &&
    data.heureFin &&
    data.heureFin <= data.heureDebut
  ) {
    erreurs.heureFin = EXCEPTION_ERREURS.HEURE_FIN_AVANT_DEBUT;
  }
  if (!data.motif.trim()) {
    erreurs.motif = EXCEPTION_ERREURS.MOTIF_REQUIS;
  }

  return erreurs;
};
