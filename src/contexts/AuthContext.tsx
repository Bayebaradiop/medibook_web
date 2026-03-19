import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { UserRole } from '@/utils/constants';
import { mockCurrentUser, type User } from '@/data/mockUsers';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  login: (email: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, login: () => false, logout: () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const login = (email: string): boolean => {
    const e = email.toLowerCase();
    let r: UserRole | null = null;
    if (e.includes('superadmin')) r = 'SUPER_ADMIN';
    else if (e.includes('admin')) r = 'ADMIN';
    else if (e.includes('medecin')) r = 'MEDECIN';
    else if (e.includes('secretaire')) r = 'SECRETAIRE';
    if (r) { setRole(r); setUser(mockCurrentUser[r]); return true; }
    return false;
  };

  const logout = () => { setUser(null); setRole(null); };

  return <AuthContext.Provider value={{ user, role, login, logout }}>{children}</AuthContext.Provider>;
};
