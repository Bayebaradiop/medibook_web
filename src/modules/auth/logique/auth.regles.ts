import type { Utilisateur } from "../types/auth.types";

export const getRedirectionParRole = (role: Utilisateur["role"]): string => {
  const routes: Record<Utilisateur["role"], string> = {
    SUPER_ADMIN: "/super-admin",
    ADMIN: "/admin",
    MEDECIN: "/medecin",
    SECRETAIRE: "/secretaire",
  };
  return routes[role];
};
