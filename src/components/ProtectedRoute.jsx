import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ allowedPlans = ['basic', 'premium'] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    // Pode retornar um spinner de carregamento aqui
    return <div>Carregando autenticação...</div>;
  }

  if (!isAuthenticated) {
    // Se não estiver logado, redireciona para a Landing Page
    return <Navigate to="/" replace />;
  }

  // Verifica se o plano do usuário está na lista de planos permitidos
  if (user && user.planStatus && !allowedPlans.includes(user.planStatus)) {
    // Se o usuário estiver logado, mas o plano não for suficiente,
    // redireciona para a página de preços ou uma página de upgrade
    return <Navigate to="/pricing" replace />;
  }

  // Se estiver autenticado e com plano permitido, renderiza o componente filho
  return <Outlet />;
};

export default ProtectedRoute;
