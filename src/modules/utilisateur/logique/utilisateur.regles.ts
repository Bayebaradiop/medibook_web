import type { Medecin, Secretaire } from "../types/utilisateur.types";

export const peutSupprimerUtilisateur = (user: { statut: "ACTIF" | "INACTIF" }): boolean =>
  user.statut === "INACTIF";
