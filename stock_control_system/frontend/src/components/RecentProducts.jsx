import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

// Função utilitária para lidar com datas inválidas
function formatDateSafe(dateStr) {
  if (!dateStr) return "Data desconhecida";
  const parsedDate = new Date(dateStr);
  return isNaN(parsedDate.getTime())
    ? "Data inválida"
    : format(parsedDate, "dd/MM/yyyy", { locale: ptBR });
}

// Função segura para formatar preços
function formatPrice(value) {
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

export default function RecentProducts({ products, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Produtos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Clock className="w-5 h-5 text-blue-500" />
          Produtos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum produto cadastrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900">{product.nome}</p>
                  <p className="text-sm text-gray-500">{product.marca} • {product.distribuidora}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Cadastrado em {formatDateSafe(product.data_cadastro)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">
                    {product.unidades} un.
                  </Badge>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    R$ {formatPrice(product.preco)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
