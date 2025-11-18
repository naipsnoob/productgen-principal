
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FolderOpen,
  ChevronRight,
  Package,
  Image as ImageIcon,
  DollarSign,
  LinkIcon,
  ExternalLink,
  Info,
  Zap,
  Download,
  Loader2,
  CheckCircle,
  Trash2,
  AlertTriangle,
  FileDown,
  Copy,
  Plus,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function ProductsPage() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("gerados");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportProgressMessage, setExportProgressMessage] = useState("");
  const [exportError, setExportError] = useState(null);
  const [isVinculandoTodos, setIsVinculandoTodos] = useState(false);
  const [vinculacaoProgress, setVinculacaoProgress] = useState(0);
  const [vinculacaoProgressMessage, setVinculacaoProgressMessage] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ NOVO: Estado para adicionar imagens
  const [isAddingImages, setIsAddingImages] = useState(false);
  const [addImagesProgress, setAddImagesProgress] = useState(0);
  const [addImagesProgressMessage, setAddImagesProgressMessage] = useState("");

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const produtosGerados = products.filter(p => !p.id_bling);
  const produtosImportados = products.filter(p => p.id_bling);

  const agruparProdutos = (produtosList) => {
    return produtosList.reduce((acc, product) => {
      const grupoId = product.grupo_id || 'sem_grupo';
      if (!acc[grupoId]) {
        acc[grupoId] = {
          id: grupoId,
          nome: product.nome_grupo || 'Sem Grupo',
          categoria: product.categoria || 'Sem Categoria',
          tipo_origem: product.tipo_origem || 'gerado',
          produtos: []
        };
      }
      acc[grupoId].produtos.push(product);
      return acc;
    }, {});
  };

  const gruposGerados = Object.values(agruparProdutos(produtosGerados));
  const gruposImportados = Object.values(agruparProdutos(produtosImportados));

  const generateBlingCSV = (grupo) => {
    const headers = [
      'Código', 'Descrição', 'Tipo do item', 'Situação', 'Unidade',
      'Preço', 'Preço de custo', 'Peso bruto', 'Peso líquido',
      'Largura', 'Altura', 'Profundidade', 'NCM', 'CEST', 'Origem',
      'GTIN/EAN', 'Categoria', 'Estoque mínimo', 'Estoque máximo', 'Imagens externas'
    ].join(';');

    const rows = grupo.produtos.map((product, index) => {
      const dados = product.dados_completos_bling || {};
      const imagensUrl = (product.galeria_imagens || []).join('/');

      return [
        product.codigo_bling || `PROD${Date.now()}-${index}`,
        product.titulo.substring(0, 120),
        'P', 'Ativo', 'UN',
        (product.preco_sugerido || 50).toFixed(2).replace('.', ','),
        '0,00',
        (dados.peso_bruto || 0.35).toFixed(2).replace('.', ','),
        (dados.peso_liquido || 0.3).toFixed(2).replace('.', ','),
        (dados.largura_cm || 15).toFixed(2).replace('.', ','),
        (dados.altura_cm || 10).toFixed(2).replace('.', ','),
        (dados.profundidade_cm || 5).toFixed(2).replace('.', ','),
        String(dados.ncm || '96151100').replace(/[^0-9]/g, ''),
        dados.cest ? String(dados.cest).replace(/[^0-9]/g, '') : '',
        String(dados.origem || 0),
        dados.gtin || '',
        product.categoria || 'Produtos Diversos', // Changed from 'Acessórios para Cabelo'
        '1', '999',
        imagensUrl
      ].join(';');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `bling_${grupo.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(
      `✅ CSV gerado com sucesso!\n\n` +
      `📋 PRÓXIMOS PASSOS:\n\n` +
      `1. Acesse o Bling\n2. Vá em Produtos → Importar\n` +
      `3. Faça upload do arquivo CSV baixado\n` +
      `4. Escolha separador: PONTO E VÍRGULA (;)\n5. Importe os produtos\n\n` +
      `✅ As imagens serão importadas automaticamente!\n\n` +
      `💡 Este CSV contém ${grupo.produtos.length} produto(s) com todas as imagens`
    );
  };

  const toggleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = (grupo) => {
    const grupoIds = grupo.produtos.map(p => p.id);
    const allSelected = grupoIds.every(id => selectedProducts.includes(id));

    if (allSelected) {
      setSelectedProducts(prev => prev.filter(id => !grupoIds.includes(id)));
    } else {
      setSelectedProducts(prev => [...new Set([...prev, ...grupoIds])]);
    }
  };

  const deleteSelected = async () => {
    if (selectedProducts.length === 0) return;

    const confirmMsg = `Tem certeza que deseja excluir ${selectedProducts.length} produto(s)?\n\nEsta ação não pode ser desfeita.`;

    if (!confirm(confirmMsg)) return;

    setIsDeleting(true);

    try {
      for (const productId of selectedProducts) {
        await base44.entities.Product.delete(productId);
      }

      await refetch();
      setSelectedProducts([]);
      alert(`✅ ${selectedProducts.length} produto(s) excluído(s) com sucesso!`);
    } catch (err) {
      alert(`❌ Erro ao excluir produtos: ${err.message}`);
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteGroup = async (grupo) => {
    const confirmMsg = `Tem certeza que deseja excluir TODO o grupo "${grupo.nome}"?\n\n${grupo.produtos.length} produto(s) serão excluídos permanentemente.\n\nEsta ação não pode ser desfeita.`;

    if (!confirm(confirmMsg)) return;

    setIsDeleting(true);

    try {
      for (const product of grupo.produtos) {
        await base44.entities.Product.delete(product.id);
      }

      await refetch();
      setSelectedGroup(null);
      alert(`✅ Grupo "${grupo.nome}" excluído com sucesso!`);
    } catch (err) {
      alert(`❌ Erro ao excluir grupo: ${err.message}`);
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteSingleProduct = async (product) => {
    const confirmMsg = `Excluir o produto "${product.titulo}"?\n\nEsta ação não pode ser desfeita.`;

    if (!confirm(confirmMsg)) return;

    setIsDeleting(true);

    try {
      await base44.entities.Product.delete(product.id);
      await refetch();
      alert(`✅ Produto excluído com sucesso!`);
    } catch (err) {
      alert(`❌ Erro ao excluir produto: ${err.message}`);
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const exportGroupToBling = async (grupo) => {
    setIsExporting(true);
    setExportProgress(0);
    setExportProgressMessage("Iniciando exportação...");
    setExportError(null);

    try {
      const user = await base44.auth.me();

      if (!user.bling_connected || !user.bling_access_token) {
        const errorMsg = '❌ Conecte-se ao Bling primeiro!\n\nVá em Configurações → Conectar com Bling';
        setExportError(errorMsg);
        setIsExporting(false);
        return;
      }

      setExportProgress(10);
      setExportProgressMessage("Validando credenciais...");

      console.log('📤 Iniciando exportação do grupo:', grupo.nome);

      // ✅ EXPORTAÇÃO SEQUENCIAL COM PROGRESSO EM TEMPO REAL
      const total = grupo.produtos.length;
      let sucessos = 0;
      let erros = 0;
      const detalhes = [];

      for (let i = 0; i < total; i++) {
        const product = grupo.produtos[i];

        setExportProgressMessage(`Exportando produto ${i + 1}/${total}: ${product.titulo.substring(0, 40)}...`);
        setExportProgress(10 + Math.round((i / total) * 80));

        try {
          console.log(`\n📤 Exportando produto ${i + 1}/${total}: ${product.titulo}`);

          const result = await base44.functions.invoke('bling', {
            function: 'exportProductsBatchToBling',
            accessToken: user.bling_access_token,
            products: [product], // Exportar um por vez
            grupoNome: grupo.nome
          });

          const data = result.data || result;

          if (data.success && data.sucessos > 0) {
            const detalhe = data.detalhes[0];

            // Atualizar produto no banco
            await base44.entities.Product.update(product.id, {
              id_bling: detalhe.id_bling,
              codigo_bling: detalhe.codigo_bling,
              status: 'exportado'
            });

            sucessos++;
            detalhes.push({
              produto: product.titulo,
              sucesso: true,
              id_bling: detalhe.id_bling
            });

            console.log(`✅ Produto exportado com sucesso! ID Bling: ${detalhe.id_bling}`);
          } else {
            erros++;
            detalhes.push({
              produto: product.titulo,
              sucesso: false,
              erro: data.error || 'Erro desconhecido'
            });
            console.error(`❌ Erro ao exportar: ${data.error}`);
          }

        } catch (err) {
          erros++;
          detalhes.push({
            produto: product.titulo,
            sucesso: false,
            erro: err.message
          });
          console.error(`❌ Exceção ao exportar ${product.titulo}:`, err);
        }

        // Pequeno delay entre produtos
        if (i < total - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setExportProgress(90);
      setExportProgressMessage("Finalizando exportação...");

      await refetch();

      setExportProgress(100);
      setExportProgressMessage("✅ Exportação concluída!");

      const totalImagensEstimative = sucessos * (grupo.produtos[0]?.galeria_imagens?.length || 0);
      const mensagemImagens = totalImagensEstimative > 0
        ? `\n\n🖼️  Imagens para ${sucessos} produtos foram adicionadas automaticamente!`
        : '\n\n⚠️ Algumas imagens podem não ter sido adicionadas.';

      alert(
        `✅ ${sucessos} produto(s) exportado(s) para o Bling!` +
        (erros > 0 ? `\n❌ ${erros} erro(s)` : '') +
        mensagemImagens +
        `\n\n📋 Os produtos estão prontos no Bling!\n\n` +
        `💡 Acesse o Bling para visualizar os produtos.`
      );

      setSelectedGroup(null);
      setActiveTab('importados');

    } catch (err) {
      const errorMessage = `❌ Erro: ${err.message}`;
      setExportError(errorMessage);
      console.error('Erro completo:', err);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setExportProgressMessage("");
    }
  };

  // ✅ FUNÇÃO COM PROGRESSO EM TEMPO REAL
  const addImagesToGroupInBling = async (grupo) => {
    const confirmMsg = `Deseja adicionar as imagens aos ${grupo.produtos.length} produtos deste grupo no Bling?\n\nAs imagens serão validadas (HTTPS, < 3MB, acessíveis).`;

    if (!confirm(confirmMsg)) return;

    setIsAddingImages(true);
    setAddImagesProgress(0);
    setAddImagesProgressMessage("Iniciando adição de imagens...");

    try {
      const user = await base44.auth.me();

      if (!user.bling_connected || !user.bling_access_token) {
        alert('❌ Conecte-se ao Bling primeiro!\n\nVá em Configurações → Conectar com Bling');
        setIsAddingImages(false);
        return;
      }

      let sucessos = 0;
      let erros = 0;
      const detalhesErros = [];
      const total = grupo.produtos.length;

      for (let i = 0; i < grupo.produtos.length; i++) {
        const product = grupo.produtos[i];

        setAddImagesProgressMessage(`Processando produto ${i + 1}/${total}: ${product.titulo.substring(0, 40)}...`);
        setAddImagesProgress(Math.round((i / total) * 100));

        try {
          if (!product.id_bling) {
            console.warn(`⚠️ Produto "${product.titulo}" não tem id_bling, pulando...`);
            erros++;
            detalhesErros.push(`${product.titulo}: Sem ID no Bling`);
            continue;
          }

          if (!product.galeria_imagens || product.galeria_imagens.length === 0) {
            console.warn(`⚠️ Produto "${product.titulo}" não tem imagens, pulando...`);
            erros++;
            detalhesErros.push(`${product.titulo}: Sem imagens`);
            continue;
          }

          console.log(`\n📤 Adicionando imagens ao produto: ${product.titulo}`);
          console.log(`   ID Bling: ${product.id_bling}`);
          console.log(`   Imagens: ${product.galeria_imagens.length}`);

          const result = await base44.functions.invoke('bling', {
            function: 'adicionarImagensProdutoBling',
            idProdutoBling: product.id_bling,
            imagensUrls: product.galeria_imagens,
            substituir: false
          });

          const data = result.data || result;

          if (data.success) {
            console.log(`✅ Imagens adicionadas com sucesso!`);
            console.log(`   Imagens antes: ${data.imagens_antes}`);
            console.log(`   Imagens depois: ${data.imagens_depois}`);
            console.log(`   Novas imagens: ${data.novas_imagens_adicionadas}`);
            sucessos++;
          } else {
            const errorMsg = data.error || JSON.stringify(data);
            console.error(`❌ Erro retornado do backend:`, errorMsg);
            erros++;
            detalhesErros.push(`${product.titulo}: ${errorMsg}`);
          }

        } catch (err) {
          console.error(`❌ EXCEÇÃO ao adicionar imagens para ${product.titulo}:`, err);
          erros++;
          detalhesErros.push(`${product.titulo}: ${err.message}`);
        }

        if (i < grupo.produtos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      setAddImagesProgress(100);
      setAddImagesProgressMessage("✅ Processo concluído!");

      let mensagemFinal = `✅ Processo concluído!\n\n✅ Sucessos: ${sucessos}\n❌ Erros: ${erros}`;

      if (detalhesErros.length > 0) {
        mensagemFinal += `\n\n❌ Detalhes dos erros:\n${detalhesErros.slice(0, 3).join('\n\n')}`;
        if (detalhesErros.length > 3) {
          mensagemFinal += `\n\n...e mais ${detalhesErros.length - 3} erros.`;
        }

        mensagemFinal += `\n\n💡 DICA: Abra o Console (F12) para ver logs COMPLETOS de cada imagem.`;
      }

      alert(mensagemFinal);

    } catch (err) {
      alert(`❌ Erro geral: ${err.message}\n\n💡 Abra o Console (F12) para ver detalhes completos.`);
      console.error('❌ ERRO GERAL:', err);
    } finally {
      setIsAddingImages(false);
      setAddImagesProgress(0);
      setAddImagesProgressMessage("");
    }
  };

  // ✅ FUNÇÃO COM PROGRESSO EM TEMPO REAL
  const addImagesToSingleProduct = async (product) => {
    if (!product.id_bling) {
      alert('❌ Este produto não tem ID do Bling. Exporte-o primeiro.');
      return;
    }

    if (!product.galeria_imagens || product.galeria_imagens.length === 0) {
      alert('❌ Este produto não tem imagens na galeria.');
      return;
    }

    const confirmMsg = `Adicionar ${product.galeria_imagens.length} imagem(ns) ao produto "${product.titulo}" no Bling?\n\nAs imagens serão validadas (HTTPS, < 3MB, acessíveis).`;

    if (!confirm(confirmMsg)) return;

    setIsAddingImages(true);
    setAddImagesProgress(50);
    setAddImagesProgressMessage(`Adicionando imagens ao produto...`);

    try {
      const user = await base44.auth.me();

      if (!user.bling_connected || !user.bling_access_token) {
        alert('❌ Conecte-se ao Bling primeiro!');
        setIsAddingImages(false);
        return;
      }

      console.log(`\n📤 Adicionando imagens ao produto: ${product.titulo}`);
      console.log(`   ID Bling: ${product.id_bling}`);
      console.log(`   Imagens: ${product.galeria_imagens.length}`);

      const result = await base44.functions.invoke('bling', {
        function: 'adicionarImagensProdutoBling',
        idProdutoBling: product.id_bling,
        imagensUrls: product.galeria_imagens,
        substituir: false
      });

      const data = result.data || result;

      setAddImagesProgress(100);
      setAddImagesProgressMessage("✅ Concluído!");

      if (data.success) {
        alert(
          `✅ Imagens adicionadas com sucesso!\n\n` +
          `📊 Detalhes:\n` +
          `• Imagens antes: ${data.imagens_antes}\n` +
          `• Imagens depois: ${data.imagens_depois}\n` +
          `• Novas imagens: ${data.novas_imagens_adicionadas}`
        );
      } else {
        const errorMsg = data.error || JSON.stringify(data);
        console.error(`❌ Erro retornado do backend:`, errorMsg);

        alert(
          `❌ Erro ao adicionar imagens:\n\n${errorMsg}\n\n` +
          `💡 DICA: Abra o Console (F12) para ver logs COMPLETOS.`
        );
      }

    } catch (err) {
      console.error(`❌ EXCEÇÃO:`, err);

      let errorDetail = err.message;
      if (err.response?.data) {
        errorDetail += `\n\nResposta: ${JSON.stringify(err.response.data)}`;
      }

      alert(`❌ Erro: ${errorDetail}\n\n💡 Abra o Console (F12) para ver detalhes completos.`);
    } finally {
      setIsAddingImages(false);
      setAddImagesProgress(0);
      setAddImagesProgressMessage("");
    }
  };


  const vincularTodosAoML = async (grupo) => {
    if (!confirm(`Deseja vincular TODOS os ${grupo.produtos.length} produtos deste grupo ao Mercado Livre?\n\n✅ As tags/atributos serão criadas AUTOMATICAMENTE no Bling\n✅ Categorias corretas do ML\n✅ Campos regulatórios configurados\n\nIsso pode levar alguns minutos.`)) {
      return;
    }

    setIsVinculandoTodos(true);
    setVinculacaoProgress(0);
    setVinculacaoProgressMessage("Iniciando vinculação...");

    try {
      const user = await base44.auth.me();

      if (!user.bling_connected || !user.bling_access_token) {
        alert('❌ Conecte-se ao Bling primeiro!');
        setIsVinculandoTodos(false);
        return;
      }

      let sucessos = 0;
      let erros = 0;
      const errosDetalhes = [];
      const total = grupo.produtos.length;
      let totalTagsCriadas = 0;

      for (let i = 0; i < grupo.produtos.length; i++) {
        const product = grupo.produtos[i];

        setVinculacaoProgressMessage(`Vinculando produto ${i + 1}/${total}: ${product.titulo.substring(0, 40)}...`);
        setVinculacaoProgress(Math.round((i / total) * 100));

        try {
          if (!product.id_bling) {
            erros++;
            errosDetalhes.push(`${product.titulo}: Sem ID do Bling`);
            continue;
          }

          if (product.marketplaces_vinculados?.some(m => m.nome === 'Mercado Livre')) {
            sucessos++;
            continue;
          }

          const precoOriginal = product.preco_sugerido || 50;
          const precoPromocional = parseFloat((precoOriginal * 0.85).toFixed(2));

          // ✅ GERAR DESCRIÇÃO HTML OTIMIZADA
          const prompt = `Descrição HTML profissional para Mercado Livre: ${product.titulo}. Categoria: ${product.categoria}. Máximo 3000 caracteres. Use p, strong, ul, li.`;

          const resultIA = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: false
          });

          const descricaoAnuncio = typeof resultIA === 'string' ? resultIA : resultIA.resposta || product.descricao;

          console.log(`\n🔗 Vinculando produto ${i + 1}/${total}: ${product.titulo}`);
          console.log(`   📂 Categoria ML: ${product.categoria_mercado_livre || 'Não definida'}`);
          console.log(`   🎨 Atributos ML:`, product.atributos_mercado_livre || 'Nenhum');

          // ✅ PASSAR DADOS COMPLETOS DO PRODUTO (tags serão criadas automaticamente no backend)
          const result = await base44.functions.invoke('bling', {
            function: 'vincularProdutoMercadoLivre',
            accessToken: user.bling_access_token,
            idProdutoBling: product.id_bling,
            precoOriginal: precoOriginal,
            precoPromocional: precoPromocional,
            descricaoAnuncio: descricaoAnuncio,
            produto: {
              categoria_mercado_livre: product.categoria_mercado_livre || 'Casa, Móveis e Decoração > Outros',
              atributos_mercado_livre: product.atributos_mercado_livre || {}
            }
          });

          const data = result.data || result;

          if (data.success) {
            const vinculacao = {
              nome: 'Mercado Livre',
              link: data.link,
              id_anuncio: data.id_anuncio,
              preco_original: precoOriginal,
              preco_promocional: precoPromocional,
              desconto: data.desconto_percentual || 15,
              frete_gratis: false,
              descricao_anuncio: descricaoAnuncio,
              categoria_usada: data.categoria_usada,
              atributos_usados: data.atributos_usados,
              criado_em: new Date().toISOString(),
              status_vinculacao: 'ativo'
            };

            const vinculacoes = product.marketplaces_vinculados || [];
            await base44.entities.Product.update(product.id, {
              marketplaces_vinculados: [...vinculacoes, vinculacao]
            });

            console.log(`✅ Produto vinculado com sucesso!`);
            console.log(`   Categoria usada: ${data.categoria_usada}`);
            console.log(`   Atributos enviados: ${Object.keys(data.atributos_usados || {}).length}`);

            // Contar tags criadas (estimativa)
            const numAtributos = Object.keys(data.atributos_usados || {}).filter(k => data.atributos_usados[k]).length;
            totalTagsCriadas += numAtributos;

            sucessos++;
          } else {
            erros++;
            errosDetalhes.push(`${product.titulo}: ${data.error || 'Erro desconhecido'}`);
            console.error(`❌ Erro ao vincular: ${data.error}`);
          }

        } catch (err) {
          console.error(`❌ Exceção ao vincular ${product.titulo}:`, err);
          erros++;
          errosDetalhes.push(`${product.titulo}: ${err.message}`);
        }

        if (i < grupo.produtos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      await refetch();

      setVinculacaoProgress(100);
      setVinculacaoProgressMessage("✅ Vinculação concluída!");

      let mensagemFinal = `✅ Vinculação concluída!\n\n📊 RESULTADOS:\n✅ Sucessos: ${sucessos}\n❌ Erros: ${erros}`;

      if (sucessos > 0) {
        mensagemFinal += `\n\n🏷️  TAGS CRIADAS NO BLING:\n`;
        mensagemFinal += `✅ Aproximadamente ${totalTagsCriadas} tags foram criadas/verificadas automaticamente!\n`;
        mensagemFinal += `(Ex: "Cor: Preto", "Material: Alumínio", "Marca: Topyhome")\n`;

        mensagemFinal += `\n📋 RECURSOS APLICADOS:\n`;
        mensagemFinal += `✅ Categorias hierárquicas completas do ML\n`;
        mensagemFinal += `✅ Atributos/tags específicos por produto\n`;
        mensagemFinal += `✅ Campos regulatórios: Anvisa/Anatel/MAPA = "Não precisa"\n`;
        mensagemFinal += `✅ Descrições HTML otimizadas\n`;
        mensagemFinal += `✅ Preços com desconto automático (15%)`;
      }

      if (erros > 0 && errosDetalhes.length > 0) {
        mensagemFinal += `\n\n❌ DETALHES DOS ERROS:\n${errosDetalhes.slice(0, 3).join('\n\n')}`;
        if (errosDetalhes.length > 3) {
          mensagemFinal += `\n\n...e mais ${errosDetalhes.length - 3} erros.`;
        }
        mensagemFinal += `\n\n💡 Verifique o Console (F12) para detalhes completos.`;
      }

      alert(mensagemFinal);

    } catch (err) {
      alert(`❌ Erro geral: ${err.message}\n\n💡 Abra o Console (F12) para ver detalhes.`);
      console.error('❌ ERRO GERAL:', err);
    } finally {
      setIsVinculandoTodos(false);
      setVinculacaoProgress(0);
      setVinculacaoProgressMessage("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (selectedGroup) {
    const grupo = [...gruposGerados, ...gruposImportados].find(g => g.id === selectedGroup);
    const isGrupoGerado = !grupo.produtos[0]?.id_bling;
    const isGrupoImportado = grupo.produtos[0]?.id_bling;
    const grupoSelectedCount = grupo.produtos.filter(p => selectedProducts.includes(p.id)).length;
    const allGrupoSelected = grupo.produtos.length > 0 && grupoSelectedCount === grupo.produtos.length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => { setSelectedGroup(null); setSelectedProducts([]); setExportError(null); }}
              className="border-2 font-semibold hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
              Voltar
            </Button>

            <div className="flex gap-2 flex-wrap">
              {selectedProducts.length > 0 && (
                <Button
                  onClick={deleteSelected}
                  disabled={isDeleting}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg font-bold"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Selecionados ({selectedProducts.length})
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={() => deleteGroup(grupo)}
                disabled={isDeleting}
                variant="outline"
                className="border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Grupo Inteiro
              </Button>

              {isGrupoGerado && (
                <Button
                  onClick={() => exportGroupToBling(grupo)}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg font-bold"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exportando {exportProgress}%...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar para Bling (COM IMAGENS)
                    </>
                  )}
                </Button>
              )}

              {isGrupoImportado && (
                <>
                  <Button
                    onClick={() => addImagesToGroupInBling(grupo)}
                    disabled={isAddingImages}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg font-bold"
                  >
                    {isAddingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adicionando {addImagesProgress}%...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Imagens no Bling
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => vincularTodosAoML(grupo)}
                    disabled={isVinculandoTodos}
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-yellow-900 shadow-lg font-bold"
                  >
                    {isVinculandoTodos ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Vinculando {vinculacaoProgress}%...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Vincular Todos ao Mercado Livre
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {exportError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <div className="flex items-start justify-between gap-4">
                  <pre className="whitespace-pre-wrap text-sm font-mono flex-1 max-h-96 overflow-y-auto">
                    {exportError}
                  </pre>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(exportError);
                      alert('✅ Erro copiado para área de transferência!');
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* ✅ PROGRESSO EM TEMPO REAL: Exportação */}
          {isExporting && (
            <Card className="mb-6 bg-blue-50 border-blue-200 shadow-xl">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                      {exportProgressMessage || "Exportando..."}
                    </span>
                    <span className="text-sm font-bold text-blue-600">{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="h-3" />
                  <p className="text-xs text-blue-700">
                    🖼️  As imagens estão sendo adicionadas automaticamente
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ✅ PROGRESSO EM TEMPO REAL: Adicionar Imagens */}
          {isAddingImages && (
            <Card className="mb-6 bg-purple-50 border-purple-200 shadow-xl">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-900">
                      {addImagesProgressMessage || "Adicionando imagens..."}
                    </span>
                    <span className="text-sm font-bold text-purple-600">{addImagesProgress}%</span>
                  </div>
                  <Progress value={addImagesProgress} className="h-3" />
                  <p className="text-xs text-purple-700">
                    🖼️  Validando e adicionando imagens aos produtos
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ✅ PROGRESSO EM TEMPO REAL: Vinculação ML */}
          {isVinculandoTodos && (
            <Card className="mb-6 bg-yellow-50 border-yellow-200 shadow-xl">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-900">
                      {vinculacaoProgressMessage || "Vinculando ao Mercado Livre..."}
                    </span>
                    <span className="text-sm font-bold text-yellow-600">{vinculacaoProgress}%</span>
                  </div>
                  <Progress value={vinculacaoProgress} className="h-3" />
                  <p className="text-xs text-yellow-700">
                    🏷️  Criando tags e vinculando produtos
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isGrupoImportado && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Produtos já exportados para o Bling!
                <br />
                <span className="text-xs mt-1 block">
                  • Use <strong>"Adicionar Imagens no Bling"</strong> para enviar as imagens aos produtos
                  <br />
                  • Use <strong>"Vincular Todos ao ML"</strong> para criar os anúncios no Mercado Livre
                </span>
              </AlertDescription>
            </Alert>
          )}

          <Card className="mb-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900">{grupo.nome}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{grupo.categoria}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className="w-fit bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 font-bold shadow-md">
                        {grupo.produtos.length} produtos
                      </Badge>
                      {isGrupoImportado && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 font-bold shadow-md">
                          Exportado no Bling
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border-2 border-slate-200">
                  <Checkbox
                    checked={allGrupoSelected}
                    onCheckedChange={() => toggleSelectAll(grupo)}
                  />
                  <span className="text-sm text-slate-700 font-semibold">Selecionar Todos</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {grupo.produtos.map((product) => (
              <Card
                key={product.id}
                className={`shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                  selectedProducts.includes(product.id)
                    ? 'ring-4 ring-blue-500 border-blue-300 bg-blue-50/30'
                    : 'border-slate-200 bg-white/80 backdrop-blur-sm'
                }`}
              >
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-[auto,200px,1fr] gap-6">
                    <div className="flex items-start pt-2">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleSelectProduct(product.id)}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="space-y-2">
                      {product.galeria_imagens && product.galeria_imagens.length > 0 ? (
                        <>
                          <img
                            src={product.galeria_imagens[0]}
                            alt={product.titulo}
                            className="w-full h-48 object-cover rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-slate-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/400?text=Sem+Imagem';
                            }}
                          />
                          {product.galeria_imagens.length > 1 && (
                            <div className="flex gap-2 flex-wrap">
                              {product.galeria_imagens.slice(1, 4).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`${product.titulo} ${idx + 2}`}
                                  className="w-12 h-12 object-cover rounded-lg shadow-sm hover:scale-110 transition-transform border border-slate-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ))}
                              {product.galeria_imagens.length > 4 && (
                                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm border border-slate-200">
                                  +{product.galeria_imagens.length - 4}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-inner">
                          <ImageIcon className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
                          <h3 className="text-xl font-bold text-slate-900 leading-tight">
                            {product.titulo}
                          </h3>
                          <div className="flex gap-2 items-center flex-wrap">
                            {product.id_bling && product.galeria_imagens?.length > 0 && (
                              <Button
                                onClick={() => addImagesToSingleProduct(product)}
                                disabled={isAddingImages}
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md font-bold"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Imgs
                              </Button>
                            )}

                            <Button
                              onClick={() => deleteSingleProduct(product)}
                              disabled={isDeleting}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {product.preco_sugerido && (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg px-4 py-1.5 shadow-md border-0 font-bold">
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                {product.preco_sugerido.toFixed(2)}
                              </Badge>
                            )}
                            {product.id_bling && (
                              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 font-bold shadow-md">
                                ✅ No Bling
                              </Badge>
                            )}
                          </div>
                        </div>

                        {product.descricao && (
                          <p className="text-sm text-slate-600 mt-3 line-clamp-3 bg-slate-50 p-3 rounded-xl font-medium">
                            {product.descricao}
                          </p>
                        )}

                        {product.marketplaces_vinculados && product.marketplaces_vinculados.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {product.marketplaces_vinculados.map((mp, idx) => (
                              <div key={idx} className="inline-flex flex-col gap-1 px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl text-xs shadow-md">
                                <div className="flex items-center gap-2">
                                  {mp.link ? (
                                    <a
                                      href={mp.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-bold text-yellow-800 hover:text-yellow-900 flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      {mp.nome}
                                    </a>
                                  ) : (
                                    <span className="font-bold text-yellow-800">{mp.nome}</span>
                                  )}
                                </div>
                                {mp.id_anuncio && (
                                  <span className="text-xs text-yellow-600 font-semibold">ID: {mp.id_anuncio}</span>
                                )}
                                {mp.preco_promocional && (
                                  <div className="flex items-center gap-2">
                                    {mp.preco_original && (
                                      <span className="text-xs text-slate-500 line-through font-medium">
                                        R$ {mp.preco_original.toFixed(2)}
                                      </span>
                                    )}
                                    <span className="text-xs font-black text-green-700">
                                      R$ {mp.preco_promocional.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Melhorado */}
        <div className="mb-8 relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="relative">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-1.5 text-sm font-semibold">
              <Package className="w-4 h-4 mr-2" />
              Gerenciamento
            </Badge>
            <h1 className="text-5xl font-black text-slate-900 mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Meus Produtos
            </h1>
            <p className="text-slate-600 text-xl font-medium">
              📦 Gerencie e exporte seus produtos para marketplaces
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-slate-100 rounded-2xl">
            <TabsTrigger
              value="gerados"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold"
            >
              <Zap className="w-4 h-4" />
              Produtos Gerados ({gruposGerados.length})
            </TabsTrigger>
            <TabsTrigger
              value="importados"
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold"
            >
              <Download className="w-4 h-4" />
              Exportados no Bling ({gruposImportados.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gerados">
            <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300 shadow-md">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800 font-semibold">
                ℹ️ Estes produtos ainda não foram exportados para o Bling. Clique em um grupo para exportá-los.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-3 gap-6">
              {gruposGerados.map((grupo) => (
                <Card
                  key={grupo.id}
                  className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm shadow-lg"
                  onClick={() => setSelectedGroup(grupo.id)}
                >
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                    <CardTitle className="text-xl font-black text-slate-900">{grupo.nome}</CardTitle>
                    <p className="text-sm text-slate-600 font-semibold">{grupo.categoria}</p>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Badge className="mb-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 font-bold shadow-md">
                      <Package className="w-4 h-4 mr-2" />
                      {grupo.produtos.length} produtos
                    </Badge>
                    {grupo.produtos[0]?.galeria_imagens?.[0] && (
                      <img
                        src={grupo.produtos[0].galeria_imagens[0]}
                        alt={grupo.nome}
                        className="w-full h-40 object-cover rounded-2xl shadow-md border-2 border-slate-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
              {gruposGerados.length === 0 && (
                <Card className="col-span-3 text-center py-16 shadow-lg border-0 bg-gradient-to-br from-slate-50 to-slate-100">
                  <CardContent>
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-bold text-lg mb-2">Nenhum produto pendente de exportação</p>
                    <p className="text-sm text-slate-500 font-medium">
                      Todos os produtos já foram exportados para o Bling!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="importados">
            <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800 font-semibold">
                ✅ Estes produtos já estão no Bling! Você pode reimportá-los a qualquer momento ou vinculá-los aos marketplaces.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-3 gap-6">
              {gruposImportados.map((grupo) => (
                <Card
                  key={grupo.id}
                  className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm shadow-lg"
                  onClick={() => setSelectedGroup(grupo.id)}
                >
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                    <CardTitle className="text-xl font-black text-slate-900">{grupo.nome}</CardTitle>
                    <p className="text-sm text-slate-600 font-semibold">{grupo.categoria}</p>
                    <Badge className="mt-2 w-fit bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 font-bold shadow-md">
                      No Bling
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Badge className="mb-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 font-bold shadow-md">
                      <Package className="w-4 h-4 mr-2" />
                      {grupo.produtos.length} produtos
                    </Badge>
                    {grupo.produtos[0]?.galeria_imagens?.[0] && (
                      <img
                        src={grupo.produtos[0].galeria_imagens[0]}
                        alt={grupo.nome}
                        className="w-full h-40 object-cover rounded-2xl shadow-md border-2 border-slate-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
              {gruposImportados.length === 0 && (
                <Card className="col-span-3 text-center py-16 shadow-lg border-0 bg-gradient-to-br from-slate-50 to-slate-100">
                  <CardContent>
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-bold text-lg mb-2">Nenhum produto exportado ainda</p>
                    <p className="text-sm text-slate-500 font-medium">
                      Vá em "Produtos Gerados" e exporte um grupo para o Bling
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
