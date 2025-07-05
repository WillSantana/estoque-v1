import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  Truck,
  Tag
} from "lucide-react";
import { format, isAfter, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

import { productsService } from "@/services/products"; // ✅ Correto agora

import StatsCards from "./StatsCards";
import ProductsChart from "./ProductsChart";
import ExpirationAlerts from "./ExpirationAlerts";
import TopBrands from "./TopBrands";
import RecentProducts from "./RecentProducts";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productsService.list("-created_at"); // ✅ Correto agora
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
    setIsLoading(false);
  };

  const getExpiringProducts = () => {
    const thirtyDaysFromNow = addDays(new Date(), 30);
    return products.filter(product => {
      if (!product.data_validade) return false;
      const expirationDate = new Date(product.data_validade);
      return expirationDate <= thirtyDaysFromNow;
    });
  };

  const getTotalValue = () => {
    return products.reduce((sum, product) => sum + (product.preco * product.quantidade || 0), 0);
  };

  const getTotalQuantity = () => {
    return products.reduce((sum, product) => sum + (product.quantidade || 0), 0);
  };

  const getTopBrands = () => {
    const brandCount = {};
    products.forEach(product => {
      brandCount[product.marca] = (brandCount[product.marca] || 0) + 1;
    });
    return Object.entries(brandCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const expiringProducts = getExpiringProducts();

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-green-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg">Visão geral do seu estoque</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCards
            title="Total de Produtos"
            value={products.length}
            icon={Package}
            bgColor="bg-green-500"
            trend={`${getTotalQuantity()} unidades`}
            isLoading={isLoading}
          />
          <StatsCards
            title="Valor Total"
            value={`R$ ${getTotalValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            bgColor="bg-blue-500"
            trend="Em estoque"
            isLoading={isLoading}
          />
          <StatsCards
            title="Próximos ao Vencimento"
            value={expiringProducts.length}
            icon={AlertTriangle}
            bgColor="bg-yellow-500"
            trend="Próximos 30 dias"
            isLoading={isLoading}
          />
          <StatsCards
            title="Marcas Cadastradas"
            value={new Set(products.map(p => p.marca)).size}
            icon={Tag}
            bgColor="bg-purple-500"
            trend="Diferentes marcas"
            isLoading={isLoading}
          />
        </div>

        {/* Charts and Lists */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ProductsChart products={products} isLoading={isLoading} />
            <RecentProducts products={products.slice(0, 5)} isLoading={isLoading} />
          </div>

          <div className="space-y-8">
            <ExpirationAlerts products={expiringProducts} isLoading={isLoading} />
            <TopBrands brands={getTopBrands()} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
