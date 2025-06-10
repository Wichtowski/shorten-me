'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyJwt } from '@/app/api/v1/utils/jwt';
import { User, UserContextType } from '@/common/interfaces/User';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = await verifyJwt(token);
        setUser(decoded);
      }
    };
    checkToken();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return <UserContext.Provider value={{ user, setUser, logout }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
