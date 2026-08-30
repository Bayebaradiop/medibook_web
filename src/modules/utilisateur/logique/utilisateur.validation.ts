import { UTILISATEUR_ERREURS } from "../messages/utilisateur.erreurs";
import type { MedecinForm, SecretaireForm } from "../types/utilisateur.types";

const TEL_REGEX = /^[+]?[0-9][0-9\s\-()]{7,19}$/;

export const validerMedecinForm = (data: MedecinForm, isCreation: boolean): Record<string, string> => {
  const erreurs: Record<string, string> = {};

  if (!data.nom.trim()) erreurs.nom = UTILISATEUR_ERREURS.NOM_REQUIS;
  if (!data.prenom.trim()) erreurs.prenom = UTILISATEUR_ERREURS.PRENOM_REQUIS;
  if (!data.email.trim()) erreurs.email = UTILISATEUR_ERREURS.EMAIL_REQUIS;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) erreurs.email = UTILISATEUR_ERREURS.EMAIL_INVALIDE;
  if (!data.telephone.trim()) erreurs.telephone = UTILISATEUR_ERREURS.TELEPHONE_REQUIS;
  else if (!TEL_REGEX.test(data.telephone)) erreurs.telephone = UTILISATEUR_ERREURS.TELEPHONE_INVALIDE;
  if (!data.specialiteId) erreurs.specialiteId = UTILISATEUR_ERREURS.SPECIALITE_REQUISE;
  if (isCreation && (!data.motDePasse || data.motDePasse.length < 6)) {
    erreurs.motDePasse = UTILISATEUR_ERREURS.MDP_TROP_COURT;
  }

  return erreurs;
};

export const validerSecretaireForm = (data: SecretaireForm, isCreation: boolean): Record<string, string> => {
  const erreurs: Record<string, string> = {};

  if (!data.nom.trim()) erreurs.nom = UTILISATEUR_ERREURS.NOM_REQUIS;
  if (!data.prenom.trim()) erreurs.prenom = UTILISATEUR_ERREURS.PRENOM_REQUIS;
  if (!data.email.trim()) erreurs.email = UTILISATEUR_ERREURS.EMAIL_REQUIS;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) erreurs.email = UTILISATEUR_ERREURS.EMAIL_INVALIDE;
  if (!data.telephone.trim()) erreurs.telephone = UTILISATEUR_ERREURS.TELEPHONE_REQUIS;
  else if (!TEL_REGEX.test(data.telephone)) erreurs.telephone = UTILISATEUR_ERREURS.TELEPHONE_INVALIDE;
  if (isCreation && (!data.motDePasse || data.motDePasse.length < 6)) {
    erreurs.motDePasse = UTILISATEUR_ERREURS.MDP_TROP_COURT;
  }

  return erreurs;
};
