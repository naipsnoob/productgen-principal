import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Sparkles, TrendingUp, Loader2 } from "lucide-react";

export default function PricingPage() {
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      key: 'plano_200',
      name: 'Plano 200',
      price: 'R$ 100',
      credits: 200,
      pricePerProduct: 'R$ 0,50',
      description: 'Ideal para começar',
      features: [
        '200 produtos por mês',
        'R$ 0,50 por produto',
        'Geração com IA',
        'Imagens otimizadas 1200x1200',
        'Exportação para Bling',
        'Suporte básico'
      ],
      gradient: 'from-blue-500 to-cyan-500',
      popular: false
    },
    {
      key: 'plano_1000',
      name: 'Plano 1000',
      price: 'R$ 150',
      credits: 1000,
      pricePerProduct: 'R$ 0,15',
      description: 'Melhor custo-benefício',
      features: [
        '1000 produtos por mês',
        'R$ 0,15 por produto',
        'Geração com IA',
        'Imagens otimizadas 1200x1200',
        'Exportação para Bling',
        'Suporte prioritário',
        'Vinculação automática ML'
      ],
      gradient: 'from-orange-500 to-amber-500',
      popular: true
    }
  ];

  const handleSubscribe = async (planKey) => {
    // Solicitar e-mail e nome antes do checkout
    const customerEmail = prompt('Digite seu e-mail:');
    if (!customerEmail || !customerEmail.includes('@')) {
      alert('⚠️ Por favor, digite um e-mail válido.');
      return;
    }

    const customerName = prompt('Digite seu nome:');
    if (!customerName || customerName.trim().length < 2) {
      alert('⚠️ Por favor, digite seu nome.');
      return;
    }

    setLoading(planKey);

    try {
      console.log('🚀 Iniciando checkout para plano:', planKey);
      const appHost = window.location.origin;
      const successUrl = `${appHost}/compra-sucesso`;
      const cancelUrl = `${appHost}/pricing`;

      console.log('📍 URLs configuradas:', { successUrl, cancelUrl, customerEmail, customerName });

      const result = await base44.functions.invoke('stripe', {
        function: 'createCheckoutSession',
        planKey: planKey,
        successUrl: successUrl,
        cancelUrl: cancelUrl,
        customerEmail: customerEmail,
        customerName: customerName
      });

      console.log('📦 Resposta recebida:', result);

      const data = result.data || result;

      if (data.success && data.url) {
        console.log('✅ Redirecionando para Stripe:', data.url);
        // Usar window.top para sair do iframe do preview
        if (window.top) {
          window.top.location.href = data.url;
        } else {
          window.location.href = data.url;
        }
      } else {
        console.error('❌ Erro na resposta:', data);
        alert(`Erro: ${data.error || 'Não foi possível criar a sessão de checkout'}`);
      }

    } catch (err) {
      console.error('❌ Erro ao criar checkout:', err);
      console.error('Detalhes:', err.response?.data || err.message);
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-4 py-1.5 text-sm font-semibold">
            <TrendingUp className="w-4 h-4 mr-2" />
            Planos e Preços
          </Badge>
          <h1 className="text-5xl font-black text-slate-900 mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">
            Escolha Seu Plano
          </h1>
          <p className="text-slate-600 text-xl font-medium">
            Gere milhares de anúncios otimizados com IA
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.key}
              className={`relative shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 ${
                plan.popular ? 'ring-4 ring-orange-400 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-4 py-1.5 text-sm font-bold shadow-lg">
                    <Sparkles className="w-4 h-4 mr-1" />
                    MAIS POPULAR
                  </Badge>
                </div>
              )}

              <CardHeader className={`bg-gradient-to-r ${plan.gradient} text-white pb-8`}>
                <CardTitle className="text-3xl font-black mb-2">
                  {plan.name}
                </CardTitle>
                <p className="text-white/90 text-sm font-semibold mb-4">
                  {plan.description}
                </p>
                <div className="mb-2">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="text-white/90 text-lg ml-2">/mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white border-0 font-bold">
                    {plan.credits} produtos
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 font-bold">
                    {plan.pricePerProduct} cada
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={loading !== null}
                  className={`w-full py-6 text-lg font-black shadow-lg bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-opacity`}
                >
                  {loading === plan.key ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Assinar Agora
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-8">
            Todos os Planos Incluem
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Geração com IA</h3>
                <p className="text-slate-600 text-sm">
                  Títulos, descrições e tags otimizadas automaticamente
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Integração Bling</h3>
                <p className="text-slate-600 text-sm">
                  Exporte diretamente para o Bling com todos os dados
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">Imagens Otimizadas</h3>
                <p className="text-slate-600 text-sm">
                  1200x1200 pixels, comprimidas e prontas para marketplaces
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}