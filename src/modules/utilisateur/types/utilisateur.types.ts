export interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialiteId: number;
  specialiteNom?: string;
  status: "ACTIF" | "INACTIF";
  photo?: string;
  cabinetId?: number;
  cabinetNom?: string;
}

export interface MedecinForm {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse?: string;
  specialiteId: number;
}

export interface Secretaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  status: "ACTIF" | "INACTIF";
  photo?: string;
  cabinetId?: number;
  cabinetNom?: string;
}

export interface SecretaireForm {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse?: string;
}
