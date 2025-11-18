import React, { createContext, useState, useEffect, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função para simular a obtenção do usuário e seu status de plano
  const fetchUserStatus = async () => {
    try {
      // Tenta obter o usuário logado via Base44
      const loggedUser = await base44.auth.getUser();
      
      if (loggedUser) {
        // Simulação de verificação de plano. Na vida real, você faria uma chamada à sua API
        // para obter o status de assinatura do usuário (ex: 'free', 'basic', 'premium').
        // Aqui, vamos simular que o usuário está logado e tem um plano 'basic'.
        const userWithPlan = {
          ...loggedUser,
          planStatus: 'basic', // Simulação: O usuário está logado e tem um plano
        };

        setUser(userWithPlan);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Erro ao buscar status do usuário:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStatus();
    // O Base44 pode ter eventos de mudança de estado que você pode escutar aqui
    // Ex: base44.auth.onAuthStateChange(fetchUserStatus);
  }, []);

  const login = () => {
    // Redireciona para o fluxo de login do Base44
    base44.auth.redirectToLogin();
    // O Base44 irá redirecionar de volta, e o useEffect/fetchUserStatus irá capturar o estado
  };

  const logout = async () => {
    try {
      await base44.auth.logout();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/'); // Redireciona para a Landing Page após o logout
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Função para simular a compra de um plano e redirecionar
  const subscribe = (planName) => {
    // Lógica real de pagamento/assinatura aqui
    console.log(`Iniciando processo de assinatura para o plano: ${planName}`);
    // Após o sucesso da assinatura, você atualizaria o estado do usuário
    // e redirecionaria para o dashboard.
    
    // Por enquanto, apenas redireciona para a página de preços, como já estava
    navigate('/pricing'); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, subscribe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
