import type { RendezVous, RdvStatut } from "../types/rdv.types";

export const peutConfirmer = (rdv: RendezVous): boolean =>
  rdv.statut === "EN_ATTENTE";

export const peutAnnuler = (rdv: RendezVous): boolean =>
  rdv.statut === "EN_ATTENTE" || rdv.statut === "CONFIRME";

export const peutTerminer = (rdv: RendezVous): boolean =>
  rdv.statut === "CONFIRME";
