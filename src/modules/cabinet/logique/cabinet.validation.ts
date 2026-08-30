import { CABINET_ERREURS } from "../messages/cabinet.erreurs";
import type { CabinetCreateDTO } from "../types/cabinet.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL_REGEX = /^[+]?[0-9][0-9\s\-()]{7,19}$/;
const COULEUR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const validerCabinetForm = (data: CabinetCreateDTO, isEdit: boolean): Record<string, string> => {
  const e: Record<string, string> = {};

  // --- Cabinet ---
  if (!data.nom.trim()) e.nom = CABINET_ERREURS.NOM_REQUIS;
  else if (data.nom.length > 255) e.nom = CABINET_ERREURS.NOM_TROP_LONG;

  if (!data.adresse.trim()) e.adresse = CABINET_ERREURS.ADRESSE_REQUISE;
  else if (data.adresse.length > 500) e.adresse = CABINET_ERREURS.ADRESSE_TROP_LONGUE;

  if (!data.telephone.trim()) e.telephone = CABINET_ERREURS.TELEPHONE_REQUIS;
  else if (!TEL_REGEX.test(data.telephone)) e.telephone = CABINET_ERREURS.TELEPHONE_FORMAT_INVALIDE;

  if (!data.email.trim()) e.email = CABINET_ERREURS.EMAIL_REQUIS;
  else if (!EMAIL_REGEX.test(data.email)) e.email = CABINET_ERREURS.EMAIL_INVALIDE;

  if (data.couleurPrimaire && !COULEUR_REGEX.test(data.couleurPrimaire)) e.couleurPrimaire = CABINET_ERREURS.COULEUR_FORMAT_INVALIDE;
  if (data.couleurSecondaire && !COULEUR_REGEX.test(data.couleurSecondaire)) e.couleurSecondaire = CABINET_ERREURS.COULEUR_FORMAT_INVALIDE;

  // --- Admin ---
  if (!data.adminNom.trim()) e.adminNom = CABINET_ERREURS.ADMIN_NOM_REQUIS;
  if (!data.adminPrenom.trim()) e.adminPrenom = CABINET_ERREURS.ADMIN_PRENOM_REQUIS;

  if (!data.adminEmail.trim()) e.adminEmail = CABINET_ERREURS.ADMIN_EMAIL_REQUIS;
  else if (!EMAIL_REGEX.test(data.adminEmail)) e.adminEmail = CABINET_ERREURS.ADMIN_EMAIL_INVALIDE;

  if (!data.adminTelephone.trim()) e.adminTelephone = CABINET_ERREURS.ADMIN_TELEPHONE_REQUIS;
  else if (!TEL_REGEX.test(data.adminTelephone)) e.adminTelephone = CABINET_ERREURS.ADMIN_TELEPHONE_FORMAT_INVALIDE;

  if (!isEdit) {
    if (!data.adminPassword.trim()) e.adminPassword = CABINET_ERREURS.ADMIN_PASSWORD_REQUIS;
    else if (data.adminPassword.length < 6) e.adminPassword = CABINET_ERREURS.ADMIN_PASSWORD_TROP_COURT;
  }

  return e;
};
