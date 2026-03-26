export type RdvStatut = "EN_ATTENTE" | "CONFIRME" | "TERMINE" | "ANNULE";

export interface RendezVous {
  id: number;
  statut: RdvStatut;
  motif?: string;
  // Infos créneau
  date: string;
  heureDebut: string;
  heureFin: string;
  // Infos médecin
  medecinId: number;
  medecinNom?: string;
  medecinPrenom?: string;
  medecinSpecialite?: string;
  medecinPhoto?: string;
  // Infos patient
  patientId?: number;
  patientNom?: string;
  patientPrenom?: string;
  patientTelephone?: string;
  // Infos cabinet
  cabinetId?: number;
  cabinetNom?: string;
  cabinetAdresse?: string;
}
