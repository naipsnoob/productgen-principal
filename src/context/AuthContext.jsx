import React, { createContext, useState, useEffect, useContext } from 'react';
// import { base44 } from '@/api/base44Client'; // Removido o import direto do Base44
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/api/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // Usuário logado. O plano deve ser buscado no seu banco de dados Supabase
          // Por enquanto, vamos usar um mock de plano
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.email,
            planStatus: "basic", // Substituir pela busca real no DB
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    // Verifica o estado inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.email,
          planStatus: "basic",
        });
        setIsAuthenticated(true);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async () => {
    // Função de login com Supabase
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google', // Exemplo: Google. Você pode mudar para 'email' se preferir.
      options: {
        redirectTo: window.location.origin + '/dashboard', // Redireciona para o dashboard após o login
      },
    });

    if (error) {
      console.error("Erro ao iniciar login:", error.message);
      alert("Erro ao iniciar login. Verifique o console.");
    }
  };

  const logout = async () => {
    // Função de logout com Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error.message);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      navigate("/");
    }
  };

  // Função para simular a compra de um plano e redirecionar
  const subscribe = (planName) => {
    // A lógica de assinatura (pagamento) é externa.
    // Após o pagamento, o usuário faria o login.
    // Por enquanto, vamos apenas redirecionar para o login do Supabase.
    console.log(`Iniciando processo de assinatura para: ${planName}`);
    login(); // Redireciona para o login
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-slate-600">Carregando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, subscribe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
