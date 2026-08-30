export interface Planning {
  id: number;
  medecinId: number;
  medecinNom?: string;
  jourSemaine: "LUNDI" | "MARDI" | "MERCREDI" | "JEUDI" | "VENDREDI" | "SAMEDI" | "DIMANCHE";
  heureDebut: string;
  heureFin: string;
  dureeCreneau: number;
}

export interface PlanningForm {
  medecinId: number;
  jourSemaine: string;
  heureDebut: string;
  heureFin: string;
  dureeCreneau: number;
}
