import { AUTH_ERREURS } from "../messages/auth.erreurs";

export const validerEmail = (email: string): string | null => {
  if (!email.trim()) return AUTH_ERREURS.EMAIL_REQUIS;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return AUTH_ERREURS.EMAIL_INVALIDE;
  return null;
};

export const validerMotDePasse = (motDePasse: string): string | null => {
  if (!motDePasse) return AUTH_ERREURS.MDP_REQUIS;
  if (motDePasse.length < 8) return AUTH_ERREURS.MDP_TROP_COURT;
  return null;
};
