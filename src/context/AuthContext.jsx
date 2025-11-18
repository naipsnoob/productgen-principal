import React, { createContext, useState, useEffect, useContext } from 'react';
// import { base44 } from '@/api/base44Client'; // Removido o import direto do Base44
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função para simular a obtenção do usuário e seu status de plano
  // Função para simular a obtenção do usuário e seu status de plano
  const fetchUserStatus = async () => {
    // Na solução mock, o estado inicial é sempre deslogado.
    // Em uma solução real, você verificaria o token no localStorage ou faria uma chamada à API.
    const storedUser = JSON.parse(localStorage.getItem('mockUser'));
    
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserStatus();
    // O Base44 pode ter eventos de mudança de estado que você pode escutar aqui
    // Ex: base44.auth.onAuthStateChange(fetchUserStatus);
  }, []);

  const login = () => {
    // MOCK: Simula um login bem-sucedido
    const mockUser = {
      id: 'mock-user-123',
      email: 'teste@exemplo.com',
      name: 'Usuário Mock',
      planStatus: 'basic', // Simulação: O usuário está logado e tem um plano
    };
    
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
    navigate('/dashboard'); // Redireciona para o dashboard após o login simulado
  };

  const logout = async () => {
    // MOCK: Simula um logout
    localStorage.removeItem('mockUser');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/'); // Redireciona para a Landing Page após o logout
  };

  // Função para simular a compra de um plano e redirecionar
  const subscribe = (planName) => {
    // MOCK: Simula a assinatura e o login
    console.log(`MOCK: Assinatura para o plano: ${planName}`);
    
    const mockUser = {
      id: 'mock-user-123',
      email: 'teste@exemplo.com',
      name: 'Usuário Mock',
      planStatus: planName === 'Plano 1000' ? 'premium' : 'basic', // Simula um plano
    };
    
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
    navigate('/dashboard'); // Redireciona para o dashboard após a assinatura simulada
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, subscribe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
