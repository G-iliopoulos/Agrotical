import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, users, UserRole } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  loginAs: (userId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, message: 'Λάθος email ή κωδικός' };
    if (!user.active) return { success: false, message: 'Ο λογαριασμός σας είναι ανενεργός' };
    setCurrentUser(user);
    return { success: true, message: 'Επιτυχής σύνδεση' };
  };

  const loginAs = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, login, loginAs, logout, isAuthenticated: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: 'Διαχειριστής',
    farmer: 'Αγρότης',
    agronomist: 'Γεωπόνος',
  };
  return labels[role];
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: '#7c3aed',
    farmer: '#2d6a4f',
    agronomist: '#0369a1',
  };
  return colors[role];
}
