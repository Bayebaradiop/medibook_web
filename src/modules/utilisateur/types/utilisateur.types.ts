export interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  numeroOrdre: string;
  specialiteId: number;
  specialiteNom?: string;
  statut: "ACTIF" | "INACTIF";
  photo?: string;
}

export interface MedecinForm {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse?: string;
  numeroOrdre: string;
  specialiteId: number;
}

export interface Secretaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut: "ACTIF" | "INACTIF";
  photo?: string;
}

export interface SecretaireForm {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse?: string;
}
