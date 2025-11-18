"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Calendar,
  ArrowUp,
  ArrowDown,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: "Vendas Hoje",
      value: "R$ 45.890",
      change: "+23.5%",
      trend: "up",
      icon: <DollarSign className="w-6 h-6" />,
      color: "green"
    },
    {
      title: "Pedidos",
      value: "1.247",
      change: "+18.2%",
      trend: "up",
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "blue"
    },
    {
      title: "Produtos Ativos",
      value: "3.456",
      change: "+5.4%",
      trend: "up",
      icon: <Package className="w-6 h-6" />,
      color: "purple"
    },
    {
      title: "Clientes",
      value: "8.932",
      change: "+12.8%",
      trend: "up",
      icon: <Users className="w-6 h-6" />,
      color: "orange"
    }
  ];

  const recentOrders = [
    {
      id: "#12345",
      customer: "João Silva",
      marketplace: "Mercado Livre",
      value: "R$ 459,90",
      status: "pending",
      time: "5 min atrás"
    },
    {
      id: "#12344",
      customer: "Maria Santos",
      marketplace: "Amazon",
      value: "R$ 1.299,00",
      status: "completed",
      time: "12 min atrás"
    },
    {
      id: "#12343",
      customer: "Pedro Costa",
      marketplace: "Shopee",
      value: "R$ 89,90",
      status: "processing",
      time: "25 min atrás"
    },
    {
      id: "#12342",
      customer: "Ana Paula",
      marketplace: "Magazine Luiza",
      value: "R$ 2.450,00",
      status: "completed",
      time: "1 hora atrás"
    }
  ];

  const marketplaceStats = [
    { name: "Mercado Livre", sales: "R$ 125.890", orders: 456, percentage: 35 },
    { name: "Amazon", sales: "R$ 98.450", orders: 312, percentage: 28 },
    { name: "Shopee", sales: "R$ 67.230", orders: 289, percentage: 19 },
    { name: "Magazine Luiza", sales: "R$ 54.120", orders: 190, percentage: 18 }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Completo</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="w-3 h-3 mr-1" />Processando</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700"><AlertCircle className="w-3 h-3 mr-1" />Pendente</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-8 h-8 text-orange-500" />
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Brodi Hub
                </span>
              </div>
              <Badge className="bg-orange-100 text-orange-700">Admin</Badge>
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
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => router.push("/admin/settings")}
              >
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo de volta! 👋
          </h1>
          <p className="text-gray-600">
            Aqui está o resumo das suas vendas hoje
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <div className={`text-${stat.color}-600`}>{stat.icon}</div>
                </div>
                <Badge
                  className={`${
                    stat.trend === "up"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pedidos Recentes</h2>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todos
              </Button>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.marketplace}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 mb-1">{order.value}</p>
                    {getStatusBadge(order.status)}
                    <p className="text-xs text-gray-500 mt-1">{order.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Marketplace Performance */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Performance por Marketplace
            </h2>
            <div className="space-y-4">
              {marketplaceStats.map((marketplace, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {marketplace.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {marketplace.sales}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                      style={{ width: `${marketplace.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{marketplace.orders} pedidos</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sales Chart Placeholder */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Vendas dos Últimos 7 Dias</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Últimos 7 dias
              </Button>
            </div>
          </div>
          <div className="h-64 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <p className="text-gray-600">Gráfico de vendas</p>
              <p className="text-sm text-gray-500">Visualização em desenvolvimento</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
