"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  BarChart3, 
  Zap, 
  Shield, 
  Clock, 
  Users,
  CheckCircle2,
  ArrowRight,
  Star,
  Globe,
  Smartphone,
  Headphones
} from "lucide-react";

export default function Home() {
  const marketplaces = [
    { name: "Mercado Livre", logo: "🛒" },
    { name: "Amazon", logo: "📦" },
    { name: "Shopee", logo: "🛍️" },
    { name: "Magazine Luiza", logo: "🏪" },
    { name: "B2W", logo: "🏬" },
    { name: "Via Varejo", logo: "🏢" },
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Integração Rápida",
      description: "Configure em minutos e comece a vender em múltiplos marketplaces"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Gestão Centralizada",
      description: "Controle estoque, preços e pedidos de todos os canais em um só lugar"
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Sincronização Automática",
      description: "Atualize produtos e estoque em tempo real em todos os marketplaces"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Aumente suas Vendas",
      description: "Alcance milhões de clientes nos maiores marketplaces do Brasil"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Segurança Total",
      description: "Seus dados protegidos com criptografia de ponta a ponta"
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Suporte Especializado",
      description: "Time de especialistas pronto para ajudar você a crescer"
    }
  ];

  const benefits = [
    "Economize até 70% do tempo em gestão",
    "Aumente suas vendas em até 3x",
    "Reduza erros de estoque em 95%",
    "Integração com +20 marketplaces",
    "Relatórios e analytics em tempo real",
    "Sem necessidade de conhecimento técnico"
  ];

  const plans = [
    {
      name: "Starter",
      price: "R$ 97",
      period: "/mês",
      description: "Ideal para começar",
      features: [
        "Até 500 produtos",
        "3 marketplaces",
        "Sincronização a cada 1h",
        "Suporte por email"
      ]
    },
    {
      name: "Professional",
      price: "R$ 297",
      period: "/mês",
      description: "Para quem quer crescer",
      features: [
        "Até 5.000 produtos",
        "10 marketplaces",
        "Sincronização em tempo real",
        "Suporte prioritário",
        "Relatórios avançados"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Sob consulta",
      period: "",
      description: "Solução completa",
      features: [
        "Produtos ilimitados",
        "Todos os marketplaces",
        "API dedicada",
        "Gerente de conta",
        "Customizações"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Brodi Hub
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-700 hover:text-orange-500 transition-colors">
              Recursos
            </a>
            <a href="#benefits" className="text-gray-700 hover:text-orange-500 transition-colors">
              Benefícios
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-orange-500 transition-colors">
              Planos
            </a>
            <Button 
              variant="outline" 
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
              onClick={() => window.location.href = '/admin/login'}
            >
              Entrar
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              Começar Grátis
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">
              🚀 Integração com +20 Marketplaces
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Venda em Todos os
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                {" "}Marketplaces{" "}
              </span>
              com um Único Sistema
            </h1>
            <p className="text-xl text-gray-600">
              Integre sua loja aos maiores marketplaces do Brasil em minutos. 
              Gerencie estoque, preços e pedidos de forma centralizada e automatizada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input 
                placeholder="Seu melhor email" 
                className="max-w-xs border-orange-200 focus:border-orange-500"
              />
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8">
                Começar Agora <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Teste grátis por 14 dias</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Sem cartão de crédito</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Marketplaces Integrados</span>
                  <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {marketplaces.map((marketplace, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-orange-50 transition-colors cursor-pointer">
                      <div className="text-3xl mb-2">{marketplace.logo}</div>
                      <div className="text-xs font-medium text-gray-700">{marketplace.name}</div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Vendas hoje</span>
                    <span className="font-bold text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +127%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-orange-500 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-white">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">+10.000</div>
              <div className="text-orange-100">Lojistas ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">+20</div>
              <div className="text-orange-100">Marketplaces</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold">R$ 2Bi+</div>
              <div className="text-orange-100">Em vendas processadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold flex items-center gap-1 justify-center">
                4.9 <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
              </div>
              <div className="text-orange-100">Avaliação média</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center mb-16">
          <Badge className="bg-orange-100 text-orange-700 mb-4">Recursos</Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Tudo que você precisa para
            <span className="text-orange-500"> vender mais</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ferramentas poderosas para gerenciar suas vendas em múltiplos canais
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-orange-100">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-gradient-to-br from-orange-50 to-orange-100 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-orange-500 text-white mb-4">Benefícios</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Por que escolher o Brodi Hub?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-lg px-8">
                Começar Teste Grátis
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-white">
                <Globe className="w-8 h-8 text-orange-500 mb-3" />
                <div className="text-2xl font-bold text-gray-900">+20</div>
                <div className="text-sm text-gray-600">Marketplaces integrados</div>
              </Card>
              <Card className="p-6 bg-white">
                <Users className="w-8 h-8 text-orange-500 mb-3" />
                <div className="text-2xl font-bold text-gray-900">10k+</div>
                <div className="text-sm text-gray-600">Lojistas ativos</div>
              </Card>
              <Card className="p-6 bg-white">
                <Clock className="w-8 h-8 text-orange-500 mb-3" />
                <div className="text-2xl font-bold text-gray-900">70%</div>
                <div className="text-sm text-gray-600">Economia de tempo</div>
              </Card>
              <Card className="p-6 bg-white">
                <Smartphone className="w-8 h-8 text-orange-500 mb-3" />
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Sincronização</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center mb-16">
          <Badge className="bg-orange-100 text-orange-700 mb-4">Planos</Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Escolha o plano ideal para seu negócio
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comece grátis e escale conforme seu negócio cresce
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`p-8 relative ${
                plan.popular 
                  ? 'border-2 border-orange-500 shadow-2xl scale-105' 
                  : 'border-orange-100'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  Mais Popular
                </Badge>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 mb-1">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                    : 'bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50'
                }`}
              >
                {plan.price === "Sob consulta" ? "Falar com Vendas" : "Começar Agora"}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Pronto para multiplicar suas vendas?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 10.000 lojistas que já vendem mais com o Brodi Hub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Input 
              placeholder="Seu melhor email" 
              className="max-w-xs bg-white border-0"
            />
            <Button className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8">
              Começar Teste Grátis <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          <p className="text-orange-100 mt-4 text-sm">
            ✓ 14 dias grátis • ✓ Sem cartão de crédito • ✓ Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-bold text-white">Brodi Hub</span>
              </div>
              <p className="text-sm text-gray-400">
                A solução completa para vender em múltiplos marketplaces
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 Brodi Hub. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
