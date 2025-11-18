
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User } from './types';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  consumeCredits: (amount: number) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('productgen_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('productgen_user');
    }
  }, []);

  const login = (email: string) => {
    // In a real app, this would be a full auth flow.
    // Here we simulate a successful login.
    const mockUser: User = {
      id: 'usr_123',
      email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'user',
    };
    localStorage.setItem('productgen_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('productgen_user');
    setUser(null);
  };
    
  const consumeCredits = useCallback((amount: number) => {
    // This would typically be an API call
    // For now, we simulate it on the client
  }, []);


  const value = { user, isAuthenticated: !!user, login, logout, consumeCredits, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mocking the Base44 auth object as described
const useMockBase44 = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    return {
        auth: {
            isAuthenticated: () => isAuthenticated,
            me: () => user,
            redirectToLogin: () => {
                // In a real scenario, this would be window.location.href,
                // but we use react-router for a smoother SPA experience.
                navigate('/login');
            },
        },
    };
}
