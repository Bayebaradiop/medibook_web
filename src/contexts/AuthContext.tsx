import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/modules/auth/services/authService";
import type { UpdateProfileRequest, Utilisateur } from "@/modules/auth/types/auth.types";

interface AuthContextType {
  user: Utilisateur | null;
  loading: boolean;
  login: (email: string, motDePasse: string) => Promise<Utilisateur>;
  updateProfile: (data: UpdateProfileRequest) => Promise<Utilisateur>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error("AuthContext non initialisé"); },
  updateProfile: async () => { throw new Error("AuthContext non initialisé"); },
  refreshProfile: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const res = await authService.getProfile();
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      await refreshProfile();
      setLoading(false);
    };
    void init();
  }, []);

  const login = async (email: string, motDePasse: string): Promise<Utilisateur> => {
    const res = await authService.login({ email, motDePasse });
    setUser(res.data.user);
    return res.data.user;
  };

  const updateProfile = async (data: UpdateProfileRequest): Promise<Utilisateur> => {
    const res = await authService.updateProfile(data);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, updateProfile, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
