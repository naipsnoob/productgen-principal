
import React from 'react';
import { NavLink, Navigate, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';

// --- Icons ---
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M2 7L12 12M12 22V12M22 7L12 12M17 4.5L7 9.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);


// --- Main Layout Components ---

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-primary-500 text-white' : 'text-gray-700 hover:bg-primary-100 hover:text-primary-700'
    }`;

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center gap-2 text-primary-600">
              <Logo />
              <span className="font-bold text-xl">ProductGen</span>
            </NavLink>
          </div>
          <div className="hidden md:flex items-center space-x-4">
             {isAuthenticated && user && (
                <>
                  <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                  <NavLink to="/generate" className={navLinkClass}>Generate</NavLink>
                  <NavLink to="/products" className={navLinkClass}>My Products</NavLink>
                  <NavLink to="/subscription" className={navLinkClass}>Subscription</NavLink>
                  <NavLink to="/settings" className={navLinkClass}>Configurações</NavLink>
                   {user.role === 'admin' && <NavLink to="/admin/users" className={navLinkClass}>Admin</NavLink>}
                </>
             )}
          </div>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <button onClick={() => navigate('/login')} className="text-gray-700 hover:text-primary-600 font-medium">
                  Entrar
                </button>
                <button onClick={() => navigate('/pricing')} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                  Começar Agora
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Olá, {user?.name}</span>
                 <button onClick={() => { logout(); navigate('/'); }} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export const Footer: React.FC = () => (
  <footer className="bg-white border-t">
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
      &copy; {new Date().getFullYear()} ProductGen. Todos os direitos reservados.
    </div>
  </footer>
);

export const Layout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
        </main>
        <Footer />
        </div>
    );
};

// --- Route Protection ---

export const PrivateRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
     return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};

// --- Reusable UI Components ---

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white shadow-lg rounded-xl p-6 ${className}`}>
        {children}
    </div>
);

export const Button: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}> = ({ onClick, children, className = '', type = 'button', disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-2.5 font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);