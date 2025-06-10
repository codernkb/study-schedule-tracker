import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types';
import { USERS } from '../data/users';
import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from '../utils/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = loadFromLocalStorage<User | null>('currentUser', null);
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const foundUser = USERS.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      saveToLocalStorage('currentUser', foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    removeFromLocalStorage('currentUser');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};