import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateSafe(dateStr) {
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) 
    ? "Data inválida" 
    : format(parsed, "dd/MM/yyyy", { locale: ptBR });
}

function getDaysUntilExpiration(dateStr) {
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : differenceInDays(parsed, new Date());
}

export default function ExpirationAlerts({ products = [], isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Alertas de Vencimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
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

  const getAlertColor = (days) => {
    if (days === null) return "bg-gray-100 text-gray-800 border-gray-200";
    if (days < 0 || days <= 7) return "bg-red-100 text-red-800 border-red-200";
    if (days <= 15) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getAlertText = (days) => {
    if (days === null) return "Data inválida";
    if (days < 0) return "Vencido";
    if (days === 0) return "Vence hoje";
    if (days === 1) return "1 dia";
    return `${days} dias`;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Alertas de Vencimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum produto próximo ao vencimento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 5).map((product) => {
              const days = getDaysUntilExpiration(product.data_validade);
              return (
                <div key={product.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900">{product.nome}</p>
                    <p className="text-sm text-gray-500">{product.marca}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Validade: {formatDateSafe(product.data_validade)}
                    </p>
                  </div>
                  <Badge className={`${getAlertColor(days)} border font-medium`}>
                    {getAlertText(days)}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
