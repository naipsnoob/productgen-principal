import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle, CheckCircle, Key } from "lucide-react";

export default function PrimeiroAcessoPage() {
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");

    if (novaSenha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);

    try {
      // Atualizar senha
      await base44.auth.updateMe({
        password: novaSenha,
        primeiro_acesso: false
      });

      alert('✅ Senha alterada com sucesso! Redirecionando...');
      navigate(createPageUrl('Dashboard'));
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      setError(err.message || 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Key className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 text-center">
              Primeiro Acesso
            </CardTitle>
            <p className="text-sm text-slate-600 text-center mt-2">
              Por segurança, defina uma nova senha
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <Alert className="mb-6 bg-blue-50 border-blue-300">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                <strong>Bem-vindo!</strong> Por favor, escolha uma senha segura para proteger sua conta.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <Label htmlFor="novaSenha" className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Nova Senha
                </Label>
                <Input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="border-2"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="confirmarSenha" className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Digite a senha novamente"
                  required
                  minLength={6}
                  className="border-2"
                  disabled={isLoading}
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600">
                <p className="font-semibold mb-2">📌 Dicas para uma senha segura:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use pelo menos 6 caracteres</li>
                  <li>Combine letras e números</li>
                  <li>Evite senhas óbvias</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-6 text-lg shadow-lg"
              >
                {isLoading ? 'Salvando...' : 'Definir Nova Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}