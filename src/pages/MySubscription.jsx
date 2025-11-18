import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MySubscriptionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelLoading, setCancelLoading] = useState(false);

  const { data: subscriptionData, isLoading, refetch } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const result = await base44.functions.invoke('stripe', {
        function: 'getSubscriptionStatus'
      });
      return result.data || result;
    }
  });

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?\n\nVocê poderá usar seus créditos até o final do período atual.')) {
      return;
    }

    setCancelLoading(true);

    try {
      const result = await base44.functions.invoke('stripe', {
        function: 'cancelSubscription'
      });

      const data = result.data || result;

      if (data.success) {
        await refetch();
        alert('✅ Sua assinatura será cancelada no final do período atual.');
      } else {
        alert(`❌ Erro: ${data.error}`);
      }

    } catch (err) {
      console.error('Erro ao cancelar:', err);
      alert(`❌ Erro: ${err.message}`);
    } finally {
      setCancelLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Carregando assinatura...</p>
        </div>
      </div>
    );
  }

  if (!subscriptionData?.has_subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-10 h-10 text-slate-400" />
              </div>

              <h2 className="text-3xl font-black text-slate-900 mb-3">
                Nenhuma Assinatura Ativa
              </h2>

              <p className="text-slate-600 text-lg mb-8">
                Escolha um plano para começar a gerar produtos
              </p>

              <Button
                onClick={() => navigate(createPageUrl('Pricing'))}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6 text-lg font-black shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Ver Planos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const subscription = subscriptionData.subscription;
  const creditPercentage = (subscription.product_credits / subscription.total_credits) * 100;

  const planNames = {
    plano_200: 'Plano 200 Produtos',
    plano_1000: 'Plano 1000 Produtos'
  };

  const statusColors = {
    active: 'bg-green-500',
    canceled: 'bg-red-500',
    past_due: 'bg-yellow-500',
    incomplete: 'bg-orange-500',
    trialing: 'bg-blue-500'
  };

  const statusLabels = {
    active: 'Ativa',
    canceled: 'Cancelada',
    past_due: 'Pagamento Atrasado',
    incomplete: 'Incompleta',
    trialing: 'Em Teste'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-4 py-1.5 text-sm font-semibold">
            <CreditCard className="w-4 h-4 mr-2" />
            Minha Assinatura
          </Badge>
          <h1 className="text-5xl font-black text-slate-900 mb-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">
            Gerenciar Assinatura
          </h1>
        </div>

        {subscription.cancel_at_period_end && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-300">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 font-semibold">
              ⚠️ Sua assinatura será cancelada no final do período atual. Você pode continuar usando até lá.
            </AlertDescription>
          </Alert>
        )}

        {/* Plan Info */}
        <Card className="mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-black mb-2">
                  {planNames[subscription.plan_name] || subscription.plan_name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`${statusColors[subscription.status]} text-white border-0 font-bold`}>
                    {subscription.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                    {statusLabels[subscription.status] || subscription.status}
                  </Badge>
                </div>
              </div>
              <Sparkles className="w-16 h-16 text-white/20" />
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Credits */}
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Créditos Disponíveis
                </h3>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-slate-900">
                      {subscription.product_credits}
                    </span>
                    <span className="text-slate-600 font-semibold">
                      / {subscription.total_credits}
                    </span>
                  </div>
                  <Progress value={creditPercentage} className="h-3" />
                  <p className="text-sm text-slate-600 font-medium">
                    {creditPercentage.toFixed(0)}% disponível
                  </p>
                </div>
              </div>

              {/* Period */}
              {subscription.current_period_end && (
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Próxima Renovação
                  </h3>
                  <div className="space-y-2">
                    <p className="text-2xl font-black text-slate-900">
                      {new Date(subscription.current_period_end).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-slate-600 font-medium">
                      {subscription.cancel_at_period_end 
                        ? '⚠️ Assinatura será cancelada nesta data'
                        : '✅ Seus créditos serão renovados automaticamente'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Ações</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Button
                onClick={() => navigate(createPageUrl('Pricing'))}
                variant="outline"
                className="w-full border-2 font-semibold justify-start"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver Outros Planos
              </Button>

              {!subscription.cancel_at_period_end && subscription.status === 'active' && (
                <Button
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  variant="outline"
                  className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold justify-start"
                >
                  {cancelLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar Assinatura
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            💡 Seus créditos não utilizados expiram no final do período
          </p>
        </div>
      </div>
    </div>
  );
}