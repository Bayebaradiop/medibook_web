import { EXCEPTION_ERREURS } from "../messages/exception.erreurs";
import type { ExceptionForm } from "../types/exception.types";

export const validerExceptionForm = (data: ExceptionForm): Record<string, string> => {
  const erreurs: Record<string, string> = {};

  if (!data.dateDebut) {
    erreurs.dateDebut = EXCEPTION_ERREURS.DATE_REQUISE;
  }
  if (!data.dateFin) {
    erreurs.dateFin = EXCEPTION_ERREURS.DATE_REQUISE;
  }
  if (data.dateDebut && new Date(data.dateDebut) < new Date(new Date().toDateString())) {
    erreurs.dateDebut = EXCEPTION_ERREURS.DATE_PASSEE;
  }
  if (data.dateDebut && data.dateFin && data.dateFin < data.dateDebut) {
    erreurs.dateFin = "La date de fin doit être postérieure ou égale à la date de début";
  }
  if (data.dateFin > data.dateDebut) {
    if (data.heureDebut || data.heureFin) {
      erreurs.heureDebut = "Les heures ne sont pas autorisées pour une période de plusieurs jours";
      erreurs.heureFin = "Les heures ne sont pas autorisées pour une période de plusieurs jours";
    }
  }
  if (data.heureDebut && data.heureFin && data.heureFin <= data.heureDebut) {
    erreurs.heureFin = EXCEPTION_ERREURS.HEURE_FIN_AVANT_DEBUT;
  }
  if (!data.motif?.trim()) {
    erreurs.motif = EXCEPTION_ERREURS.MOTIF_REQUIS;
  }

  return erreurs;
};
