// Ce que le formulaire envoie au backend
export interface LoginRequest {
  email: string;
  motDePasse: string;
}

// L'objet "user" dans la réponse du backend
export interface Utilisateur {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MEDECIN" | "SECRETAIRE";
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
  token: string;
  motDePasse: string;
  confirmationMotDePasse: string;
}
