import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export default function BlingCallbackPage() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Conectando com o Bling...');
  const [details, setDetails] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🔗 CALLBACK DO BLING RECEBIDO');
      console.log('═══════════════════════════════════════════════════════\n');

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      console.log('📋 Parâmetros recebidos:');
      console.log(`   Code: ${code ? code.substring(0, 20) + '...' : 'AUSENTE'}`);
      console.log(`   State: ${state || 'AUSENTE'}`);
      console.log(`   Error: ${error || 'AUSENTE'}`);
      console.log(`   Error Description: ${errorDescription || 'AUSENTE'}`);

      setDebugInfo({
        code: code ? code.substring(0, 30) + '...' : null,
        state,
        error,
        errorDescription,
        url: window.location.href
      });

      if (error) {
        console.error(`❌ ERRO RETORNADO PELO BLING: ${error}`);
        console.error(`   Descrição: ${errorDescription}`);
        
        setStatus('error');
        setMessage(`Erro na autorização: ${errorDescription || error}`);
        
        setDetails(
          `O Bling retornou um erro durante a autorização.\n\n` +
          `Erro: ${error}\n` +
          `Descrição: ${errorDescription || 'Não fornecida'}\n\n` +
          `Por favor, tente conectar novamente em Configurações.`
        );
        return;
      }

      if (!code) {
        console.error('❌ CÓDIGO DE AUTORIZAÇÃO NÃO RECEBIDO');
        
        setStatus('error');
        setMessage('Código de autorização não recebido');
        setDetails(
          'O Bling não retornou o código de autorização.\n\n' +
          'Isso pode acontecer se:\n' +
          '1. Você cancelou a autorização no Bling\n' +
          '2. Houve um erro na comunicação\n' +
          '3. A URL de redirecionamento está incorreta\n\n' +
          'Tente conectar novamente em Configurações.'
        );
        return;
      }

      console.log('\n📝 Buscando dados do usuário...');
      const user = await base44.auth.me();
      
      console.log('✅ Usuário autenticado:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Client ID configurado: ${user.bling_client_id ? 'SIM' : 'NÃO'}`);
      console.log(`   Client Secret configurado: ${user.bling_client_secret ? 'SIM' : 'NÃO'}`);

      if (!user.bling_client_id || !user.bling_client_secret) {
        console.error('❌ CREDENCIAIS DO BLING NÃO CONFIGURADAS');
        
        setStatus('error');
        setMessage('Credenciais do Bling não configuradas');
        setDetails(
          'Client ID ou Client Secret não estão configurados.\n\n' +
          'Vá em Configurações e configure suas credenciais primeiro.'
        );
        return;
      }

      console.log('\n🔄 Trocando código por token...');
      setMessage('Trocando código por token de acesso...');

      const result = await base44.functions.invoke('bling', {
        function: 'exchangeCodeForToken',
        code: code,
        clientId: user.bling_client_id,
        clientSecret: user.bling_client_secret
      });

      console.log('\n📥 Resposta da função backend:');
      console.log(JSON.stringify(result, null, 2));

      const data = result.data || result;

      if (!data.success) {
        console.error('\n❌ ERRO AO TROCAR CÓDIGO POR TOKEN:');
        console.error(JSON.stringify(data, null, 2));
        
        setStatus('error');
        setMessage('Erro ao obter token de acesso');
        
        let errorDetails = data.error || 'Erro desconhecido';
        
        // ✅ ADICIONAR INFORMAÇÕES DE DEBUG
        if (data.status) {
          errorDetails += `\n\nHTTP Status: ${data.status}`;
        }
        if (data.raw_response) {
          errorDetails += `\n\nResposta do Bling:\n${data.raw_response.substring(0, 500)}`;
        }
        if (data.error_type) {
          errorDetails += `\n\nTipo de erro: ${data.error_type}`;
        }
        if (data.error_details) {
          errorDetails += `\n\nDetalhes: ${data.error_details}`;
        }
        
        setDetails(errorDetails);
        return;
      }

      console.log('\n✅ TOKEN OBTIDO COM SUCESSO!');
      console.log(`   Access Token: ${data.access_token.substring(0, 20)}...`);
      console.log(`   Refresh Token: ${data.refresh_token ? data.refresh_token.substring(0, 20) + '...' : 'AUSENTE'}`);
      console.log(`   Expira em: ${data.expires_in} segundos (${(data.expires_in / 3600).toFixed(1)}h)`);

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 21600));

      console.log('\n💾 Salvando tokens no perfil do usuário...');
      setMessage('Salvando credenciais...');

      await base44.auth.updateMe({
        bling_access_token: data.access_token,
        bling_refresh_token: data.refresh_token,
        bling_token_expires_at: expiresAt.toISOString(),
        bling_connected: true
      });

      console.log('✅ Tokens salvos com sucesso!');
      console.log(`   Expira em: ${expiresAt.toISOString()}`);

      setStatus('success');
      setMessage('Conectado com sucesso ao Bling! 🎉');
      setDetails(
        `✅ Sua conta está conectada!\n\n` +
        `📊 Detalhes:\n` +
        `• Token válido por ${(data.expires_in / 3600).toFixed(1)} horas\n` +
        `• Expira em: ${expiresAt.toLocaleString('pt-BR')}\n` +
        `• Scope: ${data.scope || 'Todos os escopos'}\n\n` +
        `Redirecionando para Configurações...`
      );

      console.log('\n✅ PROCESSO CONCLUÍDO COM SUCESSO!');
      console.log('═'.repeat(70) + '\n');

      setTimeout(() => {
        window.location.href = createPageUrl('Settings');
      }, 3000);

    } catch (err) {
      console.error('\n❌ EXCEÇÃO NO CALLBACK:');
      console.error(`   Tipo: ${err.name}`);
      console.error(`   Mensagem: ${err.message}`);
      console.error(`   Stack:`, err.stack);
      
      setStatus('error');
      setMessage('Erro inesperado ao conectar');
      setDetails(
        `Erro: ${err.message}\n\n` +
        `Tipo: ${err.name}\n\n` +
        `Se o problema persistir:\n` +
        `1. Verifique se suas credenciais estão corretas\n` +
        `2. Tente desconectar e reconectar\n` +
        `3. Abra o Console (F12) para mais detalhes`
      );
    }
  };

  const copyDebugInfo = () => {
    const info = JSON.stringify({
      status,
      message,
      details,
      debugInfo,
      timestamp: new Date().toISOString()
    }, null, 2);
    
    navigator.clipboard.writeText(info);
    alert('✅ Informações de debug copiadas para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {status === 'processing' && (
              <>
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
                <h2 className="text-2xl font-bold text-gray-900">{message}</h2>
                <p className="text-gray-600">Por favor, aguarde...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-green-900">{message}</h2>
                {details && (
                  <Alert className="bg-green-50 border-green-200 text-left">
                    <AlertDescription>
                      <pre className="whitespace-pre-wrap text-sm text-green-800 font-mono">
                        {details}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                <h2 className="text-2xl font-bold text-red-900">{message}</h2>
                {details && (
                  <Alert variant="destructive" className="text-left">
                    <AlertDescription>
                      <pre className="whitespace-pre-wrap text-sm font-mono max-h-96 overflow-y-auto">
                        {details}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* ✅ INFORMAÇÕES DE DEBUG */}
                {debugInfo && (
                  <Alert className="bg-gray-50 border-gray-200 text-left">
                    <AlertDescription>
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900">
                          🔍 Informações de Debug:
                        </p>
                        <Button
                          onClick={copyDebugInfo}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copiar
                        </Button>
                      </div>
                      <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono mt-2 max-h-48 overflow-y-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 justify-center mt-6">
                  <Button
                    onClick={() => window.location.href = createPageUrl('Settings')}
                    variant="outline"
                  >
                    Voltar para Configurações
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}