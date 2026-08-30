import { PLANNING_ERREURS } from "../messages/planning.erreurs";
import type { PlanningForm } from "../types/planning.types";

export const validerPlanningForm = (data: PlanningForm): Record<string, string> => {
  const erreurs: Record<string, string> = {};

  if (!data.jourSemaine) erreurs.jourSemaine = PLANNING_ERREURS.JOUR_REQUIS;
  if (!data.heureDebut) erreurs.heureDebut = PLANNING_ERREURS.HEURE_DEBUT_REQUISE;
  if (!data.heureFin) erreurs.heureFin = PLANNING_ERREURS.HEURE_FIN_REQUISE;
  if (data.heureDebut && data.heureFin && data.heureFin <= data.heureDebut) {
    erreurs.heureFin = PLANNING_ERREURS.HEURE_FIN_AVANT_DEBUT;
  }
  if (!data.dureeCreneau) erreurs.dureeCreneau = PLANNING_ERREURS.DUREE_REQUISE;
  if (data.dureeCreneau && data.dureeCreneau <= 0) {
    erreurs.dureeCreneau = PLANNING_ERREURS.DUREE_INVALIDE;
  }
  if (!data.medecinId) erreurs.medecinId = PLANNING_ERREURS.MEDECIN_REQUIS;

  return erreurs;
};
