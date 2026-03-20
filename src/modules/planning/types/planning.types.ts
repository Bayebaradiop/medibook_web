export interface Planning {
  id: number;
  medecinId: number;
  medecinNom?: string;
  jour: "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI" | "DIMANCHE";
  heureDebut: string;
  heureFin: string;
  dureeConsultation: number;
}

export interface PlanningForm {
  medecinId: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
  dureeConsultation: number;
}
