import { EXCEPTION_ERREURS } from "../messages/exception.erreurs";
import type { ExceptionForm } from "../types/exception.types";

export const validerExceptionForm = (data: ExceptionForm): Record<string, string> => {
  const erreurs: Record<string, string> = {};

  if (!data.dateDebut) erreurs.dateDebut = EXCEPTION_ERREURS.DATE_DEBUT_REQUISE;
  if (!data.dateFin) erreurs.dateFin = EXCEPTION_ERREURS.DATE_FIN_REQUISE;
  if (data.dateDebut && data.dateFin && data.dateFin < data.dateDebut) {
    erreurs.dateFin = EXCEPTION_ERREURS.DATE_FIN_AVANT_DEBUT;
  }
  if (data.dateDebut && new Date(data.dateDebut) < new Date(new Date().toDateString())) {
    erreurs.dateDebut = EXCEPTION_ERREURS.DATE_PASSEE;
  }
  if (!data.motif.trim()) erreurs.motif = EXCEPTION_ERREURS.MOTIF_REQUIS;

  return erreurs;
};
