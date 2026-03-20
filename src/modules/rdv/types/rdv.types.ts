export type RdvStatut = "EN_ATTENTE" | "CONFIRME" | "TERMINE" | "ANNULE";

export interface RendezVous {
  id: number;
  patientNom: string;
  patientPrenom: string;
  patientTelephone: string;
  medecinId: number;
  medecinNom?: string;
  date: string;
  heure: string;
  motif?: string;
  statut: RdvStatut;
  notes?: string;
}
