// Réponse backend GET /api/super-admin/cabinets et GET /{id}
export interface Cabinet {
  id: number;
  nom: string;
  logo: string | null;
  couleurPrimaire: string | null;
  couleurSecondaire: string | null;
  adresse: string;
  telephone: string;
  email: string;
  status: string;
  admin: AdminInfo | null;
}

export interface AdminInfo {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

// Ce qu'on envoie au backend (partie "dto" du multipart)
export interface CabinetCreateDTO {
  nom: string;
  logoUrl?: string;
  couleurPrimaire?: string;
  couleurSecondaire?: string;
  adresse: string;
  telephone: string;
  email: string;
  adminNom: string;
  adminPrenom: string;
  adminEmail: string;
  adminTelephone: string;
  adminPassword: string;
}

// Wrapper de réponse backend pour create/update
export interface ApiStandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
