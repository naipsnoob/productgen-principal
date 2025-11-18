import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, LogIn, Sparkles } from "lucide-react";

export default function CompraSucessoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl animate-pulse">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>

              <div>
                <h1 className="text-4xl font-black text-slate-900 mb-3">
                  🎉 Compra Realizada com Sucesso!
                </h1>
                <p className="text-xl text-slate-600 font-medium">
                  Bem-vindo ao ProductGen
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-8 text-left">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-blue-900 mb-2">
                      📧 Verifique seu E-mail
                    </h3>
                    <p className="text-blue-800 font-medium leading-relaxed">
                      Enviamos um e-mail com seus dados de acesso para a conta que você cadastrou.
                    </p>
                  </div>
                </div>

                <div className="bg-white/50 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm">O e-mail contém:</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span><strong>Usuário:</strong> Seu e-mail de cadastro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span><strong>Senha Provisória:</strong> Para primeiro acesso</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span><strong>Link de Acesso:</strong> Para entrar na plataforma</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-left">
                <h3 className="font-black text-yellow-900 mb-3 flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5" />
                  Próximos Passos
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800 font-medium">
                  <li>Abra o e-mail que enviamos para você</li>
                  <li>Copie a senha provisória</li>
                  <li>Clique no link ou no botão abaixo para fazer login</li>
                  <li>No primeiro acesso, você será solicitado a criar uma nova senha</li>
                </ol>
              </div>

              <div className="pt-4 space-y-3">
                <Link to={createPageUrl('Login')} className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-6 text-lg shadow-xl">
                    <LogIn className="w-5 h-5 mr-2" />
                    Fazer Login Agora
                  </Button>
                </Link>

                <p className="text-xs text-slate-500 text-center">
                  Não recebeu o e-mail? Verifique sua caixa de spam ou entre em contato com o suporte.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}