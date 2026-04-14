export interface ExceptionPlanning {
  id: number;
  medecinId: number;
  medecinNom?: string;
  dateDebut: string;
  dateFin: string;
  type: "ABSENT" | "FERME" | "VACANCES";
  heureDebut?: string | null;
  heureFin?: string | null;
  motif?: string;
}

export interface ExceptionForm {
  dateDebut: string;
  dateFin: string;
  type: "ABSENT" | "FERME" | "VACANCES";
  heureDebut?: string;
  heureFin?: string;
  motif: string;
}
