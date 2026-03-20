import type { Medecin, Secretaire } from "../types/utilisateur.types";

export const formaterNomComplet = (user: { nom: string; prenom: string }): string =>
  `${user.prenom} ${user.nom}`;

export const formaterNomMedecin = (medecin: Medecin): string =>
  `Dr. ${medecin.prenom} ${medecin.nom}`;

export const getInitiales = (user: { nom: string; prenom: string }): string =>
  `${user.prenom[0]}${user.nom[0]}`.toUpperCase();

export const filtrerParStatut = <T extends { statut: "ACTIF" | "INACTIF" }>(
  utilisateurs: T[],
  statut: T["statut"]
): T[] => utilisateurs.filter((u) => u.statut === statut);
