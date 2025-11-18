import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError("Por favor, digite seu email");
      return;
    }

    setIsLoading(true);

    try {
      // Usa a função de reset de senha do Base44
      await base44.auth.resetPassword(email);
      
      setSuccess(true);
      
      // Redirecionar para login após 5 segundos
      setTimeout(() => {
        navigate(createPageUrl('Login'));
      }, 5000);

    } catch (err) {
      console.error('Erro ao solicitar reset de senha:', err);
      setError("Erro ao enviar email de recuperação. Verifique se o email está correto e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-2xl border-slate-200">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Mail className="w-9 h-9 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-slate-900">Recuperar Senha</CardTitle>
            <p className="text-slate-600 mt-2">
              {success 
                ? "Email enviado com sucesso!" 
                : "Digite seu email para receber instruções"}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-6">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-semibold">✅ Email enviado!</p>
                    <p className="text-sm">
                      Enviamos um link de recuperação para <strong>{email}</strong>
                    </p>
                    <p className="text-sm">
                      Verifique sua caixa de entrada e siga as instruções para criar uma nova senha.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">📧 Não recebeu o email?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Verifique a pasta de spam/lixo eletrônico</li>
                  <li>Aguarde alguns minutos (pode demorar até 5 minutos)</li>
                  <li>Verifique se o email está correto</li>
                  <li>Tente solicitar novamente clicando no botão abaixo</li>
                </ul>
              </div>

              <Button
                onClick={() => navigate(createPageUrl('Login'))}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  className="h-11"
                  autoComplete="email"
                />
                <p className="text-xs text-slate-500">
                  Digite o email que você usa para acessar o ProductGen
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Enviar Email de Recuperação
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={() => navigate(createPageUrl('Login'))}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}