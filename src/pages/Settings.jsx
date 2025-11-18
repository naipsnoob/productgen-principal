
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle,
  AlertCircle,
  Key,
  Zap,
  Link as LinkIcon,
  Loader2,
  ExternalLink,
  Copy,
  ChevronRight,
  Info,
  AlertTriangle // Added AlertTriangle import
} from "lucide-react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Estados para OAuth do Bling
  const [blingConnected, setBlingConnected] = useState(false);
  const [blingClientId, setBlingClientId] = useState("");
  const [blingClientSecret, setBlingClientSecret] = useState("");
  const [showOAuthSetup, setShowOAuthSetup] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const user = await base44.auth.me();
      
      if (user.bling_connected) {
        setBlingConnected(true);
      }
      if (user.bling_client_id) {
        setBlingClientId(user.bling_client_id);
      }
      if (user.bling_client_secret) {
        setBlingClientSecret(user.bling_client_secret);
      }
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
    }
  };

  const saveOAuthCredentials = async () => {
    if (!blingClientId.trim() || !blingClientSecret.trim()) {
      setError("Por favor, preencha Client ID e Client Secret");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await base44.auth.updateMe({
        bling_client_id: blingClientId.trim(),
        bling_client_secret: blingClientSecret.trim()
      });

      setSuccess(true);
      setShowOAuthSetup(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(`Erro ao salvar credenciais: ${err.message}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const connectWithBling = () => {
    if (!blingClientId.trim()) {
      setError("Configure o Client ID primeiro");
      return;
    }

    const redirectUri = `${window.location.origin}/BlingCallback`;
    const state = Math.random().toString(36).substring(7);

    const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${blingClientId}&state=${state}`;

    console.log('Redirecionando para:', authUrl);
    window.location.href = authUrl;
  };

  const disconnectFromBling = async () => {
    try {
      await base44.auth.updateMe({
        bling_access_token: null,
        bling_refresh_token: null,
        bling_token_expires_at: null,
        bling_connected: false
      });

      setBlingConnected(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Erro ao desconectar do Bling');
      console.error(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copiado para a área de transferência!');
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center gap-3">
            <SettingsIcon className="w-10 h-10 text-blue-600" />
            Conectar com o Bling
          </h1>
          <p className="text-slate-600 text-lg">
            Siga o guia passo a passo abaixo para conectar sua conta do Bling ao ProductGen
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Configurações salvas com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {/* ⚠️ NOVO: ALERTA DE ERRO FORBIDDEN */}
        {!blingConnected && blingClientId && blingClientSecret && (
          <Alert className="mb-6 bg-red-50 border-red-300">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-3">
                <div>
                  <strong className="text-lg">⚠️ ERRO COMUM: "FORBIDDEN - Usuário não possui autorização"</strong>
                </div>
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 space-y-2">
                  <p className="font-semibold">🔧 SOLUÇÃO RÁPIDA:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
                    <li>
                      <strong>Abra o Bling em uma nova aba:</strong>{' '}
                      <a
                        href="https://www.bling.com.br/configuracoes.php#/aplicacoes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-semibold inline-flex items-center gap-1"
                      >
                        Clique aqui para ir direto
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      <strong>Encontre sua aplicação "ProductGen Base44"</strong> na lista
                    </li>
                    <li>
                      <strong>Clique nela para abrir os detalhes</strong>
                    </li>
                    <li>
                      <strong className="text-red-700">Procure por um campo "Status" ou "Situação"</strong>
                      <div className="mt-1 ml-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <span>Se estiver como <strong>"Pendente"</strong> ou <strong>"Inativa"</strong></span>
                        </div>
                        <div className="flex items-center gap-2 ml-5">
                          <ChevronRight className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-red-700">Clique em "Ativar" ou "Aprovar"</span>
                        </div>
                      </div>
                    </li>
                    <li>
                      <strong className="text-green-700">Volte aqui e clique em "Conectar com o Bling Agora!"</strong>
                    </li>
                  </ol>
                </div>

                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-xs">
                  <p className="font-semibold text-yellow-900 mb-1">💡 Por que isso acontece?</p>
                  <p className="text-yellow-800">
                    Quando você cria uma aplicação no Bling, ela começa como "Pendente". 
                    Você precisa <strong>ativá-la manualmente</strong> antes de poder conectar.
                  </p>
                </div>

                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-xs">
                  <p className="font-semibold text-blue-900 mb-1">🔍 Não encontrou o botão "Ativar"?</p>
                  <p className="text-blue-800">
                    Verifique se você é <strong>administrador</strong> da conta do Bling. 
                    Apenas administradores podem ativar aplicações de API.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* STATUS DA CONEXÃO */}
        {blingConnected && (
          <Card className="mb-8 shadow-lg border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-green-900 mb-1">
                    ✅ Conectado com Sucesso!
                  </h3>
                  <p className="text-green-700">
                    Sua conta do Bling está conectada. Você já pode exportar produtos!
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={connectWithBling}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Reconectar
                  </Button>
                  <Button
                    onClick={disconnectFromBling}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Desconectar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GUIA PASSO A PASSO */}
        {!blingConnected && (
          <Card className="shadow-xl border-blue-200 mb-8">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Zap className="w-7 h-7" />
                Guia Completo: Como Conectar o Bling
              </CardTitle>
              <p className="text-blue-100 mt-2">
                Não se preocupe! É mais fácil do que parece. Siga cada passo com calma 😊
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {/* PASSO 1 */}
                <AccordionItem value="step-1" className="border-2 border-blue-100 rounded-lg mb-4 px-4">
                  <AccordionTrigger className="text-lg font-semibold text-blue-900 hover:text-blue-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <span>Acessar Configurações do Bling</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <p className="text-slate-700 mb-3">
                        <strong>1.1.</strong> Abra o Bling no seu navegador e faça login
                      </p>
                      <p className="text-slate-700 mb-3">
                        <strong>1.2.</strong> No menu superior, clique no <strong>ícone de engrenagem ⚙️</strong> (Configurações)
                      </p>
                      <p className="text-slate-700 mb-3">
                        <strong>1.3.</strong> No menu lateral, procure por <strong>"Integrações"</strong> ou <strong>"API"</strong>
                      </p>
                      <p className="text-slate-700 mb-4">
                        <strong>1.4.</strong> Clique em <strong>"Configurações de API para desenvolvedores"</strong>
                      </p>
                      
                      <div className="bg-white rounded-lg p-4 border border-blue-300 mb-3">
                        <p className="text-sm font-semibold text-blue-900 mb-2">💡 Ou use este link direto:</p>
                        <div className="flex gap-2">
                          <Input
                            value="https://www.bling.com.br/configuracoes.php#/aplicacoes"
                            readOnly
                            className="font-mono text-xs flex-1"
                          />
                          <Button
                            onClick={() => copyToClipboard("https://www.bling.com.br/configuracoes.php#/aplicacoes")}
                            variant="outline"
                            size="sm"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <a
                            href="https://www.bling.com.br/configuracoes.php#/aplicacoes"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Abrir
                            </Button>
                          </a>
                        </div>
                      </div>

                      {/* ÁREA RESERVADA PARA IMAGEM */}
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 border-2 border-dashed border-gray-400 text-center">
                        <Info className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">
                          📸 <strong>Imagem de exemplo:</strong> Menu do Bling mostrando o caminho até "Configurações de API"
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* PASSO 2 */}
                <AccordionItem value="step-2" className="border-2 border-green-100 rounded-lg mb-4 px-4">
                  <AccordionTrigger className="text-lg font-semibold text-green-900 hover:text-green-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <span>Criar Nova Aplicação</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <p className="text-slate-700 mb-3">
                        <strong>2.1.</strong> Na página de "Aplicações", procure o botão <strong>"+ Nova Aplicação"</strong>
                      </p>
                      <p className="text-slate-700 mb-4">
                        <strong>2.2.</strong> Clique nele para abrir o formulário
                      </p>

                      {/* ÁREA RESERVADA PARA IMAGEM */}
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 border-2 border-dashed border-gray-400 text-center mb-4">
                        <Info className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">
                          📸 <strong>Imagem de exemplo:</strong> Botão "+ Nova Aplicação" destacado na tela do Bling
                        </p>
                      </div>

                      <Alert className="bg-green-100 border-green-300">
                        <CheckCircle className="w-4 h-4 text-green-700" />
                        <AlertDescription className="text-green-800">
                          💡 <strong>Dica:</strong> O botão "+ Nova Aplicação" geralmente fica no canto superior direito da página
                        </AlertDescription>
                      </Alert>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* PASSO 3 */}
                <AccordionItem value="step-3" className="border-2 border-purple-100 rounded-lg mb-4 px-4">
                  <AccordionTrigger className="text-lg font-semibold text-purple-900 hover:text-purple-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <span>Preencher os Dados da Aplicação</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                      <p className="text-slate-700 mb-4 font-semibold">
                        Preencha o formulário com estes dados EXATOS:
                      </p>

                      <div className="space-y-4">
                        {/* Campo 1: Nome */}
                        <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                          <Label className="text-base font-bold text-purple-900 mb-2 block">
                            📝 Campo 1: Nome da Aplicação
                          </Label>
                          <div className="flex gap-2 mb-2">
                            <Input
                              value="ProductGen Base44"
                              readOnly
                              className="font-semibold text-lg"
                            />
                            <Button
                              onClick={() => copyToClipboard("ProductGen Base44")}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-slate-600">
                            ℹ️ Este é o nome que aparecerá no Bling. Você pode usar este ou escolher outro.
                          </p>
                        </div>

                        {/* Campo 2: URL de Redirecionamento */}
                        <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                          <Label className="text-base font-bold text-purple-900 mb-2 block">
                            🔗 Campo 2: URL de Redirecionamento
                          </Label>
                          <div className="flex gap-2 mb-2">
                            <Input
                              value={`${window.location.origin}/BlingCallback`}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              onClick={() => copyToClipboard(`${window.location.origin}/BlingCallback`)}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <Alert className="bg-red-50 border-red-300 mt-2">
                            <AlertCircle className="w-4 h-4 text-red-700" />
                            <AlertDescription className="text-red-800 text-xs">
                              ⚠️ <strong>ATENÇÃO:</strong> Copie este endereço EXATAMENTE como está! Se errar, a conexão não funcionará.
                            </AlertDescription>
                          </Alert>
                        </div>

                        {/* Campo 3: Escopos */}
                        <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                          <Label className="text-base font-bold text-purple-900 mb-2 block">
                            ✅ Campo 3: Escopos (Permissões)
                          </Label>
                          <p className="text-slate-700 mb-3">
                            Marque <strong className="text-purple-700">TODAS as caixinhas</strong> que aparecerem
                          </p>
                          <div className="bg-purple-100 border border-purple-300 rounded p-3">
                            <p className="text-sm text-purple-900 font-semibold">
                              💡 Por que marcar todas?
                            </p>
                            <p className="text-xs text-purple-800 mt-1">
                              Isso garante que o ProductGen tenha permissão para criar e editar produtos, adicionar imagens, etc.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ÁREA RESERVADA PARA IMAGEM */}
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 border-2 border-dashed border-gray-400 text-center mt-4">
                        <Info className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">
                          📸 <strong>Imagem de exemplo:</strong> Formulário do Bling preenchido com os campos acima destacados
                        </p>
                      </div>

                      <div className="mt-4 bg-purple-100 border-2 border-purple-300 rounded-lg p-4">
                        <p className="text-purple-900 font-semibold mb-2">
                          ✅ Depois de preencher tudo, clique em <strong>"Salvar"</strong> ou <strong>"Criar Aplicação"</strong>
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* PASSO 4 */}
                <AccordionItem value="step-4" className="border-2 border-amber-100 rounded-lg mb-4 px-4">
                  <AccordionTrigger className="text-lg font-semibold text-amber-900 hover:text-amber-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                        4
                      </div>
                      <span>Copiar Client ID e Client Secret</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                      <p className="text-slate-700 mb-4">
                        Depois de salvar a aplicação, o Bling vai mostrar dois códigos importantes:
                      </p>

                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-4 border-2 border-amber-300">
                          <p className="font-bold text-amber-900 mb-2">🔑 Client ID</p>
                          <p className="text-sm text-slate-600 mb-2">
                            É um código que começa com letras e números (ex: abc123def456)
                          </p>
                          <Alert className="bg-amber-100 border-amber-300">
                            <Info className="w-4 h-4 text-amber-700" />
                            <AlertDescription className="text-amber-800 text-xs">
                              💡 Copie este código e guarde (vamos precisar dele no próximo passo)
                            </AlertDescription>
                          </Alert>
                        </div>

                        <div className="bg-white rounded-lg p-4 border-2 border-amber-300">
                          <p className="font-bold text-amber-900 mb-2">🔐 Client Secret</p>
                          <p className="text-sm text-slate-600 mb-2">
                            É outro código, geralmente maior e mais complexo
                          </p>
                          <Alert className="bg-red-50 border-red-300">
                            <AlertCircle className="w-4 h-4 text-red-700" />
                            <AlertDescription className="text-red-800 text-xs">
                              ⚠️ <strong>IMPORTANTE:</strong> Este código aparece UMA VEZ SÓ! Copie e guarde com cuidado.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>

                      {/* ÁREA RESERVADA PARA IMAGEM */}
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 border-2 border-dashed border-gray-400 text-center mt-4">
                        <Info className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">
                          📸 <strong>Imagem de exemplo:</strong> Tela do Bling mostrando onde encontrar o Client ID e Client Secret
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* PASSO 5 */}
                <AccordionItem value="step-5" className="border-2 border-blue-100 rounded-lg mb-4 px-4">
                  <AccordionTrigger className="text-lg font-semibold text-blue-900 hover:text-blue-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        5
                      </div>
                      <span>Colar os Códigos no ProductGen</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <p className="text-slate-700 mb-4 font-semibold">
                        Agora vamos colar os códigos que você copiou:
                      </p>

                      {!showOAuthSetup ? (
                        <Button
                          onClick={() => setShowOAuthSetup(true)}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6 text-lg shadow-lg"
                        >
                          <Key className="w-6 h-6 mr-2" />
                          👉 Clicar Aqui para Colar os Códigos
                        </Button>
                      ) : (
                        <div className="space-y-4 bg-white border-2 border-blue-300 rounded-lg p-5">
                          <div>
                            <Label className="text-base font-bold text-blue-900 mb-2 block">
                              🔑 Client ID (cole aqui):
                            </Label>
                            <Input
                              value={blingClientId}
                              onChange={(e) => setBlingClientId(e.target.value)}
                              placeholder="Cole o Client ID que você copiou do Bling..."
                              className="font-mono text-sm"
                              disabled={isSaving}
                            />
                          </div>

                          <div>
                            <Label className="text-base font-bold text-blue-900 mb-2 block">
                              🔐 Client Secret (cole aqui):
                            </Label>
                            <Input
                              type="password"
                              value={blingClientSecret}
                              onChange={(e) => setBlingClientSecret(e.target.value)}
                              placeholder="Cole o Client Secret que você copiou do Bling..."
                              className="font-mono text-sm"
                              disabled={isSaving}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              🔒 O texto fica oculto por segurança
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={saveOAuthCredentials}
                              disabled={isSaving || !blingClientId.trim() || !blingClientSecret.trim()}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 font-semibold text-lg py-6"
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Salvando...
                                </>
                              ) : (
                                <>
                                  <Save className="w-5 h-5 mr-2" />
                                  Salvar Credenciais
                                </>
                              )}
                            </Button>

                            <Button
                              onClick={() => setShowOAuthSetup(false)}
                              variant="outline"
                              disabled={isSaving}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* PASSO 6 */}
                {blingClientId && blingClientSecret && !showOAuthSetup && (
                  <AccordionItem value="step-6" className="border-2 border-green-100 rounded-lg px-4">
                    <AccordionTrigger className="text-lg font-semibold text-green-900 hover:text-green-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                          6
                        </div>
                        <span>⚠️ ATIVE a Aplicação no Bling (Importante!)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <Alert className="mb-4 bg-red-50 border-red-300">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <AlertDescription className="text-red-800">
                            <strong className="text-lg">⚠️ PASSO OBRIGATÓRIO:</strong> Antes de clicar em "Conectar", você DEVE ativar a aplicação no Bling!
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                          <p className="text-slate-700 font-semibold">
                            🔧 Siga estes passos NO BLING:
                          </p>
                          
                          <ol className="list-decimal list-inside space-y-3 ml-2 text-sm">
                            <li>
                              <strong>Abra o Bling em outra aba:</strong>{' '}
                              <a
                                href="https://www.bling.com.br/configuracoes.php#/aplicacoes"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline font-semibold inline-flex items-center gap-1"
                              >
                                Clique aqui
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </li>
                            <li>
                              <strong>Encontre a aplicação "ProductGen Base44"</strong> na lista
                            </li>
                            <li>
                              <strong>Clique nela</strong> para abrir os detalhes
                            </li>
                            <li>
                              <strong className="text-red-700">Procure por um campo "Status" ou "Situação"</strong>
                              <div className="mt-2 ml-4 space-y-2 bg-yellow-50 border border-yellow-200 rounded p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                                  <span className="font-semibold">Se estiver "Pendente" ou "Inativa":</span>
                                </div>
                                <div className="flex items-center gap-2 ml-6">
                                  <ChevronRight className="w-5 h-5 text-red-600" />
                                  <span className="text-red-700 font-bold">Clique em "Ativar" ou "Aprovar"</span>
                                </div>
                              </div>
                            </li>
                            <li>
                              <strong className="text-green-700">Volte aqui e clique no botão verde abaixo</strong>
                            </li>
                          </ol>
                        </div>

                        <Button
                          onClick={connectWithBling}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-8 text-xl shadow-xl mt-6"
                        >
                          <CheckCircle className="w-7 h-7 mr-3" />
                          ✅ Conectar com o Bling Agora!
                        </Button>

                        <Alert className="mt-4 bg-green-100 border-green-300">
                          <Info className="w-4 h-4 text-green-700" />
                          <AlertDescription className="text-green-800 text-sm">
                            <strong>O que vai acontecer:</strong>
                            <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                              <li>Você será redirecionado para o site do Bling</li>
                              <li>O Bling vai pedir para confirmar a autorização</li>
                              <li>Depois de confirmar, você voltará automaticamente para cá</li>
                              <li>Pronto! Tudo conectado! 🎊</li>
                            </ol>
                          </AlertDescription>
                        </Alert>

                        <Alert className="mt-4 bg-blue-50 border-blue-200">
                          <Info className="w-4 h-4 text-blue-600" />
                          <AlertDescription className="text-blue-800 text-xs">
                            <strong>💡 Dica:</strong> Mantenha a aba do Bling aberta em segundo plano. 
                            Se der erro "FORBIDDEN", volte lá e verifique se a aplicação foi realmente ativada.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* CARD FINAL - DEPOIS DE CONECTAR */}
        <Card className="shadow-md border-slate-200">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              O Que Fazer Depois de Conectar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 text-sm text-slate-700">
              <p className="font-semibold text-base text-slate-900 mb-3">
                Após conectar o Bling, você poderá:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[20px]">1.</span>
                  <span>Ir para <strong>"Gerar Produtos"</strong> e criar produtos automaticamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[20px]">2.</span>
                  <span>Ir para <strong>"Meus Produtos"</strong> e ver seus produtos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[20px]">3.</span>
                  <span>Clicar em <strong>"Exportar para Bling"</strong> e os produtos irão direto pro Bling COM IMAGENS! 🎉</span>
                </li>
              </ol>
              
              <Alert className="mt-4 bg-blue-50 border-blue-200">
                <Zap className="w-4 h-4 text-blue-700" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>💡 Dica:</strong> Todos os produtos criados aqui são enviados automaticamente para o Bling com título, descrição, preço, dimensões E imagens otimizadas!
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* AJUDA EXTRA */}
        <Card className="mt-6 shadow-md border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-lg mb-2">
                  ❓ Está com Dúvidas?
                </h4>
                <p className="text-amber-800 text-sm">
                  Se tiver alguma dificuldade em qualquer passo, abra o Console do navegador (tecla F12) e procure por mensagens de erro, ou entre em contato com o suporte.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
