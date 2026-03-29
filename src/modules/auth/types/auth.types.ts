// Ce que le formulaire envoie au backend
export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface UpdateProfileRequest {
  prenom: string;
  nom: string;
  telephone: string;
}

// L'objet "user" dans la réponse du backend
export interface Utilisateur {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string | null;
  photo?: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "MEDECIN" | "SECRETAIRE";
  status?: "ACTIF" | "INACTIF";
  cabinetId?: number | null;
  cabinetNom?: string | null;
  specialiteId?: number | null;
  specialiteNom?: string | null;
}

// La réponse complète du backend au POST /api/auth/login
export interface LoginResponse {
  message: string;
  user: Utilisateur;
  token: string;
}

// POST /api/auth/forgot-password
export interface ForgotPasswordRequest {
  email: string;
}

// POST /api/auth/reset-password
export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ApiStandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
