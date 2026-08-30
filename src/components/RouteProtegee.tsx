import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { Utilisateur } from "@/modules/auth/types/auth.types";

interface Props {
  children: React.ReactNode;
  rolesAutorises: Utilisateur["role"][];
}

const RouteProtegee = ({ children, rolesAutorises }: Props) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (!rolesAutorises.includes(user.role)) {
    const routes: Record<string, string> = {
      SUPER_ADMIN: "/super-admin",
      ADMIN: "/admin",
      MEDECIN: "/medecin",
      SECRETAIRE: "/secretaire",
    };
    return <Navigate to={routes[user.role] || "/login"} replace />;
  }

  return <>{children}</>;
};

export default RouteProtegee;
