export interface ExceptionPlanning {
  id: number;
  medecinId: number;
  medecinNom?: string;
  dateDebut: string;
  dateFin: string;
  motif: string;
  type: "ABSENT";
}

export interface ExceptionForm {
  medecinId?: number;
  dateDebut: string;
  dateFin: string;
  motif: string;
}
