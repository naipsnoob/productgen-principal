import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Package, Zap, CheckCircle, Clock, FileDown, TrendingUp, Sparkles, ArrowRight, Rocket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
    initialData: [],
  });

  const stats = {
    total: products.length,
    prontos: products.filter(p => p.status === 'pronto').length,
    rascunhos: products.filter(p => p.status === 'rascunho').length,
    exportados: products.filter(p => p.status === 'exportado').length,
  };

  const recentProducts = products.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Melhorado */}
        <div className="mb-10 relative">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-3 py-1 text-xs font-bold mb-1">
                  Dashboard
                </Badge>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">
                  Bem-vindo ao ProductGen
                </h1>
              </div>
            </div>
            <p className="text-slate-600 text-lg font-semibold">
              🚀 Automatize a criação de produtos para seus marketplaces com inteligência artificial
            </p>
          </div>
        </div>

        {/* CTA Principal com Visual Moderno */}
        <Card className="mb-10 border-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-green-500 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          
          <CardContent className="p-10 md:p-12 relative">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="text-white flex-1 space-y-6">
                <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2">
                  <Rocket className="w-5 h-5 text-white animate-pulse" />
                  <span className="text-sm font-bold">Geração Automática</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black leading-tight">
                  Gere múltiplos produtos automaticamente
                </h2>
                
                <p className="text-white/90 text-lg leading-relaxed">
                  Faça upload de uma imagem e crie até <span className="font-black text-white">100 variações</span> de produtos com títulos únicos, 
                  descrições otimizadas e imagens em alta qualidade
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">IA Avançada</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">Integração Bling</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">Imagens 1200x1200</span>
                  </div>
                </div>
              </div>
              
              <Link to={createPageUrl("Upload")} className="flex-shrink-0">
                <Button 
                  size="lg" 
                  className="bg-white text-cyan-600 hover:bg-blue-50 shadow-2xl font-black text-xl px-10 py-8 rounded-2xl group transition-all duration-300 hover:scale-105"
                >
                  <Zap className="w-7 h-7 mr-3 group-hover:animate-bounce" />
                  Começar Agora
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards com Visual Moderno */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-500 opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-500">
                  Total de Produtos
                </CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-black text-slate-900 mb-1">{stats.total}</div>
              <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>Produtos criados</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-500">
                  Prontos
                </CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-black text-slate-900 mb-1">{stats.prontos}</div>
              <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
                <Sparkles className="w-4 h-4 text-green-500" />
                <span>Listados para venda</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-500">
                  Rascunhos
                </CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-black text-slate-900 mb-1">{stats.rascunhos}</div>
              <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Em edição</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-400 to-slate-600 opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="pb-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-500">
                  Exportados
                </CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <FileDown className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-black text-slate-900 mb-1">{stats.exportados}</div>
              <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
                <Zap className="w-4 h-4 text-slate-500" />
                <span>No Bling</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Produtos Recentes com Visual Moderno */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50 p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900">
                    Produtos Recentes
                  </CardTitle>
                  <p className="text-sm text-slate-500 font-semibold">Seus últimos produtos criados</p>
                </div>
              </div>
              <Link to={createPageUrl("Products")}>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-bold shadow-lg group">
                  Ver Todos
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="font-semibold text-lg">Carregando...</p>
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Package className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-slate-900 mb-2 font-black text-2xl">
                  Nenhum produto ainda
                </h3>
                <p className="text-slate-600 mb-8 font-semibold text-lg">
                  Comece criando seu primeiro produto agora
                </p>
                <Link to={createPageUrl("Upload")}>
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-2xl font-black text-lg px-8 py-7">
                    <Zap className="w-6 h-6 mr-2" />
                    Criar Primeiro Produto
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-5 p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white group"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={product.imagem_url}
                        alt={product.titulo}
                        className="w-24 h-24 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 truncate text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {product.titulo}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span>{product.categoria || 'Sem categoria'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {product.status === 'pronto' && (
                        <Badge className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 font-bold shadow-md">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Pronto
                        </Badge>
                      )}
                      {product.status === 'rascunho' && (
                        <Badge className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-bold shadow-md">
                          <Clock className="w-4 h-4 mr-2" />
                          Rascunho
                        </Badge>
                      )}
                      {product.status === 'exportado' && (
                        <Badge className="px-4 py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white border-0 font-bold shadow-md">
                          <FileDown className="w-4 h-4 mr-2" />
                          Exportado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção de Recursos com Visual Moderno */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <Card className="border-0 shadow-lg bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-black text-slate-900 text-xl mb-3">Geração Rápida</h3>
              <p className="text-slate-600 font-semibold leading-relaxed">
                Crie até 100 variações de produtos em minutos com IA avançada
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-black text-slate-900 text-xl mb-3">Imagens Otimizadas</h3>
              <p className="text-slate-600 font-semibold leading-relaxed">
                Todas as imagens são redimensionadas e comprimidas automaticamente
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <FileDown className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-black text-slate-900 text-xl mb-3">Integração Bling</h3>
              <p className="text-slate-600 font-semibold leading-relaxed">
                Exporte diretamente para o Bling com um clique
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}