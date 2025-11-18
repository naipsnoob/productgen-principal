
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Upload, LayoutDashboard, Package, Zap, Settings, Clock, AlertCircle, LogOut, Users, TrendingUp, Sparkles, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Planos",
    url: createPageUrl("Pricing"),
    icon: CreditCard,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Gerar Produtos",
    url: createPageUrl("Upload"),
    icon: Zap,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    title: "Meus Produtos",
    url: createPageUrl("Products"),
    icon: Package,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Configurações",
    url: createPageUrl("Settings"),
    icon: Settings,
    gradient: "from-slate-500 to-slate-600",
  },
];

const adminNavigationItems = [
  {
    title: "Gerenciar Usuários",
    url: createPageUrl("AdminUsers"),
    icon: Users,
    gradient: "from-blue-600 to-cyan-600",
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [acessoNaoAprovado, setAcessoNaoAprovado] = useState(false);

  // Páginas públicas que não precisam de autenticação
  const publicPages = ['Home', 'Pricing', 'CompraSucesso'];
  const isPublicPage = publicPages.includes(currentPageName);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Páginas públicas não precisam de auth
      if (isPublicPage) {
        console.log('[Layout] Página pública:', currentPageName);
        setIsLoading(false);
        return;
      }
      
      console.log('[Layout] Verificando autenticação para página privada:', currentPageName);
      
      // Para páginas privadas, verificar autenticação
      try {
        const isAuth = await base44.auth.isAuthenticated();
        console.log('[Layout] isAuthenticated:', isAuth);
        
        if (!isAuth) {
          console.log('[Layout] Usuário não autenticado, redirecionando para login');
          base44.auth.redirectToLogin(location.pathname);
          return;
        }
        
        const userData = await base44.auth.me();
        console.log('[Layout] Usuário autenticado:', userData?.email);
        setUser(userData);
        setIsLoading(false);
        
        // Carregar assinatura se estiver autenticado
        try {
          const result = await base44.functions.invoke('stripe', {
            function: 'getSubscriptionStatus'
          });
          const data = result.data || result;
          if (data.success && data.has_subscription) {
            setSubscription(data.subscription);
          }
        } catch (err) {
          console.error('Erro ao buscar assinatura:', err);
        }
        
      } catch (err) {
        console.log('[Layout] Erro ao verificar autenticação:', err);
        base44.auth.redirectToLogin(location.pathname);
      }
    };
    
    checkAuthAndRedirect();
  }, [currentPageName, isPublicPage, navigate, location.pathname]);



  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      navigate(createPageUrl('Login'));
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  // Renderizar páginas públicas sem verificação de auth
  if (isPublicPage) {
    return children;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 rounded-2xl animate-spin"></div>
            <div className="absolute inset-1 bg-white rounded-xl flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-blue-500 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (acessoNaoAprovado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 p-6">
        <div className="max-w-md w-full">
          <Card className="shadow-2xl border-yellow-300 bg-white">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-yellow-400/30 animate-pulse">
                  <Clock className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-yellow-900 mb-3">
                    ⏳ Aguardando Aprovação
                  </h2>
                  <p className="text-yellow-800 text-lg">
                    Seu cadastro foi recebido com sucesso!
                  </p>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-left">
                  <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    O que acontece agora:
                  </h3>
                  <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-2">
                    <li>Seu cadastro está aguardando aprovação do administrador</li>
                    <li>O administrador definirá seu período de teste</li>
                    <li>Você receberá acesso assim que for aprovado</li>
                  </ol>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-semibold mb-1">👤 Suas informações:</p>
                  <p><strong>Nome:</strong> {user?.full_name || 'Não informado'}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                </div>

                <Button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-6 text-lg shadow-lg"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sair
                </Button>

                <p className="text-xs text-yellow-600">
                  Obrigado pela paciência! 🙏
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (trialExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="border-red-300 bg-white shadow-xl">
            <AlertCircle className="w-6 h-6" />
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-red-900 mb-2">
                    🔒 Período de Teste Expirado
                  </h2>
                  <p className="text-red-800">
                    Seu período de teste terminou em{' '}
                    <strong>
                      {user?.trial_end_date && new Date(user.trial_end_date).toLocaleDateString('pt-BR')}
                    </strong>
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">
                    Para continuar usando o ProductGen:
                  </h3>
                  <ol className="list-decimal list-inside text-sm text-red-800 space-y-1">
                    <li>Entre em contato com o administrador</li>
                    <li>Solicite extensão do período de teste ou upgrade</li>
                    <li>Aguarde a aprovação para voltar a acessar</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  <p className="font-semibold mb-1">💡 Seu acesso foi suspenso automaticamente</p>
                  <p className="text-xs">
                    Quando o administrador estender seu período, você poderá acessar novamente.
                  </p>
                </div>

                <Button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>

                <p className="text-center text-xs text-red-600">
                  Obrigado por usar o ProductGen! 🙏
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
        <style>{`
          :root {
            --primary: 220 90% 56%;
            --primary-foreground: 0 0% 100%;
            --accent: 142 76% 36%;
            --accent-foreground: 0 0% 100%;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
        
        <Sidebar className="border-r-0 bg-white/80 backdrop-blur-xl shadow-2xl">
          <SidebarHeader className="border-b border-slate-200/50 p-6 bg-gradient-to-br from-blue-500 via-cyan-500 to-green-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/50 animate-float">
                <Sparkles className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-white text-xl drop-shadow-lg">ProductGen</h2>
                <p className="text-xs text-white/90 font-medium">Gerador de Anúncios</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3 bg-gradient-to-b from-white/50 to-slate-50/50">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Menu Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-gradient-to-r hover:${item.gradient} hover:text-white transition-all duration-300 rounded-2xl mb-1 group ${
                            isActive ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl` : ''
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3.5">
                            <item.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                            <span className="font-semibold">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user?.role === 'admin' && (
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-xs font-bold text-blue-600 uppercase tracking-wider px-3 py-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Administração
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2">
                    {adminNavigationItems.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            className={`hover:bg-gradient-to-r hover:${item.gradient} hover:text-white transition-all duration-300 rounded-2xl mb-1 group ${
                              isActive ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl` : ''
                            }`}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3.5">
                              <item.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                              <span className="font-semibold">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {subscription && subscription.status === 'active' && (
              <SidebarGroup className="mt-6">
                <SidebarGroupContent>
                  <Link to={createPageUrl('MySubscription')}>
                    <div className="mx-3 p-4 rounded-2xl border-2 shadow-lg backdrop-blur-sm bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300 shadow-purple-200/50 hover:scale-105 transition-transform cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-purple-900">
                          {subscription.plan_name === 'plano_200' ? 'Plano 200' : 'Plano 1000'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-purple-700">
                        ✨ {subscription.product_credits} créditos disponíveis
                      </p>
                    </div>
                  </Link>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {trialDaysLeft !== null && trialDaysLeft > 0 && (
              <SidebarGroup className="mt-6">
                <SidebarGroupContent>
                  <div className={`mx-3 p-4 rounded-2xl border-2 shadow-lg backdrop-blur-sm ${
                    trialDaysLeft <= 7 
                      ? 'bg-gradient-to-br from-red-100 to-orange-100 border-red-300 shadow-red-200/50'
                      : trialDaysLeft <= 15
                      ? 'bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-300 shadow-yellow-200/50'
                      : 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 shadow-green-200/50'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        trialDaysLeft <= 7 ? 'bg-red-500' : 
                        trialDaysLeft <= 15 ? 'bg-yellow-500' : 'bg-green-500'
                      } shadow-lg`}>
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-sm font-bold ${
                        trialDaysLeft <= 7 ? 'text-red-900' : 
                        trialDaysLeft <= 15 ? 'text-yellow-900' : 'text-green-900'
                      }`}>
                        Período de Teste
                      </span>
                    </div>
                    <p className={`text-xs font-semibold ${
                      trialDaysLeft <= 7 ? 'text-red-700' : 
                      trialDaysLeft <= 15 ? 'text-yellow-700' : 'text-green-700'
                    }`}>
                      {trialDaysLeft === 1 
                        ? '⚠️ Último dia de teste!'
                        : trialDaysLeft <= 7
                        ? `⚠️ Restam ${trialDaysLeft} dias`
                        : `✨ ${trialDaysLeft} dias restantes`
                      }
                    </p>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup className="mt-6">
              <SidebarGroupContent>
                <div className="mx-3 p-5 bg-gradient-to-br from-blue-500 via-cyan-500 to-green-500 rounded-2xl border-2 border-white/20 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-white">Exportação API</span>
                  </div>
                  <p className="text-xs text-white/90 font-medium leading-relaxed">
                    Exporte seus produtos diretamente para o Bling com imagens automáticas
                  </p>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/50 p-4 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-md">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-400 via-cyan-400 to-green-400 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {user?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  {user?.role === 'admin' && (
                    <span className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
                      Admin
                    </span>
                  )}
                </div>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 border-2 border-red-300 font-semibold transition-all duration-300"
              >
                <LogOut className="w-3 h-3 mr-2" />
                Sair
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  ProductGen
                </h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
