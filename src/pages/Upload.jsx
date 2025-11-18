import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Sparkles, CheckCircle, X, Image as ImageIcon, AlertCircle, Download, ExternalLink, Rocket, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function UploadPage() {
  const navigate = useNavigate();
  const [uploadMode, setUploadMode] = useState("manual");
  
  // Modo manual
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  // Modo Fornecedor
  const [fornecedorUrl, setFornecedorUrl] = useState("");
  const [fornecedorData, setFornecedorData] = useState(null);
  const [isExtractingFornecedor, setIsExtractingFornecedor] = useState(false);
  const [fornecedorFiles, setFornecedorFiles] = useState([]);
  const [fornecedorPreviewUrls, setFornecedorPreviewUrls] = useState([]);
  
  // Comum
  const [quantity, setQuantity] = useState(10);
  const [categoria, setCategoria] = useState("");
  const [nomeGrupo, setNomeGrupo] = useState("");
  const [marketplace, setMarketplace] = useState("todos");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState(""); // New state for progress message
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [productData, setProductData] = useState(null);

  // FUNÇÃO OTIMIZADA: Redimensionar E COMPRIMIR para máximo 3MB (limite do Bling)
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
          const scale = Math.min(1200 / img.width, 1200 / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const offsetX = (1200 - scaledWidth) / 2;
          const offsetY = (1200 - scaledHeight) / 2;
          
          // Fundo branco
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 1200, 1200);
          
          // Desenhar imagem centralizada
          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
          
          // COMPRESSÃO PROGRESSIVA ATÉ FICAR < 3MB
          let quality = 0.9; // Começar com 90% de qualidade
          let blob = null;
          let attempts = 0;
          const MAX_SIZE = 3 * 1024 * 1024; // 3MB em bytes
          
          console.log(`📏 Comprimindo imagem: ${file.name}`);
          
          while (attempts < 10) { // Limitar tentativas para evitar loop infinito
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
              console.log(`✅ Imagem otimizada: ${sizeMB}MB (qualidade ${(quality * 100).toFixed(0)}%)`);
              break;
            }
            
            // Reduzir qualidade em 10% a cada tentativa
            quality = Math.max(0.3, quality - 0.1); // Não ir abaixo de 0.3
            attempts++;
            
            if (quality <= 0.3 && blob.size > MAX_SIZE && attempts >= 9) { // Se atingiu qualidade mínima e ainda grande, pare
              console.warn(`⚠️ Qualidade mínima (30%) atingida. Imagem ainda acima de 3MB (${sizeMB}MB).`);
              break;
            }
          }
          
          if (blob.size > MAX_SIZE) {
            const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
            console.warn(`⚠️ AVISO: Imagem final com ${sizeMB}MB (acima de 3MB), mas será usada mesmo assim.`);
          }
          
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
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

  // NOVA FUNÇÃO: Converter File para Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove o prefixo "data:image/jpeg;base64,"
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      const urls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
      setError(null);
      
      if (!nomeGrupo && selectedFiles[0]) {
        const fileName = selectedFiles[0].name.split('.')[0];
        setNomeGrupo(fileName);
      }
    }
  };

  // Handler para imagens do fornecedor
  const handleFornecedorFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFornecedorFiles(selectedFiles);
      const urls = selectedFiles.map(file => URL.createObjectURL(file));
      setFornecedorPreviewUrls(urls);
      setError(null);
    }
  };

  const removeImage = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  // Remover imagem do fornecedor
  const removeFornecedorImage = (index) => {
    const newFiles = fornecedorFiles.filter((_, i) => i !== index);
    const newUrls = fornecedorPreviewUrls.filter((_, i) => i !== index);
    setFornecedorFiles(newFiles);
    setFornecedorPreviewUrls(newUrls);
  };

  // FUNÇÃO: Extrair dados de site de fornecedor
  const extractFromFornecedor = async () => {
    if (!fornecedorUrl.trim()) {
      setError("Por favor, cole o link do produto do fornecedor");
      return;
    }

    setIsExtractingFornecedor(true);
    setError(null);

    try {
      const prompt = `
Analise PROFUNDAMENTE esta página de produto e extraia TODAS as informações:

URL: ${fornecedorUrl}

**DADOS OBRIGATÓRIOS:**

1. **IDENTIFICAÇÃO:** Título, Marca, Modelo, SKU, EAN/GTIN
2. **DESCRIÇÃO:** Completa com características, materiais e funcionalidades
3. **DIMENSÕES (cm):** Largura, Altura, Profundidade (números > 0)
4. **PESO (kg):** Líquido e Bruto (números > 0, bruto > líquido)
5. **FISCAL:** NCM (8 dígitos), CEST (7 dígitos ou null), Origem (0-8)
6. **COMERCIAL:** 
   - **preco_custo**: Preço DE CUSTO do fornecedor (OBRIGATÓRIO - o preço que você paga ao fornecedor)
   - Condição (Novo/Usado)

**CATEGORIZAÇÃO (BASEADA NO PRODUTO):**

**A) departamento_fornecedor:** Categoria EXATA do site (ex: "Casa e Construção")

**B) categoria_mercado_livre:** Use o padrão do ML com hierarquia:
- Produtos de casa: "Casa, Móveis e Decoração > [Sub] > [Item]"
- Beleza: "Beleza e Cuidado Pessoal > [Sub] > [Item]"
- Moda: "Roupas e Acessórios > [Gênero] > [Sub]"
- Eletrônicos: "Eletrônicos, Áudio e Vídeo > [Sub]"
- Ferramentas: "Ferramentas > [Sub]"
- Brinquedos: "Brinquedos e Hobbies > [Sub]"
- Esportes: "Esportes e Fitness > [Sub]"

**C) categoria_magalu:** Use o padrão da Magalu/Shopee:
- Casa: "Casa e Construção > [Sub]"
- Beleza: "Beleza e Perfumaria > [Sub]"
- Moda: "Moda > [Gênero] > [Sub]"
- Eletrônicos: "Tecnologia > [Sub]"
- Cozinha: "Cozinha > [Sub]"
- Ferramentas: "Ferramentas e Automotivo > [Sub]"
- Brinquedos: "Brinquedos > [Sub]"
- Esportes: "Esporte e Lazer > [Sub]"

**D) categoria_bling:** Versão SIMPLES (ex: "Acessórios para Banheiro")

**ATRIBUTOS/TAGS POR MARKETPLACE:**

**E) atributos_mercado_livre:** Tags ESPECÍFICAS do Mercado Livre
Exemplos de atributos que o ML exige por categoria:
- **cor**: Cor principal do produto (ex: "Preto", "Branco", "Azul")
- **tamanho**: Tamanho se aplicável (ex: "P", "M", "G", "Único")
- **material**: Material principal (ex: "Plástico", "Metal", "Madeira")
- **voltagem**: Se eletrônico (ex: "110V", "220V", "Bivolt")
- **marca**: Marca do produto
- **modelo**: Modelo específico
- **tipo**: Tipo/variação do produto
- **capacidade**: Capacidade se aplicável (ex: "5L", "10kg")
- **garantia**: Tempo de garantia (ex: "12 meses")

**F) atributos_magalu:** Tags ESPECÍFICAS da Magalu/Shopee
(Mesma estrutura que o ML, mas adaptado para Magalu/Shopee)

**IMPORTANTE:**
- Extraia APENAS atributos que estão EXPLÍCITOS no site
- Se não encontrar um atributo, deixe como null
- Cor, Material e Marca são os mais importantes
- Use valores EXATOS do site (não invente)

**REGRAS:**
- NCM OBRIGATÓRIO (8 dígitos numéricos)
- Pesos/dimensões VÁLIDOS (> 0)
- Categorias ESPECÍFICAS com hierarquia completa
- **preco_custo é OBRIGATÓRIO** - preço que o fornecedor cobra
- Atributos devem ser REAIS do produto

Retorne JSON COMPLETO.
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            titulo: { type: "string" },
            marca: { type: ["string", "null"] },
            modelo: { type: ["string", "null"] },
            sku: { type: ["string", "null"] },
            ean: { type: ["string", "null"] },
            descricao: { type: "string" },
            peso_liquido: { type: "number" },
            peso_bruto: { type: "number" },
            largura_cm: { type: "number" },
            altura_cm: { type: "number" },
            profundidade_cm: { type: "number" },
            material: { type: ["string", "null"] },
            ncm: { type: "string" },
            cest: { type: ["string", "null"] },
            origem: { type: "number" },
            preco_custo: { type: "number" },
            condicao: { type: "string" },
            departamento_fornecedor: { type: "string" },
            categoria_mercado_livre: { type: "string" },
            categoria_magalu: { type: "string" },
            categoria_bling: { type: "string" },
            atributos_mercado_livre: {
              type: "object",
              properties: {
                cor: { type: ["string", "null"] },
                tamanho: { type: ["string", "null"] },
                material: { type: ["string", "null"] },
                voltagem: { type: ["string", "null"] },
                marca: { type: ["string", "null"] },
                modelo: { type: ["string", "null"] },
                tipo: { type: ["string", "null"] },
                capacidade: { type: ["string", "null"] },
                garantia: { type: ["string", "null"] }
              }
            },
            atributos_magalu: {
              type: "object",
              properties: {
                cor: { type: ["string", "null"] },
                tamanho: { type: ["string", "null"] },
                material: { type: ["string", "null"] },
                voltagem: { type: ["string", "null"] },
                marca: { type: ["string", "null"] },
                modelo: { type: ["string", "null"] },
                tipo: { type: ["string", "null"] },
                capacidade: { type: ["string", "null"] },
                garantia: { type: ["string", "null"] }
              }
            }
          },
          required: ["titulo", "descricao", "ncm", "origem", "preco_custo", "departamento_fornecedor", "categoria_mercado_livre", "categoria_magalu", "categoria_bling"]
        }
      });

      // Validar e limpar dados
      if (result.ncm) {
        result.ncm = String(result.ncm).replace(/[^0-9]/g, '');
        if (result.ncm.length !== 8) {
          result.ncm = '96151100';
        }
      } else {
        result.ncm = '96151100';
      }

      if (result.cest) {
        result.cest = String(result.cest).replace(/[^0-9]/g, '');
        if (result.cest.length !== 7) {
          result.cest = null;
        }
      }

      result.origem = Math.max(0, Math.min(8, Number(result.origem) || 0));
      result.peso_liquido = Math.max(0.05, Number(result.peso_liquido) || 0.3);
      result.peso_bruto = Math.max(result.peso_liquido * 1.1, Number(result.peso_bruto) || result.peso_liquido * 1.15);
      result.largura_cm = Math.max(5, Number(result.largura_cm) || 15);
      result.altura_cm = Math.max(5, Number(result.altura_cm) || 20);
      result.profundidade_cm = Math.max(5, Number(result.profundidade_cm) || 10);

      result.preco_custo = Math.max(0.01, Number(result.preco_custo) || 10);

      if (!result.departamento_fornecedor) {
        result.departamento_fornecedor = "Produtos Diversos";
      }
      if (!result.categoria_mercado_livre) {
        result.categoria_mercado_livre = "Outros > Produtos Diversos";
      }
      if (!result.categoria_magalu) {
        result.categoria_magalu = "Produtos Diversos";
      }
      if (!result.categoria_bling) {
        result.categoria_bling = result.departamento_fornecedor || "Produtos Diversos";
      }

      result.atributos_mercado_livre = result.atributos_mercado_livre || {};
      result.atributos_magalu = result.atributos_magalu || {};

      // ✅ REESCREVER DESCRIÇÃO PARA EVITAR PLÁGIO
      console.log('\n✍️ Reescrevendo descrição para evitar plágio...');
      
      try {
        const promptReescrita = `
Você é um redator especialista em e-commerce brasileiro.

**TAREFA:** Reescreva a seguinte descrição de produto para evitar plágio, mantendo todas as informações técnicas.

**DESCRIÇÃO ORIGINAL:**
${result.descricao}

**REGRAS:**
1. MANTENHA todos os dados técnicos (dimensões, peso, materiais, funcionalidades)
2. MUDE a estrutura das frases e use sinônimos
3. Adicione mais detalhes sobre BENEFÍCIOS e DIFERENCIAIS do produto
4. Use um tom mais persuasivo e comercial
5. Organize em parágrafos curtos e objetivos
6. NÃO copie frases inteiras da descrição original
7. Mantenha entre 300-500 palavras
8. Destaque características que atraem compradores

**IMPORTANTE:** A descrição deve ser ÚNICA e ORIGINAL, mas com TODAS as informações técnicas preservadas.
`;

        const descricaoReescrita = await base44.integrations.Core.InvokeLLM({
          prompt: promptReescrita,
          add_context_from_internet: false
        });

        if (descricaoReescrita && typeof descricaoReescrita === 'string' && descricaoReescrita.length > 50) {
          result.descricao = descricaoReescrita;
          console.log('✅ Descrição reescrita com sucesso!');
          console.log(`   Original (primeiros 80 chars): ${result.descricao.substring(0, 80)}...`);
          console.log(`   Reescrita (primeiros 80 chars): ${descricaoReescrita.substring(0, 80)}...`);
        } else {
          console.warn('⚠️ Falha ao reescrever descrição, mantendo original');
        }
      } catch (errReescrita) {
        console.error('❌ Erro ao reescrever descrição:', errReescrita);
        console.log('   Mantendo descrição original');
      }

      console.log('✅ Dados extraídos COM CATEGORIAS, PREÇO DE CUSTO E ATRIBUTOS:', result);
      console.log('📂 Categorias:');
      console.log(`   🏪 Fornecedor: ${result.departamento_fornecedor}`);
      console.log(`   🛒 Mercado Livre: ${result.categoria_mercado_livre}`);
      console.log(`   🏬 Magalu/Shopee: ${result.categoria_magalu}`);
      console.log(`   📋 Bling: ${result.categoria_bling}`);
      console.log(`💰 Preço de Custo: R$ ${result.preco_custo.toFixed(2)}`);
      console.log('🏷️  Atributos Mercado Livre:', result.atributos_mercado_livre);
      console.log('🏷️  Atributos Magalu:', result.atributos_magalu);

      setFornecedorData(result);
      
      if (result.titulo && !nomeGrupo) {
        setNomeGrupo(result.titulo.substring(0, 50));
      }
      if (result.categoria_bling && !categoria) {
        setCategoria(result.categoria_bling);
      }

    } catch (err) {
      console.error('Erro completo:', err);
      
      let errorMsg = "Erro ao extrair dados do fornecedor. ";
      
      if (err.message?.includes('503') || err.message?.includes('timeout')) {
        errorMsg += "O servidor está sobrecarregado. Tente novamente em alguns segundos.";
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMsg += "Erro de conexão. Verifique sua internet.";
      } else {
        errorMsg += "Verifique o link e tente novamente.";
      }
      
      setError(errorMsg);
    } finally {
      setIsExtractingFornecedor(false);
    }
  };

  const searchProductData = async (imageUrls) => {
    setProgress(10);
    setProgressMessage("Analisando imagens com IA...");
    
    try {
      const prompt = `
Você é um especialista em produtos brasileiros e classificação fiscal (NCM).

**IMPORTANTE - NCM (OBRIGATÓRIO):**
- NCM deve ter EXATAMENTE 8 dígitos numéricos
- Pesquise na tabela oficial da Receita Federal
- Exemplos:
  * Pentes e escovas de cabelo = 96151100
  * Eletrônicos = 85176200
  * Roupas = 62114300
  * Cosméticos = 33049900

**DADOS TÉCNICOS (pesquise na internet se necessário):**
1. Nome genérico do produto (sem marca específica)
2. Peso líquido (kg) - NÚMERO entre 0.05 e 50
3. Peso bruto com embalagem (kg) - NÚMERO entre 0.1 e 55
4. Dimensões: largura x altura x profundidade (cm) - NÚMEROS entre 5 e 200
5. Material principal
6. NCM: EXATAMENTE 8 dígitos (OBRIGATÓRIO)
7. CEST: 7 dígitos OU null se não encontrar
8. Origem: número de 0 a 8 (0=Nacional, 1=Importado direto, 2=Importado mercado interno)
9. Categoria simples
10. Preço médio de mercado (R$)
11. Condição: "Novo" ou "Usado"

**REGRAS CRÍTICAS:**
- NCM é OBRIGATÓRIO - pesquise até encontrar
- NCM: SEMPRE 8 dígitos numéricos, sem pontos
- CEST: 7 dígitos OU null
- Origem: APENAS número 0-8
- Todos os pesos e dimensões: NÚMEROS VÁLIDOS (não zero, não negativos)
- Peso bruto SEMPRE maior que peso líquido
- Use valores REAIS e REALISTAS para pesos e dimensões

Com base nas categorias comuns de e-commerce brasileiro, forneça dados técnicos padrão.

Retorne JSON completo com todos os dados.
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            nome: { type: "string" },
            marca: { type: ["string", "null"] },
            modelo: { type: ["string", "null"] },
            peso_liquido: { type: "number" },
            peso_bruto: { type: "number" },
            largura_cm: { type: "number" },
            altura_cm: { type: "number" },
            profundidade_cm: { type: "number" },
            material: { type: ["string", "null"] },
            ncm: { type: "string" },
            cest: { type: ["string", "null"] },
            origem: { type: "number" },
            categoria: { type: "string" },
            preco_medio: { type: ["number", "null"] },
            condicao: { type: "string" }
          },
          required: ["ncm", "origem"]
        }
      });

      if (result.ncm) {
        result.ncm = String(result.ncm).replace(/[^0-9]/g, '');
        if (result.ncm.length !== 8) {
          const ncmGenericos = {
            'beleza': '96151100',
            'cabelo': '96151100',
            'pente': '96151100',
            'escova': '96151100',
            'cosmetico': '33049900',
            'eletronico': '85176200',
            'roupa': '62114300',
            'casa': '39249000',
            'brinquedo': '95030000'
          };
          
          const categoriaLower = (result.categoria || '').toLowerCase();
          result.ncm = ncmGenericos[categoriaLower] || '96151100';
        }
      } else {
        result.ncm = '96151100';
      }

      if (result.cest) {
        result.cest = String(result.cest).replace(/[^0-9]/g, '');
        if (result.cest.length !== 7) {
          result.cest = null;
        }
      }

      if (result.origem === null || result.origem === undefined || result.origem < 0 || result.origem > 8) {
        result.origem = 0;
      }

      result.peso_liquido = Number(result.peso_liquido) || 0;
      if (result.peso_liquido <= 0 || result.peso_liquido < 0.05) {
        result.peso_liquido = 0.3;
      }
      if (result.peso_liquido > 50) {
        result.peso_liquido = 0.5;
      }
      result.peso_liquido = parseFloat(result.peso_liquido.toFixed(2));

      result.peso_bruto = Number(result.peso_bruto) || 0;
      if (result.peso_bruto <= 0 || result.peso_bruto <= result.peso_liquido) {
        result.peso_bruto = result.peso_liquido * 1.15;
      }
      if (result.peso_bruto > 55) {
        result.peso_bruto = result.peso_liquido * 1.15;
      }
      result.peso_bruto = parseFloat(result.peso_bruto.toFixed(2));

      result.largura_cm = Number(result.largura_cm) || 0;
      if (result.largura_cm <= 0 || result.largura_cm < 5) {
        result.largura_cm = 15;
      }
      if (result.largura_cm > 200) {
        result.largura_cm = 50;
      }
      result.largura_cm = parseFloat(result.largura_cm.toFixed(2));

      result.altura_cm = Number(result.altura_cm) || 0;
      if (result.altura_cm <= 0 || result.altura_cm < 5) {
        result.altura_cm = 20;
      }
      if (result.altura_cm > 200) {
        result.altura_cm = 30;
      }
      result.altura_cm = parseFloat(result.altura_cm.toFixed(2));

      result.profundidade_cm = Number(result.profundidade_cm) || 0;
      if (result.profundidade_cm <= 0 || result.profundidade_cm < 5) {
        result.profundidade_cm = 10;
      }
      if (result.profundidade_cm > 200) {
        result.profundidade_cm = 20;
      }
      result.profundidade_cm = parseFloat(result.profundidade_cm.toFixed(2));

      console.log('✅ Dados técnicos validados:', {
        ncm: result.ncm,
        origem: result.origem,
        peso_liquido: result.peso_liquido,
        peso_bruto: result.peso_bruto,
        largura_cm: result.largura_cm,
        altura_cm: result.altura_cm,
        profundidade_cm: result.profundidade_cm
      });

      setProductData(result);
      setProgress(20);
      return result;
      
    } catch (err) {
      console.error("Erro ao pesquisar dados do produto:", err);
      setProgress(20);
      
      const dadosPadrao = {
        nome: 'Produto',
        marca: '',
        modelo: null,
        peso_liquido: 0.3,
        peso_bruto: 0.35,
        largura_cm: 15,
        altura_cm: 20,
        profundidade_cm: 10,
        material: null,
        ncm: '96151100',
        cest: null,
        origem: 0,
        categoria: 'Produtos Diversos',
        preco_medio: 50,
        condicao: 'Novo'
      };
      
      console.log('⚠️ Usando dados padrão devido a erro');
      return dadosPadrao;
    }
  };

  // ✅ FUNÇÃO MELHORADA: Gerar SKU usando primeiras sílabas
  const gerarSKU = (nomeGrupo, index) => {
    // Remover acentos e caracteres especiais
    const limpar = (str) => str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .toUpperCase();

    const nomeClean = limpar(nomeGrupo);
    const palavras = nomeClean.split(/\s+/).filter(Boolean); // Filter out empty strings
    
    // Função para pegar as primeiras sílabas de uma palavra
    const getPrimeirasSilabas = (palavra) => {
      // Se for número, retornar como está
      if (/^\d+$/.test(palavra)) {
        return palavra;
      }
      
      // Se for muito curta (<=3 chars), retornar inteira
      if (palavra.length <= 3) {
        return palavra;
      }
      
      // Tentar pegar as primeiras 5 letras (aproximação de 2 sílabas)
      // Em português, média de sílabas = 2-3 letras
      return palavra.substring(0, 5);
    };
    
    // Processar cada palavra
    const partesSKU = palavras.map(palavra => getPrimeirasSilabas(palavra));
    
    // Juntar com hífen
    const prefixo = partesSKU.join('-');
    
    // Adicionar número sequencial com zero à esquerda (00, 01, 02...)
    const numeroSequencial = String(index).padStart(2, '0');
    
    const sku = `${prefixo}-${numeroSequencial}`;
    
    console.log(`📝 SKU gerada: ${sku} (de "${nomeGrupo}")`);
    
    return sku;
  };

  const generateProducts = async () => {
    // VALIDAÇÃO PARA MODO FORNECEDOR
    if (uploadMode === "fornecedor") {
      if (!fornecedorData) {
        setError("Por favor, extraia os dados do site do fornecedor primeiro");
        return;
      }
      if (fornecedorFiles.length === 0) {
        setError("Por favor, faça upload das imagens extraídas do RAR");
        return;
      }
    } else if (uploadMode === "manual" && files.length === 0) {
      setError("Por favor, selecione pelo menos uma imagem");
      return;
    }

    if (quantity < 1 || quantity > 100) {
      setError("Quantidade deve ser entre 1 e 100");
      return;
    }

    if (!nomeGrupo.trim()) {
      setError("Por favor, dê um nome para este grupo de produtos");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setProgressMessage(""); // Reset message

    try {
      let imageUrls = [];
      let uploadedUrls = [];
      let baseDescription = "";
      let dadosTecnicos = null;

      // PROCESSAMENTO PARA MODO FORNECEDOR
      if (uploadMode === "fornecedor") {
        setProgress(5);
        setProgressMessage(`Processando ${fornecedorFiles.length} imagens do fornecedor...`);
        console.log('🖼️  Processando imagens do fornecedor...');
        
        uploadedUrls = [];
        for (let i = 0; i < fornecedorFiles.length; i++) {
          const file = fornecedorFiles[i];
          try {
            setProgressMessage(`Otimizando imagem ${i + 1}/${fornecedorFiles.length}...`);
            const resizedFile = await resizeImage(file);
            const sizeMB = (resizedFile.size / 1024 / 1024).toFixed(2);
            console.log(`📤 Enviando para imgbb: ${file.name} (${sizeMB}MB)`);
            
            setProgressMessage(`Enviando imagem ${i + 1}/${fornecedorFiles.length} para imgbb...`);
            const base64Image = await fileToBase64(resizedFile);
            const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            
            const result = await base44.functions.invoke('imgbbUpload', {
              imageBase64: base64Image,
              fileName: fileName
            });
            
            const data = result.data || result;
            
            if (!data.success) {
              throw new Error(data.error || 'Erro ao fazer upload no imgbb');
            }
            
            console.log(`✅ Imagem no imgbb: ${data.file_url}`);
            uploadedUrls.push(data.file_url);
            
            // Atualizar progresso
            const progressPercent = 5 + Math.round((i + 1) / fornecedorFiles.length * 5);
            setProgress(progressPercent);
            
          } catch (err) {
            console.error(`❌ Erro ao processar imagem ${file.name}:`, err);
            throw err;
          }
        }

        if (uploadedUrls.length === 0) {
          setError("Nenhuma imagem do fornecedor pôde ser processada e enviada.");
          setIsGenerating(false);
          return;
        }

        imageUrls = uploadedUrls;
        setProgress(10);
        
        console.log(`✅ ${uploadedUrls.length} imagens do fornecedor processadas!`);
        
        // Usar dados técnicos extraídos do fornecedor
        dadosTecnicos = fornecedorData;
        baseDescription = fornecedorData.descricao;
        
      } else if (uploadMode === "manual") {
        setProgress(5);
        setProgressMessage(`Processando ${files.length} imagens...`);
        console.log('🖼️  Redimensionando, comprimindo e enviando para imgbb (URLs diretas)...');
        
        uploadedUrls = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            setProgressMessage(`Otimizando imagem ${i + 1}/${files.length}...`);
            const resizedFile = await resizeImage(file);
            const sizeMB = (resizedFile.size / 1024 / 1024).toFixed(2);
            console.log(`📤 Enviando para imgbb: ${file.name} (${sizeMB}MB)`);
            
            setProgressMessage(`Enviando imagem ${i + 1}/${files.length} para imgbb...`);
            const base64Image = await fileToBase64(resizedFile);
            const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            
            const result = await base44.functions.invoke('imgbbUpload', {
              imageBase64: base64Image,
              fileName: fileName
            });
            
            const data = result.data || result;
            
            if (!data.success) {
              throw new Error(data.error || 'Erro ao fazer upload no imgbb');
            }
            
            console.log(`✅ Imagem no imgbb: ${data.file_url}`);
            uploadedUrls.push(data.file_url);
            
            // Atualizar progresso
            const progressPercent = 5 + Math.round((i + 1) / files.length * 5);
            setProgress(progressPercent);
            
          } catch (err) {
            console.error(`❌ Erro ao processar imagem ${file.name}:`, err);
            setError(`Erro ao processar imagem ${file.name}. Tente novamente.`);
            throw err;
          }
        }
        
        imageUrls = uploadedUrls;
        setProgress(10);
        
        console.log(`✅ ${uploadedUrls.length} imagens no imgbb (1200x1200, <3MB, URLs diretas)!`);
        
        // Buscar dados técnicos pela IA
        dadosTecnicos = await searchProductData(imageUrls);
      }
      
      setProgress(20);
      setProgressMessage("Gerando variações de produtos com IA...");
      
      const batchSize = 10;
      const numBatches = Math.ceil(quantity / batchSize);
      const allProducts = [];

      for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
        const productsInThisBatch = Math.min(batchSize, quantity - (batchIndex * batchSize));
        const progressStart = 20 + (batchIndex / numBatches) * 50; 
        setProgress(Math.round(progressStart));
        setProgressMessage(`Gerando lote ${batchIndex + 1}/${numBatches} (${productsInThisBatch} produtos)...`);

        // PROMPT ADAPTADO PARA USAR DESCRIÇÃO DO FORNECEDOR E NOVAS CATEGORIAS
        const nomeReferencia = uploadMode === "fornecedor" && fornecedorData
          ? fornecedorData.titulo
          : nomeGrupo;

        const descricaoBase = uploadMode === "fornecedor" && fornecedorData
          ? fornecedorData.descricao
          : baseDescription;

        const prompt = `
Você é um especialista em criar anúncios de produtos para marketplaces brasileiros.

**CONTEXTO DO PRODUTO:**
${uploadMode === "fornecedor" ? `
Você está criando anúncios baseados em dados de fornecedor.
Descrição técnica do fornecedor: ${descricaoBase}
SKU: ${fornecedorData.sku || 'Não informado'}
EAN: ${fornecedorData.ean || 'Não informado'}
Departamento: ${fornecedorData.departamento_fornecedor || 'Não informado'}
Marketplace: Mercado Livre - Categoria: ${fornecedorData.categoria_mercado_livre || 'Não informado'}
Marketplace: Magalu - Categoria: ${fornecedorData.categoria_magalu || 'Não informado'}
Bling - Categoria: ${fornecedorData.categoria_bling || 'Não informado'}
` : `
Você está analisando ${imageUrls.length} imagens do produto.
`}

**NOME/CATEGORIA DO PRODUTO (USE COMO BASE OBRIGATÓRIA):**
"${nomeReferencia}"

${dadosTecnicos ? `
**DADOS TÉCNICOS ${uploadMode === "fornecedor" ? 'DO FORNECEDOR' : 'PESQUISADOS'}:**
- Produto: ${dadosTecnicos.nome || dadosTecnicos.titulo || 'Não informado'}
- Marca: ${dadosTecnicos.marca || 'Não informada'}
- NCM: ${dadosTecnicos.ncm || 'Não informado'}
${uploadMode === "fornecedor" && dadosTecnicos.material ? `- Material: ${dadosTecnicos.material}` : ''}
${uploadMode === "fornecedor" && dadosTecnicos.departamento_fornecedor ? `- Departamento Fornecedor: ${dadosTecnicos.departamento_fornecedor}` : ''}

USE ESSES DADOS nas descrições para deixá-las mais completas e técnicas.
` : ''}

**REGRAS CRÍTICAS PARA OS TÍTULOS:**
1. TODOS os ${productsInThisBatch} títulos DEVEM ser sobre "${nomeReferencia}"
2. NÃO invente produtos diferentes
3. NUNCA use nomes de marcas genéricas como "Marqs Home", "TopyHome", etc (risco de plágio)
4. Use PALAVRAS-CHAVE SAZONAIS + GATILHOS DE VENDA (época atual: Natal, Fim de Ano, Black Friday):
   - SAZONAIS: "Promoção de Natal", "Oferta de Fim de Ano", "Black Friday", "Especial Natal", "Presente de Natal"
   - GATILHOS: "Frete grátis", "Entrega rápida", "Pronta entrega", "Envio imediato", "Últimas unidades"
5. MODELO DE TÍTULO: "[Produto] – Frete grátis + Entrega rápida – Promoção Natal"
6. **COERÊNCIA LÓGICA OBRIGATÓRIA:**
   - NÃO coloque "ideal para verão" em casacos/agasalhos
   - NÃO coloque "perfeito para o frio" em ventiladores/ar condicionado
   - NÃO coloque "praia" em produtos de inverno
   - Use características que FAÇAM SENTIDO com o produto
7. Use VARIAÇÕES de como descrever o MESMO produto:
   - Sinônimos
   - Características + sazonais (com coerência)
   - Benefícios + gatilhos
   - Público + ofertas
8. Cada título deve ter entre 50-80 caracteres
9. Inclua números quando relevante

**IMPORTANTE - TAGS:**
- Crie 8-15 tags SIMPLES e DIRETAS relacionadas a "${nomeReferencia}"
- INCLUA SEMPRE tags de gatilhos: "frete gratis", "entrega rapida", "pronta entrega"
- INCLUA tags sazonais: "natal", "black friday", "presente"
- Use apenas letras, números e espaços (sem acentos)
- Separe por vírgula
- NÃO use caracteres especiais
- Tags devem ter COERÊNCIA com o produto (ex: não colocar "verao" em casacos)

**IMPORTANTE - DESCRIÇÕES:**
- Crie descrições atrativas e detalhadas sobre "${nomeReferencia}"
${uploadMode === "fornecedor" ? '- Use a descrição técnica do fornecedor como base' : ''}
- Destaque características, benefícios e diferenciais
- Use parágrafos curtos e objetivos
- INCLUA gatilhos: "Frete grátis para todo Brasil", "Entrega rápida", "Pronta entrega"
- **COERÊNCIA OBRIGATÓRIA**: NÃO mencione características incompatíveis (ex: "verão" para casacos, "frio" para ventiladores)

Gere EXATAMENTE ${productsInThisBatch} variações de anúncios DIFERENTES sobre "${nomeReferencia}" com:
- Títulos ÚNICOS e otimizados para SEO (todos sobre o MESMO produto)
- Descrições atrativas e detalhadas
- Palavras-chave simples e válidas (sem caracteres especiais)
- Preço sugerido realista

${categoria ? `Categoria sugerida (BLING): ${categoria}` : ''}
${marketplace !== 'todos' ? `Marketplace alvo: ${marketplace}` : ''}

CRITICAL: 
- Retorne EXATAMENTE ${productsInThisBatch} produtos
- Tags devem ser SIMPLES, sem caracteres especiais
- Cada título deve ser ÚNICO mas sobre o MESMO produto
- NUNCA invente produtos diferentes do contexto
`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          response_json_schema: {
            type: "object",
            properties: {
              produtos: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    titulo: { type: "string" },
                    descricao: { type: "string" },
                    preco_sugerido: { type: "number" },
                    palavras_chave: { 
                      type: "array",
                      items: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        });

        if (result.produtos && result.produtos.length > 0) {
          allProducts.push(...result.produtos.slice(0, productsInThisBatch));
        }
      }

      setProgress(70);
      setProgressMessage("Preparando produtos para salvar...");

      if (allProducts.length < quantity && allProducts.length > 0) {
        while (allProducts.length < quantity) {
          const baseProduct = allProducts[allProducts.length % allProducts.length]; 
          allProducts.push({
            ...baseProduct,
            titulo: `${baseProduct.titulo} - Variação ${allProducts.length + 1}`
          });
        }
      } else if (allProducts.length === 0 && quantity > 0) {
        for (let i = 0; i < quantity; i++) {
          allProducts.push({
            titulo: `${nomeGrupo} - Produto ${i + 1}`,
            descricao: descricaoBase || "Produto de alta qualidade",
            preco_sugerido: dadosTecnicos?.preco_custo ? dadosTecnicos.preco_custo * 2 : 50,
            palavras_chave: ["produto", "qualidade"],
          });
        }
      }

      const finalProducts = allProducts.slice(0, quantity);

      setProgress(75);
      setProgressMessage("Salvando produtos no banco de dados...");

      const grupoId = `grupo-${Date.now()}`;
      const ncmFinal = dadosTecnicos?.ncm || '96151100';

      // CALCULAR PREÇOS CORRETAMENTE
      // Preço de compra = preço do fornecedor
      const precoCompra = Number(dadosTecnicos?.preco_custo) || 0;
      // Preço de custo = preço de compra + 18%
      const precoCusto = precoCompra > 0 ? parseFloat((precoCompra * 1.18).toFixed(2)) : 0;

      // ✅ GERAR SKU BASE DO GRUPO
      console.log(`\n📝 Gerando SKUs sequenciais para o grupo "${nomeGrupo}"...`);

      // CRIAR PRODUTOS COM FORNECEDOR CORRETO E PREÇOS CALCULADOS
      const productsToCreate = finalProducts.map((produto, index) => {
        const skuGerada = gerarSKU(nomeGrupo, index);

        return {
          titulo: produto.titulo,
          descricao: produto.descricao,
          imagem_url: uploadedUrls[0],
          galeria_imagens: uploadedUrls,
          categoria: dadosTecnicos?.categoria_bling || categoria || "Produtos Diversos",
          categoria_fornecedor: dadosTecnicos?.departamento_fornecedor || null,
          categoria_mercado_livre: dadosTecnicos?.categoria_mercado_livre || null,
          categoria_magalu: dadosTecnicos?.categoria_magalu || null,
          categoria_bling: dadosTecnicos?.categoria_bling || categoria || "Produtos Diversos",
          atributos_mercado_livre: dadosTecnicos?.atributos_mercado_livre || {},
          atributos_magalu: dadosTecnicos?.atributos_magalu || {},
          preco_sugerido: produto.preco_sugerido || (dadosTecnicos?.preco_custo ? dadosTecnicos.preco_custo * 2 : 50),
          palavras_chave: (produto.palavras_chave || []).filter(tag => tag && tag.trim()),
          marketplace: marketplace,
          status: "pronto",
          variacao_numero: index + 1,
          grupo_id: grupoId,
          nome_grupo: nomeGrupo.trim(),
          tipo_origem: "gerado",
          comentario: uploadMode === "fornecedor" ? `Extraído de: ${fornecedorUrl}` : "",
          dados_completos_bling: {
            nome: dadosTecnicos?.nome || dadosTecnicos?.titulo || produto.titulo,
            marca: dadosTecnicos?.marca || '',
            modelo: dadosTecnicos?.modelo || null,
            sku: skuGerada,
            gtin: dadosTecnicos?.ean || null,
            peso_liquido: Number(dadosTecnicos?.peso_liquido) || 0.3,
            peso_bruto: Number(dadosTecnicos?.peso_bruto) || 0.35,
            largura_cm: Number(dadosTecnicos?.largura_cm) || 15,
            altura_cm: Number(dadosTecnicos?.altura_cm) || 10,
            profundidade_cm: Number(dadosTecnicos?.profundidade_cm) || 5,
            material: dadosTecnicos?.material || null,
            ncm: ncmFinal,
            cest: dadosTecnicos?.cest || null,
            origem: Number(dadosTecnicos?.origem) || 0,
            categoria: dadosTecnicos?.categoria_bling || categoria || "Produtos Diversos", // Bling category for Bling data
            preco_custo: precoCompra, // Preço original do fornecedor (será usado como "preço de compra")
            preco_medio: Number(dadosTecnicos?.preco_custo) ? Number(dadosTecnicos.preco_custo) * 2 : produto.preco_sugerido || 50,
            condicao: dadosTecnicos?.condicao || 'Novo',
            tipo_item: 'P',
            fornecedor: null, // Removido "SiqueiraImports" - será buscado pelo código 112225
            garantia: 30
          }
        };
      });

      console.log(`✅ SKUs geradas:`);
      productsToCreate.slice(0, 5).forEach(p => {
        console.log(`   ${p.dados_completos_bling.sku}: ${p.titulo.substring(0, 40)}...`);
      });
      if (productsToCreate.length > 5) {
        console.log(`   ... e mais ${productsToCreate.length - 5} SKUs`);
      }

      const createBatchSize = 10;
      const numCreateBatches = Math.ceil(productsToCreate.length / createBatchSize);
      
      for (let batchIndex = 0; batchIndex < numCreateBatches; batchIndex++) {
        const start = batchIndex * createBatchSize;
        const end = Math.min(start + createBatchSize, productsToCreate.length);
        const batch = productsToCreate.slice(start, end);
        
        setProgressMessage(`Salvando produtos ${start + 1}-${end} de ${productsToCreate.length}...`);
        
        await base44.entities.Product.bulkCreate(batch);
        
        const progressPercent = 75 + Math.round((end / productsToCreate.length) * 25);
        setProgress(progressPercent);
      }

      setProgress(100);
      setProgressMessage("✅ Produtos criados com sucesso!");
      setSuccess(true);

      console.log(`\n🎉 SUCESSO! ${quantity} produtos criados com SKUs sequenciais!`);
      console.log(`   💰 Preço de Compra: R$ ${precoCompra.toFixed(2)}`);
      console.log(`   💵 Preço de Custo (+18%): R$ ${precoCusto.toFixed(2)}`);
      console.log(`   📂 Fornecedor: ${dadosTecnicos?.departamento_fornecedor || 'N/A'}`);
      console.log(`   🛒 Mercado Livre: ${dadosTecnicos?.categoria_mercado_livre || 'N/A'}`);
      console.log(`   🏬 Magalu: ${dadosTecnicos?.categoria_magalu || 'N/A'}`);
      console.log(`   📋 Bling: ${dadosTecnicos?.categoria_bling || 'N/A'}`);
      console.log('🏷️  Atributos Mercado Livre:', dadosTecnicos?.atributos_mercado_livre || 'N/A');
      console.log('🏷️  Atributos Magalu:', dadosTecnicos?.atributos_magalu || 'N/A');
      console.log(`   👤 Fornecedor (Bling): Será buscado pelo código 112225`);
      console.log(`   📅 Garantia (Bling): 30 dias`);

      setTimeout(() => {
        navigate(createPageUrl("Products"));
      }, 2000);

    } catch (err) {
      setError(`Erro ao gerar produtos: ${err.message || 'Tente novamente'}`);
      console.error("Erro completo:", err);
    } finally {
      setIsGenerating(false);
      setProgressMessage("");
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      <div className="max-w-4xl mx-auto">
        {/* Header Melhorado */}
        <div className="mb-8 relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative">
            <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 px-4 py-1.5 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              Gerador IA
            </Badge>
            <h1 className="text-5xl font-black text-slate-900 mb-3 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Gerar Produtos Automaticamente
            </h1>
            <p className="text-slate-600 text-xl font-medium">
              ✨ Faça upload de fotos OU extraia de site de fornecedor
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-green-600 font-semibold">
                Todas as imagens são redimensionadas automaticamente para 1200x1200 pixels e comprimidas para até 3MB
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 shadow-lg">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800 font-semibold">
              🎉 {quantity} produtos gerados com imagens 1200x1200 e comprimidas para {'<'}3MB! Redirecionando...
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={uploadMode} onValueChange={setUploadMode} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <TabsTrigger 
              value="manual" 
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold"
            >
              <Upload className="w-4 h-4" />
              Upload Manual
            </TabsTrigger>
            <TabsTrigger 
              value="fornecedor" 
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold"
            >
              <ExternalLink className="w-4 h-4" />
              Site Fornecedor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900">
                      Galeria de Imagens do Produto
                    </CardTitle>
                    <p className="text-sm text-slate-500 font-medium">Upload múltiplas fotos do produto</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="files" className="text-base font-bold text-slate-700">Selecione múltiplas imagens</Label>
                    <Input
                      id="files"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="mt-2 border-2 hover:border-orange-300 transition-colors"
                      disabled={isGenerating}
                    />
                    <div className="flex items-start gap-2 mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <p className="text-xs text-green-700 font-medium">
                        Todas serão redimensionadas automaticamente para 1200x1200 e comprimidas para até 3MB (padrão e-commerce)
                      </p>
                    </div>
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-2xl border-2 border-slate-200 shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            disabled={isGenerating}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 shadow-lg hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            Foto {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA: Site de Fornecedor */}
          <TabsContent value="fornecedor">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900">
                      Extrair de Site de Fornecedor
                    </CardTitle>
                    <p className="text-sm text-slate-500 font-medium">IA extrai todos os dados técnicos</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300 shadow-md">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong className="font-bold">Como funciona:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1 font-medium">
                        <li>Cole o link do produto no site do fornecedor</li>
                        <li>Clique em "Extrair Dados" para obter todas as informações técnicas</li>
                        <li>Baixe o RAR de imagens do site manualmente</li>
                        <li>Extraia o RAR e faça upload das imagens aqui</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="fornecedorUrl" className="text-base font-bold text-slate-700">Cole o link do produto do fornecedor</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="fornecedorUrl"
                        type="url"
                        value={fornecedorUrl}
                        onChange={(e) => setFornecedorUrl(e.target.value)}
                        placeholder="https://c7drop.com.br/produto/..."
                        disabled={isGenerating || isExtractingFornecedor}
                        className="flex-1 border-2 hover:border-blue-300 transition-colors"
                      />
                      <Button
                        onClick={extractFromFornecedor}
                        disabled={isGenerating || isExtractingFornecedor || !fornecedorUrl.trim()}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg font-bold"
                      >
                        {isExtractingFornecedor ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Extraindo...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Extrair Dados
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-xs text-blue-700 font-medium">
                        A IA irá extrair: título, descrição completa, peso, dimensões, NCM, EAN, SKU e mais
                      </p>
                    </div>
                  </div>

                  {fornecedorData && (
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-xl">
                      <h4 className="font-black text-green-900 mb-4 flex items-center gap-2 text-xl">
                        <CheckCircle className="w-6 h-6" />
                        Dados Técnicos Extraídos!
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-green-800">Título:</p>
                          <p className="text-green-700">{fornecedorData.titulo}</p>
                        </div>
                        
                        {fornecedorData.marca && (
                          <div>
                            <p className="font-medium text-green-800">Marca:</p>
                            <p className="text-green-700">{fornecedorData.marca}</p>
                          </div>
                        )}
                        
                        {fornecedorData.sku && (
                          <div>
                            <p className="font-medium text-green-800">SKU:</p>
                            <p className="text-green-700 font-mono">{fornecedorData.sku}</p>
                          </div>
                        )}
                        
                        {fornecedorData.ean && (
                          <div>
                            <p className="font-medium text-green-800">EAN:</p>
                            <p className="text-green-700 font-mono">{fornecedorData.ean}</p>
                          </div>
                        )}
                        
                        <div>
                          <p className="font-medium text-green-800">Peso Líq./Bruto:</p>
                          <p className="text-green-700">{fornecedorData.peso_liquido}kg / {fornecedorData.peso_bruto}kg</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-green-800">Dimensões (LxAxP):</p>
                          <p className="text-green-700">{fornecedorData.largura_cm} x {fornecedorData.altura_cm} x {fornecedorData.profundidade_cm} cm</p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-green-800">NCM:</p>
                          <p className="text-green-700 font-mono">{fornecedorData.ncm}</p>
                        </div>

                        {/* Display new category fields */}
                        <div>
                          <p className="font-medium text-green-800">Cat. Fornecedor:</p>
                          <p className="text-green-700">{fornecedorData.departamento_fornecedor}</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Cat. Mercado Livre:</p>
                          <p className="text-green-700">{fornecedorData.categoria_mercado_livre}</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Cat. Magalu/Shopee:</p>
                          <p className="text-green-700">{fornecedorData.categoria_magalu}</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Cat. Bling (Usada):</p>
                          <p className="text-green-700">{fornecedorData.categoria_bling}</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Preço de Custo:</p>
                          <p className="text-green-700">R$ {fornecedorData.preco_custo.toFixed(2)}</p>
                        </div>

                        {/* Display Atributos Mercado Livre */}
                        {(fornecedorData.atributos_mercado_livre && Object.keys(fornecedorData.atributos_mercado_livre).length > 0) && (
                          <div className="col-span-2">
                            <p className="font-medium text-green-800">Atributos Mercado Livre:</p>
                            {Object.entries(fornecedorData.atributos_mercado_livre).map(([key, value]) => 
                              value && <p key={key} className="text-green-700 ml-2"><strong>{key}:</strong> {value}</p>
                            )}
                          </div>
                        )}

                        {/* Display Atributos Magalu */}
                        {(fornecedorData.atributos_magalu && Object.keys(fornecedorData.atributos_magalu).length > 0) && (
                          <div className="col-span-2">
                            <p className="font-medium text-green-800">Atributos Magalu:</p>
                            {Object.entries(fornecedorData.atributos_magalu).map(([key, value]) => 
                              value && <p key={key} className="text-green-700 ml-2"><strong>{key}:</strong> {value}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-green-300">
                        <p className="font-bold text-green-900 mb-2">Descrição:</p>
                        <p className="text-xs text-green-700 line-clamp-3 bg-white/50 p-3 rounded-lg">{fornecedorData.descricao}</p>
                      </div>
                    </div>
                  )}

                  {fornecedorData && (
                    <>
                      <Alert className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 shadow-md">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800 text-sm font-semibold">
                          <strong>Próximo passo:</strong> Baixe o arquivo RAR de imagens do site do fornecedor, extraia e faça upload abaixo.
                        </AlertDescription>
                      </Alert>

                      <div>
                        <Label htmlFor="fornecedorFiles" className="text-base font-bold text-slate-700">Faça upload das imagens extraídas do RAR</Label>
                        <Input
                          id="fornecedorFiles"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFornecedorFileChange}
                          className="mt-2 border-2 hover:border-blue-300 transition-colors"
                          disabled={isGenerating}
                        />
                        <div className="flex items-start gap-2 mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <p className="text-xs text-green-700 font-medium">
                            Serão redimensionadas para 1200x1200 e comprimidas para até 3MB
                          </p>
                        </div>
                      </div>

                      {fornecedorPreviewUrls.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {fornecedorPreviewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-2xl border-2 border-slate-200 shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300"
                              />
                              <button
                                onClick={() => removeFornecedorImage(index)}
                                disabled={isGenerating}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 shadow-lg hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-2 left-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                Foto {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">Configurações</CardTitle>
                <p className="text-sm text-slate-500 font-medium">Personalize a geração de produtos</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              <div>
                <Label htmlFor="nomeGrupo" className="text-base font-bold text-slate-700">Nome do Grupo/Lote *</Label>
                <Input
                  id="nomeGrupo"
                  type="text"
                  value={nomeGrupo}
                  onChange={(e) => setNomeGrupo(e.target.value)}
                  placeholder="Ex: Tênis Nike Air Max Branco"
                  className="mt-2 border-2 hover:border-blue-300 transition-colors"
                  disabled={isGenerating}
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  📁 Nome para organizar este lote de produtos
                </p>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-base font-bold text-slate-700">Quantidade de Variações</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="mt-2 border-2 hover:border-blue-300 transition-colors"
                  disabled={isGenerating}
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  🔢 De 1 até 100 anúncios diferentes
                </p>
              </div>

              <div>
                <Label htmlFor="categoria" className="text-base font-bold text-slate-700">Categoria (opcional)</Label>
                <Input
                  id="categoria"
                  type="text"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  placeholder="Ex: Eletrônicos, Moda, Casa..."
                  className="mt-2 border-2 hover:border-blue-300 transition-colors"
                  disabled={isGenerating || uploadMode === "fornecedor"}
                />
                 {uploadMode === "fornecedor" && (
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      📂 A categoria é extraída do fornecedor e mapeada para Bling
                    </p>
                  )}
              </div>

              <div>
                <Label htmlFor="marketplace" className="text-base font-bold text-slate-700">Marketplace Alvo</Label>
                <select
                  id="marketplace"
                  value={marketplace}
                  onChange={(e) => setMarketplace(e.target.value)}
                  className="w-full mt-2 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors font-medium"
                  disabled={isGenerating}
                >
                  <option value="todos">Todos os Marketplaces</option>
                  <option value="mercado_livre">Mercado Livre</option>
                  <option value="shopee">Shopee</option>
                  <option value="magalu">Magalu</option>
                  <option value="amazon">Amazon</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isGenerating && (
          <Card className="mb-6 bg-blue-50 border-blue-200 shadow-xl">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {progressMessage || "Processando..."}
                  </span>
                  <span className="text-sm font-bold text-blue-600">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-blue-700">
                  ⏱️ Acompanhe o progresso em tempo real
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-green-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          
          <CardContent className="p-6 relative">
            <Button
              onClick={generateProducts}
              disabled={
                (uploadMode === "manual" && files.length === 0) ||
                (uploadMode === "fornecedor" && (!fornecedorData || fornecedorFiles.length === 0)) ||
                isGenerating ||
                !nomeGrupo.trim()
              }
              className="w-full bg-white text-cyan-600 hover:bg-blue-50 font-black py-8 text-xl shadow-2xl rounded-2xl group transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Gerando {quantity} produtos...
                </>
              ) : (
                <>
                  <Rocket className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                  Gerar {quantity} Anúncios (1200x1200, {'<'}3MB)
                </>
              )}
            </Button>

            <p className="text-center text-sm text-white/90 mt-4 font-medium">
              {uploadMode === "fornecedor"
                ? `🖼️  As imagens serão otimizadas (1200x1200, <3MB) e os dados técnicos do fornecedor serão usados. ${quantity} anúncios únicos serão criados.`
                : `🖼️  As imagens serão otimizadas (1200x1200, <3MB) e hospedadas no imgbb. ${quantity} anúncios únicos serão criados.`
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}