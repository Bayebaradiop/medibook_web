export interface Cabinet {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  logo?: string;
  statut: "ACTIF" | "INACTIF";
  dateCreation?: string;
}

export interface CabinetForm {
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
}
