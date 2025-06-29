import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, productsAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Loader2, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Eye
} from 'lucide-react';
import '../App.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [statsData, expiringData] = await Promise.all([
        dashboardAPI.getStats(),
        productsAPI.getExpiringSoon(30)
      ]);
      
      setStats(statsData);
      setExpiringSoon(expiringData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Cores para os gráficos
  const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu estoque
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_produtos || 0}</div>
            <p className="text-xs text-muted-foreground">
              produtos em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total do Estoque
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.total_valor_estoque || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              valor total investido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produtos Vencidos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats?.produtos_vencidos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              produtos vencidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximos ao Vencimento
            </CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.produtos_proximos_vencimento || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              próximos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de marcas mais registradas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Marcas Mais Registradas
            </CardTitle>
            <CardDescription>
              Top 5 marcas com mais produtos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.marcas_mais_registradas?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.marcas_mais_registradas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="marca" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de tipos de produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Tipos de Produtos
            </CardTitle>
            <CardDescription>
              Distribuição por tipo de produto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.tipos_mais_registrados?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.tipos_mais_registrados}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tipo_produto, percent }) => 
                      `${tipo_produto} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="tipo_produto"
                  >
                    {stats.tipos_mais_registrados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de produtos próximos ao vencimento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
                Produtos Próximos ao Vencimento
              </CardTitle>
              <CardDescription>
                Produtos que vencem nos próximos 30 dias
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products?status_validade=proximo_vencimento">
                <Eye className="mr-2 h-4 w-4" />
                Ver Todos
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {expiringSoon.length > 0 ? (
            <div className="space-y-4">
              {expiringSoon.slice(0, 5).map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {product.marca} - {product.tipo_produto}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Fornecedor: {product.fornecedor} | Quantidade: {product.quantidade}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-600">
                      Vence em: {formatDate(product.data_validade)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(product.preco)}
                    </p>
                  </div>
                </div>
              ))}
              {expiringSoon.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <Link to="/products?status_validade=proximo_vencimento">
                      Ver mais {expiringSoon.length - 5} produtos
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto próximo ao vencimento</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de fornecedores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Fornecedores Mais Utilizados
          </CardTitle>
          <CardDescription>
            Top 5 fornecedores com mais produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.fornecedores_mais_utilizados?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.fornecedores_mais_utilizados} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="fornecedor" 
                  type="category" 
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

