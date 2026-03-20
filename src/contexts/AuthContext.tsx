import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/modules/auth/services/authService";
import type { Utilisateur } from "@/modules/auth/types/auth.types";

interface AuthContextType {
  user: Utilisateur | null;
  loading: boolean;
  login: (email: string, motDePasse: string) => Promise<Utilisateur>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error("AuthContext non initialisé"); },
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);

  // Au montage : le cookie est envoyé automatiquement → on vérifie si l'utilisateur est connecté
  useEffect(() => {
    const init = async () => {
      try {
        const res = await authService.getProfile();
        setUser(res.data);
      } catch {
        setUser(null);
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, motDePasse: string): Promise<Utilisateur> => {
    const res = await authService.login({ email, motDePasse });
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
