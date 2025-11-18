import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Users, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

export default function ConfiguracaoAcessoPage() {
  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-red-600" />
            🔒 Bloquear Auto-Registro
          </h1>
          <p className="text-slate-600 text-lg">
            Configure o Base44 para permitir APENAS usuários autorizados
          </p>
        </div>

        {/* Alerta Principal */}
        <Alert className="mb-8 bg-red-50 border-red-300">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-3">
              <p className="font-bold text-lg">
                ⚠️ IMPORTANTE: Você precisa configurar isso no Dashboard do Base44!
              </p>
              <p>
                Por padrão, o Base44 permite que qualquer pessoa crie uma conta. 
                Para bloquear isso e permitir APENAS usuários que você adicionar manualmente, 
                siga os passos abaixo.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Passo a Passo */}
        <Card className="shadow-xl border-blue-200 mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Lock className="w-7 h-7" />
              Passo a Passo: Como Bloquear Auto-Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Passo 1 */}
              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      Acesse o Dashboard do Base44
                    </h3>
                    <p className="text-slate-700 mb-3">
                      Abra o <strong>Dashboard do Base44</strong> (a plataforma onde você gerencia seu app)
                    </p>
                    <a
                      href="https://base44.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold underline"
                    >
                      Abrir Dashboard Base44
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="border-l-4 border-green-500 pl-6 py-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      Vá para Configurações do App
                    </h3>
                    <div className="space-y-2 text-slate-700">
                      <p>No Dashboard do Base44:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-4">
                        <li>Selecione seu app <strong>"ProductGen"</strong> (ou o nome que você deu)</li>
                        <li>Procure por <strong>"Settings"</strong> ou <strong>"Configurações"</strong></li>
                        <li>Clique em <strong>"Authentication"</strong> ou <strong>"Autenticação"</strong></li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="border-l-4 border-purple-500 pl-6 py-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      Desabilite "Public Sign Up" (Registro Público)
                    </h3>
                    <div className="space-y-3">
                      <p className="text-slate-700">
                        Procure por uma opção chamada:
                      </p>
                      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 font-bold">•</span>
                            <span><strong>"Allow Public Sign Up"</strong> ou <strong>"Permitir Registro Público"</strong></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 font-bold">•</span>
                            <span><strong>"Enable User Registration"</strong> ou <strong>"Habilitar Registro de Usuários"</strong></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 font-bold">•</span>
                            <span><strong>"Public Access"</strong> ou <strong>"Acesso Público"</strong></span>
                          </li>
                        </ul>
                      </div>
                      <Alert className="bg-red-50 border-red-300">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <AlertDescription className="text-red-800 font-semibold">
                          ⚠️ DESMARQUE essa opção (coloque em OFF/Desabilitado)
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passo 4 */}
              <div className="border-l-4 border-orange-500 pl-6 py-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      Configure "Invite Only" (Apenas por Convite)
                    </h3>
                    <div className="space-y-3">
                      <p className="text-slate-700">
                        Procure e HABILITE uma das seguintes opções:
                      </p>
                      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-orange-600 font-bold">•</span>
                            <span><strong>"Invite Only"</strong> ou <strong>"Apenas por Convite"</strong></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-600 font-bold">•</span>
                            <span><strong>"Admin Invite Only"</strong> ou <strong>"Apenas Admin pode Convidar"</strong></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-orange-600 font-bold">•</span>
                            <span><strong>"Restrict Registration"</strong> ou <strong>"Restringir Registro"</strong></span>
                          </li>
                        </ul>
                      </div>
                      <Alert className="bg-green-50 border-green-300">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <AlertDescription className="text-green-800 font-semibold">
                          ✅ MARQUE essa opção (coloque em ON/Habilitado)
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passo 5 */}
              <div className="border-l-4 border-blue-500 pl-6 py-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      Salve as Configurações
                    </h3>
                    <p className="text-slate-700">
                      Clique em <strong>"Save"</strong> ou <strong>"Salvar"</strong> para aplicar as mudanças.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Como Funciona Depois */}
        <Card className="shadow-lg border-green-200 mb-8">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardTitle className="text-xl flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              ✅ Como Vai Funcionar Depois da Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 text-slate-700">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Apenas usuários que VOCÊ adicionar poderão entrar</p>
                  <p className="text-sm">Vá em Dashboard → Users → "+ Add User" para adicionar manualmente</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Tentativas de auto-registro serão bloqueadas</p>
                  <p className="text-sm">Se alguém tentar criar uma conta sozinho, verá uma mensagem de erro</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Você tem controle total de quem acessa</p>
                  <p className="text-sm">Apenas as credenciais (email + senha) que você definir funcionarão</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Como Adicionar Novos Usuários */}
        <Card className="shadow-lg border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="text-xl flex items-center gap-3">
              <Users className="w-6 h-6" />
              Como Adicionar Novos Usuários de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-slate-700 font-semibold">
                Depois de configurar, para adicionar novos usuários:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-slate-700">
                <li>
                  <strong>Dashboard do Base44</strong> → Seu App → <strong>"Users"</strong>
                </li>
                <li>
                  Clique em <strong>"+ Add User"</strong> ou <strong>"+ Novo Usuário"</strong>
                </li>
                <li>
                  Preencha:
                  <ul className="list-disc list-inside ml-8 mt-2 space-y-1 text-sm">
                    <li><strong>Email:</strong> email do usuário</li>
                    <li><strong>Password:</strong> senha que ele vai usar</li>
                    <li><strong>Full Name:</strong> nome completo</li>
                    <li><strong>Role:</strong> "user" (ou "admin" se for administrador)</li>
                    <li><strong>Trial Duration Days:</strong> quantos dias de teste (ex: 30)</li>
                  </ul>
                </li>
                <li>
                  Clique em <strong>"Save"</strong>
                </li>
                <li>
                  <strong>Anote a senha</strong> e envie para o usuário junto com o link de acesso
                </li>
              </ol>

              <Alert className="bg-blue-50 border-blue-200 mt-6">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <p className="font-semibold mb-2">💡 Dica:</p>
                  <p className="text-sm">
                    Se precisar redefinir a senha de um usuário depois, 
                    use a página <strong>"Gerenciar Usuários"</strong> aqui no app 
                    (disponível na sidebar quando você está logado como admin).
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Ajuda */}
        <Card className="mt-8 shadow-md border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-yellow-900 text-lg mb-2">
                  ❓ Não Conseguiu Encontrar Essas Opções?
                </h4>
                <div className="text-yellow-800 text-sm space-y-2">
                  <p>Se você não encontrou as opções de configuração mencionadas acima no Dashboard do Base44:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Entre em contato com o suporte do Base44</li>
                    <li>Peça ajuda para <strong>"desabilitar registro público"</strong> ou <strong>"habilitar modo invite-only"</strong></li>
                    <li>Explique que você quer que apenas usuários adicionados manualmente possam acessar</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}