import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await base44.functions.invoke('stripe', {
        function: 'getSubscriptionStatus'
      });

      const data = result.data || result;

      if (data.success && data.has_subscription) {
        setSubscription(data.subscription);
      }

    } catch (err) {
      console.error('Erro ao verificar assinatura:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 text-green-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">
              Processando sua assinatura...
            </h2>
            <p className="text-gray-600 mt-2">
              Aguarde enquanto confirmamos seu pagamento
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-3xl font-black text-green-900 mb-3">
            🎉 Assinatura Ativada!
          </h2>

          <p className="text-green-800 text-lg mb-6">
            Seu pagamento foi confirmado com sucesso
          </p>

          {subscription && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-900">
                  {subscription.plan_name === 'plano_200' ? 'Plano 200' : 'Plano 1000'}
                </h3>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-green-800 font-semibold">Créditos disponíveis:</span>
                  <span className="text-green-900 font-black">{subscription.product_credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800 font-semibold">Total do plano:</span>
                  <span className="text-green-900 font-black">{subscription.total_credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800 font-semibold">Status:</span>
                  <span className="text-green-900 font-black capitalize">{subscription.status}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => navigate(createPageUrl('Upload'))}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 text-lg font-black shadow-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Começar a Gerar Produtos
            </Button>

            <Button
              onClick={() => navigate(createPageUrl('Dashboard'))}
              variant="outline"
              className="w-full border-2 font-semibold"
            >
              Ir para Dashboard
            </Button>
          </div>

          <p className="text-xs text-green-700 mt-6">
            💡 Seus créditos serão renovados automaticamente todo mês
          </p>
        </CardContent>
      </Card>
    </div>
  );
}