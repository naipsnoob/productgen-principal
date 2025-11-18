import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
// import { base44 } from "@/api/base44Client"; // Removido o import direto do Base44
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  CheckCircle, 
  Package, 
  Image as ImageIcon,
  FileDown,
  Globe,
  Clock,
  Shield,
  Target,
  Rocket,
  ArrowRight,
  Star
} from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { login, subscribe } = useAuth();



  const features = [
    {
      icon: Sparkles,
      title: "Geração Inteligente com IA",
      description: "Crie títulos únicos, descrições otimizadas e tags SEO automaticamente",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: ImageIcon,
      title: "Otimização Automática de Imagens",
      description: "Redimensiona para 1200x1200 e comprime até 3MB - padrão dos marketplaces",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: FileDown,
      title: "Integração com Bling",
      description: "Exporte produtos diretamente para o Bling com todos os dados técnicos",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      icon: Globe,
      title: "Multi-Marketplace",
      description: "Categorias e atributos específicos para ML, Magalu, Shopee e Amazon",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "Palavras Sazonais",
      description: "Títulos com gatilhos de venda: Black Friday, Natal, Frete Grátis",
      gradient: "from-red-500 to-rose-500"
    },
    {
      icon: Target,
      title: "SKUs Sequenciais",
      description: "Geração automática de SKUs baseados no nome do produto",
      gradient: "from-indigo-500 to-blue-500"
    }
  ];

  const plans = [
    {
      name: "Plano 200",
      price: "R$ 100",
      period: "/mês",
      credits: "200 produtos",
      pricePerProduct: "R$ 0,50 por produto",
      features: [
        "200 produtos por mês",
        "Geração com IA avançada",
        "Imagens otimizadas 1200x1200",
        "Exportação para Bling",
        "Suporte básico"
      ],
      gradient: "from-blue-500 to-cyan-500",
      popular: false
    },
    {
      name: "Plano 1000",
      price: "R$ 150",
      period: "/mês",
      credits: "1000 produtos",
      pricePerProduct: "R$ 0,15 por produto",
      features: [
        "1000 produtos por mês",
        "Geração com IA avançada",
        "Imagens otimizadas 1200x1200",
        "Exportação para Bling",
        "Suporte prioritário",
        "Vinculação automática ML"
      ],
      gradient: "from-orange-500 to-amber-500",
      popular: true
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Upload ou Extração",
      description: "Faça upload de imagens ou extraia dados de sites de fornecedores",
      icon: ImageIcon
    },
    {
      step: "2",
      title: "IA Gera Variações",
      description: "A IA cria múltiplas versões de títulos e descrições otimizadas",
      icon: Sparkles
    },
    {
      step: "3",
      title: "Revise e Exporte",
      description: "Ajuste se necessário e exporte direto para o Bling",
      icon: FileDown
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      {/* Header/Navbar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">ProductGen</h1>
              <p className="text-xs text-slate-500 font-medium">Gerador de Anúncios com IA</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={login}
              className="font-semibold"
            >
              Entrar
            </Button>
            <Button
              onClick={() => subscribe("Plano Padrão")}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-bold shadow-lg"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center relative">
        <div className="absolute -top-10 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-10 right-1/4 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-6 py-2 text-base font-bold">
          <Star className="w-4 h-4 mr-2" />
          Automatize Seus Anúncios com IA
        </Badge>
        
        <h1 className="text-6xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">
          Crie <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">Milhares</span> de<br />
          Anúncios Profissionais
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto font-medium">
          Gere automaticamente títulos únicos, descrições otimizadas e imagens padronizadas para seus produtos. 
          Exporte direto para o Bling e marketplaces.
        </p>
        
        <div className="flex items-center justify-center gap-4 mb-12">
          <Button
            onClick={() => subscribe("Plano Padrão")}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-black text-lg px-8 py-7 shadow-2xl rounded-2xl group"
          >
            <Rocket className="w-6 h-6 mr-3 group-hover:animate-bounce" />
            Começar Gratuitamente
            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            className="font-bold text-lg px-8 py-7 border-2"
          >
            Ver Recursos
          </Button>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Teste Gratuito</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Sem Cartão</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Cancele Quando Quiser</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-1.5 font-bold">
            <TrendingUp className="w-4 h-4 mr-2" />
            Recursos Poderosos
          </Badge>
          <h2 className="text-5xl font-black text-slate-900 mb-4">
            Tudo que Você Precisa para Escalar
          </h2>
          <p className="text-xl text-slate-600 font-medium">
            Ferramentas profissionais para automatizar sua operação
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <Card 
              key={idx}
              className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
            >
              <CardContent className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 font-medium">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-4 py-1.5 font-bold">
              <Zap className="w-4 h-4 mr-2" />
              Simples e Rápido
            </Badge>
            <h2 className="text-5xl font-black text-slate-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-slate-600 font-medium">
              Em 3 passos você já está vendendo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="relative">
                <Card className="border-0 shadow-xl bg-white">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <span className="text-3xl font-black text-white">{item.step}</span>
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 font-medium">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
                
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-1.5 font-bold">
            <Package className="w-4 h-4 mr-2" />
            Planos Acessíveis
          </Badge>
          <h2 className="text-5xl font-black text-slate-900 mb-4">
            Escolha Seu Plano
          </h2>
          <p className="text-xl text-slate-600 font-medium">
            Sem surpresas, sem taxas ocultas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <Card
              key={idx}
              className={`relative shadow-2xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 ${
                plan.popular ? 'ring-4 ring-orange-400 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-6 py-2 text-sm font-black shadow-lg">
                    <Star className="w-4 h-4 mr-2" />
                    MAIS POPULAR
                  </Badge>
                </div>
              )}

              <CardContent className="p-10">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-black text-slate-900 mb-3">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-6xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-xl text-slate-600 font-semibold">{plan.period}</span>
                  </div>
                  <Badge className={`bg-gradient-to-r ${plan.gradient} text-white border-0 px-4 py-2 font-bold text-base`}>
                    {plan.credits}
                  </Badge>
                  <p className="text-sm text-slate-600 font-semibold mt-2">
                    {plan.pricePerProduct}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-700 font-semibold">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => subscribe(plan.name)}
                  className={`w-full py-7 text-lg font-black shadow-xl bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-opacity`}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Assinar Agora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-5xl font-black mb-6">
            Pronto Para Automatizar?
          </h2>
          <p className="text-xl mb-10 font-medium opacity-90">
            Comece agora mesmo e gere milhares de anúncios profissionais em minutos
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => subscribe("Plano Padrão")}
              className="bg-white text-cyan-600 hover:bg-blue-50 font-black text-xl px-10 py-8 shadow-2xl rounded-2xl"
            >
              <Rocket className="w-6 h-6 mr-3" />
              Começar Teste Gratuito
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Dados Seguros</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Suporte em Português</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black">ProductGen</h3>
                <p className="text-sm text-slate-400">Gerador de Anúncios com IA</p>
              </div>
            </div>
            
            <div className="text-sm text-slate-400 font-medium">
              © 2024 ProductGen. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
