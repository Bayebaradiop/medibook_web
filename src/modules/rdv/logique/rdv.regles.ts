import type { RendezVous, RdvStatut } from "../types/rdv.types";

// Les rendez-vous étant immédiatement confirmés à la réservation, plus besoin de validation manuelle
export const peutConfirmer = (_rdv: RendezVous): boolean => false;

export const peutAnnuler = (rdv: RendezVous): boolean =>
  rdv.statut === "EN_ATTENTE" || rdv.statut === "CONFIRME";

export const peutTerminer = (rdv: RendezVous): boolean =>
  rdv.statut === "CONFIRME";
