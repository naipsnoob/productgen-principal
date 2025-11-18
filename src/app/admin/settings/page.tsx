"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Settings,
  LogOut,
  Bell,
  Search,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Key,
  RefreshCw
} from "lucide-react";

interface MarketplaceConfig {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  clientId: string;
  clientSecret: string;
  apiKey?: string;
  sellerId?: string;
  storeId?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [marketplaces, setMarketplaces] = useState<MarketplaceConfig[]>([
    {
      id: "mercadolivre",
      name: "Mercado Livre",
      logo: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&h=100&fit=crop",
      connected: false,
      clientId: "",
      clientSecret: "",
      sellerId: ""
    },
    {
      id: "amazon",
      name: "Amazon",
      logo: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&h=100&fit=crop",
      connected: false,
      clientId: "",
      clientSecret: "",
      sellerId: ""
    },
    {
      id: "shopee",
      name: "Shopee",
      logo: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=100&h=100&fit=crop",
      connected: false,
      clientId: "",
      clientSecret: "",
      apiKey: "",
      storeId: ""
    },
    {
      id: "magazineluiza",
      name: "Magazine Luiza",
      logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop",
      connected: false,
      clientId: "",
      clientSecret: "",
      sellerId: ""
    },
    {
      id: "americanas",
      name: "Americanas",
      logo: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop",
      connected: false,
      clientId: "",
      clientSecret: "",
      sellerId: ""
    },
    {
      id: "casasbahia",
      name: "Casas Bahia",
      logo: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=100&h=100&fit=crop",
      connected: false,
      clientId: "",
      clientSecret: "",
      sellerId: ""
    },
    {
      id: "viavarejo",
      name: "Via Varejo",
      logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
      connected: false,
      clientId: "",
      clientSecret: "",
      sellerId: ""
    },
    {
      id: "b2w",
      name: "B2W (Submarino)",
      logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop",
      connected: false,
      clientId: "",
      clientSecret: "",
      sellerId: ""
    }
  ]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      loadSavedConfigs();
    }
  }, [router]);

  const loadSavedConfigs = () => {
    const saved = localStorage.getItem("marketplaceConfigs");
    if (saved) {
      try {
        setMarketplaces(JSON.parse(saved));
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  const toggleShowSecret = (marketplaceId: string, field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [`${marketplaceId}-${field}`]: !prev[`${marketplaceId}-${field}`]
    }));
  };

  const handleInputChange = (
    marketplaceId: string,
    field: string,
    value: string
  ) => {
    setMarketplaces(prev =>
      prev.map(mp =>
        mp.id === marketplaceId ? { ...mp, [field]: value } : mp
      )
    );
  };

  const testConnection = async (marketplaceId: string) => {
    const marketplace = marketplaces.find(mp => mp.id === marketplaceId);
    if (!marketplace) return;

    // Validação básica
    if (!marketplace.clientId || !marketplace.clientSecret) {
      alert("Por favor, preencha Client ID e Client Secret");
      return;
    }

    // Simular teste de conexão
    setMarketplaces(prev =>
      prev.map(mp =>
        mp.id === marketplaceId
          ? { ...mp, connected: true }
          : mp
      )
    );

    alert(`Conexão com ${marketplace.name} testada com sucesso!`);
  };

  const saveAllConfigs = () => {
    try {
      localStorage.setItem("marketplaceConfigs", JSON.stringify(marketplaces));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/admin/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-8 h-8 text-orange-500" />
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Brodi Hub
                </span>
              </div>
              <Badge className="bg-orange-100 text-orange-700">Configurações</Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 w-64"
                />
              </div>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configurações de Integrações
          </h1>
          <p className="text-gray-600">
            Configure as credenciais de API para conectar seus marketplaces
          </p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">
              Configurações salvas com sucesso!
            </p>
          </div>
        )}

        {/* Info Card */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Key className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                Como obter suas credenciais de API
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Acesse o painel de desenvolvedor de cada marketplace</li>
                <li>• Crie um aplicativo ou integração</li>
                <li>• Copie o Client ID e Client Secret fornecidos</li>
                <li>• Cole as credenciais nos campos abaixo</li>
                <li>• Teste a conexão antes de salvar</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Marketplaces Grid */}
        <div className="grid gap-6 mb-8">
          {marketplaces.map((marketplace) => (
            <Card key={marketplace.id} className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={marketplace.logo}
                    alt={marketplace.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {marketplace.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {marketplace.connected ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Conectado
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Não conectado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => testConnection(marketplace.id)}
                  variant="outline"
                  size="sm"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Testar Conexão
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Client ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client ID *
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets[`${marketplace.id}-clientId`] ? "text" : "password"}
                      value={marketplace.clientId}
                      onChange={(e) =>
                        handleInputChange(marketplace.id, "clientId", e.target.value)
                      }
                      placeholder="Digite o Client ID"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret(marketplace.id, "clientId")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets[`${marketplace.id}-clientId`] ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Client Secret */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Secret *
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets[`${marketplace.id}-clientSecret`] ? "text" : "password"}
                      value={marketplace.clientSecret}
                      onChange={(e) =>
                        handleInputChange(marketplace.id, "clientSecret", e.target.value)
                      }
                      placeholder="Digite o Client Secret"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowSecret(marketplace.id, "clientSecret")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets[`${marketplace.id}-clientSecret`] ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* API Key (para Shopee) */}
                {marketplace.apiKey !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets[`${marketplace.id}-apiKey`] ? "text" : "password"}
                        value={marketplace.apiKey}
                        onChange={(e) =>
                          handleInputChange(marketplace.id, "apiKey", e.target.value)
                        }
                        placeholder="Digite a API Key"
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret(marketplace.id, "apiKey")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showSecrets[`${marketplace.id}-apiKey`] ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Seller ID */}
                {marketplace.sellerId !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seller ID / Loja ID
                    </label>
                    <input
                      type="text"
                      value={marketplace.sellerId}
                      onChange={(e) =>
                        handleInputChange(marketplace.id, "sellerId", e.target.value)
                      }
                      placeholder="Digite o ID do vendedor"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}

                {/* Store ID (para Shopee) */}
                {marketplace.storeId !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store ID
                    </label>
                    <input
                      type="text"
                      value={marketplace.storeId}
                      onChange={(e) =>
                        handleInputChange(marketplace.id, "storeId", e.target.value)
                      }
                      placeholder="Digite o Store ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/dashboard")}
          >
            Cancelar
          </Button>
          <Button
            onClick={saveAllConfigs}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
          >
            <Save className="w-5 h-5 mr-2" />
            Salvar Todas as Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}
