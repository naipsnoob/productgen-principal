
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Copy, CheckCircle, Loader2, ExternalLink, X, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TestImageURL() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [progress, setProgress] = useState(0);

  // ✅ NOVO: Estado para teste de URL externa
  const [externalUrl, setExternalUrl] = useState("");
  const [testingUrl, setTestingUrl] = useState(false);
  const [urlTestResult, setUrlTestResult] = useState(null);

  // ✅ FUNÇÃO OTIMIZADA: Redimensionar E COMPRIMIR para máximo 3MB (limite do Bling)
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1200;
          canvas.height = 1200;
          
          const ctx = canvas.getContext('2d');
          
          // Calcular dimensões para manter proporção e preencher o quadrado
          const scale = Math.max(1200 / img.width, 1200 / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const offsetX = (1200 - scaledWidth) / 2;
          const offsetY = (1200 - scaledHeight) / 2;
          
          // Fundo branco
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 1200, 1200);
          
          // Desenhar imagem centralizada
          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
          
          // ✅ COMPRESSÃO PROGRESSIVA ATÉ FICAR < 3MB
          let quality = 0.9;
          let blob = null;
          let attempts = 0;
          const MAX_SIZE = 3 * 1024 * 1024;
          
          console.log(`📏 Comprimindo imagem: ${file.name}`);
          
          while (attempts < 10) {
            blob = await new Promise((resolveBlob) => {
              canvas.toBlob(resolveBlob, 'image/jpeg', quality);
            });
            
            if (!blob) {
              console.error('❌ Falha ao criar blob');
              reject(new Error('Failed to create blob from canvas.'));
              return;
            }
            
            const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
            console.log(`   Tentativa ${attempts + 1}: ${sizeMB}MB (qualidade ${(quality * 100).toFixed(0)}%)`);
            
            if (blob.size <= MAX_SIZE) {
              console.log(`✅ Imagem optimizada: ${sizeMB}MB (qualidade ${(quality * 100).toFixed(0)}%)`);
              break;
            }
            
            quality = Math.max(0.3, quality - 0.1);
            attempts++;
            
            if (quality === 0.3 && blob.size > MAX_SIZE && attempts >= 1) {
              console.warn(`⚠️ Qualidade mínima atingida (30%), mantendo mesmo acima de 3MB. Tentativa ${attempts + 1}`);
              break;
            }
          }
          
          if (blob.size > MAX_SIZE) {
            const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
            console.warn(`⚠️ AVISO: Imagem ainda está com ${sizeMB}MB (acima de 3MB), mas será usada mesmo assim`);
          }
          
          const finalSizeMB = (blob.size / 1024 / 1024).toFixed(2);
          resolve(new File([blob], file.name, { type: 'image/jpeg', size: blob.size, finalSize: finalSizeMB }));
        };
        img.onerror = (err) => {
          reject(new Error("Failed to load image for resizing."));
        };
        img.src = e.target.result;
      };
      reader.onerror = (err) => {
        reject(new Error("Failed to read file for resizing."));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      const urls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(urls);
      setUploadedImages([]);
    }
  };

  const removeImage = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  // ✅ FUNÇÃO: Converter File para Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadImages = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    const results = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        console.log(`\n📏 Processando imagem ${i + 1}/${files.length}: ${file.name}`);
        
        const resizedFile = await resizeImage(file);
        const sizeMB = (resizedFile.size / 1024 / 1024).toFixed(2);
        
        console.log(`✅ Imagem otimizada: ${sizeMB}MB`);
        console.log(`📤 Enviando para imgbb...`);
        
        // ✅ CONVERTER PARA BASE64
        const base64Image = await fileToBase64(resizedFile);
        const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        
        // ✅ ENVIAR COMO JSON
        const result = await base44.functions.invoke('imgbbUpload', {
          imageBase64: base64Image,
          fileName: fileName
        });
        
        const data = result.data || result;
        
        if (data.success && data.file_url) {
          results.push({
            originalName: file.name,
            url: data.file_url,
            preview: previews[i],
            size: sizeMB
          });
          console.log(`✅ Imagem ${i + 1} no imgbb (URL direta):`, data.file_url);
        } else {
          console.error(`❌ Erro: ${data.error}`);
        }
        
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setUploadedImages(results);
    } catch (err) {
      alert(`❌ Erro: ${err.message}`);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // ✅ NOVA FUNÇÃO: Testar URL externa
  const testExternalUrl = async () => {
    if (!externalUrl.trim()) {
      alert("Por favor, cole uma URL de imagem");
      return;
    }

    setTestingUrl(true);
    setUrlTestResult(null);

    try {
      console.log(`\n🔗 Testando URL externa: ${externalUrl}`);
      
      let imageUrl = externalUrl.trim();
      
      if (imageUrl.includes('ibb.co/') && !imageUrl.includes('/i.ibb.co/')) {
        console.log('📋 Link do imgbb detectado, extraindo URL real da imagem...');
        
        const extractResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Extraia a URL DIRETA da imagem desta página do imgbb: ${imageUrl}

A URL direta geralmente está em:
- Tag <img> com src contendo i.ibb.co
- Meta tag og:image
- Link de download direto

Retorne APENAS a URL HTTPS da imagem, sem texto adicional.`,
          add_context_from_internet: true
        });
        
        if (typeof extractResult === 'string' && extractResult.includes('https://')) {
          imageUrl = extractResult.trim();
          console.log(`✅ URL real extraída: ${imageUrl}`);
        }
      }

      if (!imageUrl.startsWith('https://')) {
        setUrlTestResult({
          success: false,
          error: '❌ URL não é HTTPS. O Bling aceita apenas URLs HTTPS.',
          url: imageUrl
        });
        setTestingUrl(false);
        return;
      }

      console.log(`✅ URL é HTTPS`);
      console.log(`📥 Baixando imagem...`);
      
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        setUrlTestResult({
          success: false,
          error: `❌ Não foi possível acessar a imagem (HTTP ${response.status})`,
          url: imageUrl
        });
        setTestingUrl(false);
        return;
      }

      const blob = await response.blob();
      const originalSizeMB = (blob.size / 1024 / 1024).toFixed(2);
      
      console.log(`✅ Imagem baixada: ${originalSizeMB}MB`);
      console.log(`🔧 Redimensionando e comprimindo para 1200x1200...`);
      
      const file = new File([blob], `imagem-externa-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
      const resizedFile = await resizeImage(file);
      const finalSizeMB = (resizedFile.size / 1024 / 1024).toFixed(2);
      
      console.log(`✅ Imagem otimizada: ${finalSizeMB}MB`);
      console.log(`📤 Fazendo upload para imgbb...`);
      
      // ✅ CONVERTER PARA BASE64
      const base64Image = await fileToBase64(resizedFile);
      
      // ✅ ENVIAR COMO JSON
      const uploadResult = await base44.functions.invoke('imgbbUpload', {
        imageBase64: base64Image,
        fileName: `imagem-externa-${Date.now()}.jpg`
      });
      
      const uploadData = uploadResult.data || uploadResult;

      if (uploadData.success && uploadData.file_url) {
        console.log(`✅ Upload concluído no imgbb: ${uploadData.file_url}`);
        
        setUrlTestResult({
          success: true,
          originalUrl: externalUrl,
          extractedUrl: imageUrl,
          finalUrl: uploadData.file_url,
          originalSize: originalSizeMB,
          finalSize: finalSizeMB,
          preview: URL.createObjectURL(resizedFile)
        });
      } else {
        setUrlTestResult({
          success: false,
          error: `❌ Falha no upload para imgbb: ${uploadData.error}`,
          url: imageUrl
        });
      }

    } catch (err) {
      console.error('❌ Erro ao testar URL:', err);
      setUrlTestResult({
        success: false,
        error: `❌ Erro: ${err.message}`,
        url: externalUrl
      });
    } finally {
      setTestingUrl(false);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
  };

  const copyAllUrls = () => {
    const allUrls = uploadedImages.map(img => img.url).join('\n');
    navigator.clipboard.writeText(allUrls);
  };

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🧪 Teste de URL de Imagem
          </h1>
          <p className="text-slate-600">
            Faça upload de imagens OU teste URLs externas (ex: imgbb, imgur)
          </p>
        </div>

        {/* ✅ NOVO: Tabs para alternar entre upload e URL externa */}
        <Tabs defaultValue="upload" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload Local
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="w-4 h-4 mr-2" />
              URL Externa
            </TabsTrigger>
          </TabsList>

          {/* Upload Local */}
          <TabsContent value="upload">
            <Card className="shadow-md border-slate-200 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload de Teste (Múltiplas Imagens)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-images">Selecione múltiplas imagens</Label>
                  <Input
                    id="test-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="mt-2"
                    disabled={uploading}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    ✅ Todas as imagens serão redimensionadas para 1200x1200 e comprimidas para <strong>máximo 3MB</strong>. Hospedadas no <strong>imgbb</strong> com URLs diretas.
                  </p>
                </div>

                {previews.length > 0 && (
                  <div className="space-y-3">
                    <Label>Imagens selecionadas ({previews.length}):</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previews.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            disabled={uploading}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={uploadImages}
                      disabled={uploading}
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Otimizando e gerando URLs... {progress}%
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Otimizar e Gerar URLs ({previews.length} {previews.length === 1 ? 'imagem' : 'imagens'})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✅ NOVO: Teste de URL Externa */}
          <TabsContent value="url">
            <Card className="shadow-md border-slate-200 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Testar URL Externa (imgbb, imgur, etc)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="external-url">Cole a URL da imagem ou página</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="external-url"
                      type="url"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://ibb.co/WvgD5f6 ou https://i.ibb.co/xxx/image.jpg"
                      disabled={testingUrl}
                      className="flex-1"
                    />
                    <Button
                      onClick={testExternalUrl}
                      disabled={testingUrl || !externalUrl.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {testingUrl ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Testar URL
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    🔗 Suporta imgbb, imgur e outras URLs diretas de imagem. A imagem será baixada, otimizada (1200x1200, {'<'}3MB) e hospedada no <strong>imgbb</strong>.
                  </p>
                </div>

                {/* ✅ RESULTADO DO TESTE */}
                {urlTestResult && (
                  <div className="mt-6">
                    {urlTestResult.success ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <div className="space-y-4">
                            <div>
                              <strong>✅ Sucesso! Imagem processada e hospedada no imgbb</strong>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <img
                                  src={urlTestResult.preview}
                                  alt="Imagem processada"
                                  className="w-full h-48 object-cover rounded-lg border-2 border-green-300"
                                />
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <strong>📊 Tamanho Original:</strong> {urlTestResult.originalSize}MB
                                </div>
                                <div>
                                  <strong>📊 Tamanho Final:</strong> {urlTestResult.finalSize}MB
                                  {parseFloat(urlTestResult.finalSize) <= 3 ? ' ✅' : ' ⚠️'}
                                </div>
                                <div>
                                  <strong>📐 Dimensões:</strong> 1200x1200px
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <Label className="text-green-900 text-xs">URL Original (que você colou):</Label>
                                <Input
                                  value={urlTestResult.originalUrl}
                                  readOnly
                                  className="font-mono text-xs mt-1"
                                />
                              </div>

                              {urlTestResult.extractedUrl !== urlTestResult.originalUrl && (
                                <div>
                                  <Label className="text-green-900 text-xs">URL Extraída (link direto):</Label>
                                  <Input
                                    value={urlTestResult.extractedUrl}
                                    readOnly
                                    className="font-mono text-xs mt-1"
                                  />
                                </div>
                              )}

                              <div>
                                <Label className="text-green-900 text-xs font-bold">✅ URL FINAL (use esta no Bling!):</Label>
                                <div className="flex gap-2 mt-1">
                                  <Input
                                    value={urlTestResult.finalUrl}
                                    readOnly
                                    className="font-mono text-xs flex-1 bg-white"
                                  />
                                  <Button
                                    onClick={() => copyToClipboard(urlTestResult.finalUrl)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <a
                                    href={urlTestResult.finalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-slate-200 rounded-md hover:bg-slate-50"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-xs">
                              <strong>💡 Próximos Passos:</strong>
                              <ol className="list-decimal list-inside mt-2 space-y-1">
                                <li>Copie a URL FINAL acima</li>
                                <li>Use no Bling ou no Gerar Produtos</li>
                                <li>A imagem está otimizada (1200x1200, {'<'}3MB, HTTPS)</li>
                                <li><strong>✅ URL abre direto no navegador (não faz download)</strong></li>
                              </ol>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertDescription className="text-red-800">
                          <div className="space-y-2">
                            <div>
                              <strong>{urlTestResult.error}</strong>
                            </div>
                            {urlTestResult.url && (
                              <div className="text-xs">
                                <strong>URL testada:</strong> {urlTestResult.url}
                              </div>
                            )}
                            <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-xs mt-3">
                              <strong>💡 Dicas:</strong>
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Certifique-se que a URL começa com https://</li>
                                <li>Para imgbb: use o link da PÁGINA (https://ibb.co/xxx) OU o link DIRETO (https://i.ibb.co/xxx/image.jpg)</li>
                                <li>A imagem deve estar acessível publicamente</li>
                              </ul>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resultados de Upload Local */}
        {uploadedImages.length > 0 && (
          <>
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ {uploadedImages.length} {uploadedImages.length === 1 ? 'URL pública gerada' : 'URLs públicas geradas'} com sucesso!
              </AlertDescription>
            </Alert>

            <Card className="shadow-md border-slate-200 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-green-600" />
                    URLs Públicas Geradas ({uploadedImages.length})
                  </CardTitle>
                  <Button
                    onClick={copyAllUrls}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-4">
                      <img
                        src={image.preview}
                        alt={image.originalName}
                        className="w-20 h-20 object-cover rounded border-2 border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 mb-1">
                          Imagem {index + 1}: {image.originalName}
                        </p>
                        <p className="text-xs text-slate-500 mb-2">
                          ✅ Otimizada: 1200x1200 • {image.size}MB {parseFloat(image.size) <= 3 ? '(✅ Aceito pelo Bling)' : '(⚠️ Acima de 3MB)'} • <strong>URL direta (abre no navegador)</strong>
                        </p>
                        <div className="flex gap-2">
                          <Input
                            value={image.url}
                            readOnly
                            className="font-mono text-xs flex-1"
                          />
                          <Button
                            onClick={() => copyToClipboard(image.url)}
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <a
                            href={image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-slate-200 rounded-md hover:bg-slate-50"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Instruções */}
        <Card className="shadow-md border-slate-200">
          <CardContent className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                📋 Como usar:
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li><strong>Upload Local:</strong> Para suas próprias imagens (computador)</li>
                <li><strong>URL Externa:</strong> Para testar links de imgbb, imgur, etc</li>
                <li>As imagens sempre serão otimizadas para 1200x1200 e {'<'}3MB</li>
                <li><strong>Hospedadas no imgbb com URLs diretas</strong> (abrem no navegador, não fazem download)</li>
                <li>Use as URLs geradas no Bling ou em Gerar Produtos</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
