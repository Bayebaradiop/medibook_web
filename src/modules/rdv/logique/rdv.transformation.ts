import type { RendezVous, RdvStatut } from "../types/rdv.types";

export const STATUT_CONFIG: Record<RdvStatut, { label: string; couleur: string }> = {
  EN_ATTENTE: { label: "En attente", couleur: "bg-yellow-100 text-yellow-800" },
  CONFIRME: { label: "Confirmé", couleur: "bg-green-100 text-green-800" },
  TERMINE: { label: "Terminé", couleur: "bg-blue-100 text-blue-800" },
  ANNULE: { label: "Annulé", couleur: "bg-red-100 text-red-800" },
};

export const formaterNomPatient = (rdv: RendezVous): string =>
  `${rdv.patientPrenom} ${rdv.patientNom}`;

export const filtrerParStatut = (rdvs: RendezVous[], statut: RdvStatut): RendezVous[] =>
  rdvs.filter((r) => r.statut === statut);

export const trierParDate = (rdvs: RendezVous[]): RendezVous[] =>
  [...rdvs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
