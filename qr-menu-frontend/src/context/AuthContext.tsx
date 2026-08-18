import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('qr_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('qr_user');
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        // Load default mock owner
        const res = await authApi.getCurrentUser();
        setUser(res.data);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass);
    setUser(res.data.user);
    setToken(res.data.token);
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    setUser(res.data.user);
    setToken(res.data.token);
  };

  const logout = () => {
    localStorage.removeItem('qr_token');
    localStorage.removeItem('qr_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};