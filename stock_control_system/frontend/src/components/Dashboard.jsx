import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../lib/api'; // Supondo que você tenha uma API para buscar os dados
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Loader2, Package, DollarSign, AlertTriangle, Tag, Clock, ArrowUp, User, CheckCircle, XCircle
} from 'lucide-react';
import '../App.css';

// Dados de exemplo para visualização, caso a API não retorne nada
const sampleStats = {
  total_produtos: 6,
  total_unidades: 195,
  total_valor_estoque: 17461.00,
  produtos_proximos_vencimento: 2,
  marcas_cadastradas: 6,
  produtos_por_tipo: [
    { name: 'Ração', value: 3 },
    { name: 'Medicamento', value: 2 },
    { name: 'Acessório', value: 1 },
  ],
  alertas_vencimento: [
    { id: 1, nome: 'Antipulgas e Carrapatos', marca: 'Bayer', validade: '2025-06-14', status: 'Vencido' },
    { id: 2, nome: 'Vermífugo Broad Spectrum', marca: 'Vetnil', validade: '2025-01-14', status: 'Vencido' },
  ],
  produtos_recentes: [
    { id: 3, nome: 'Ração Premium Cães Adultos', marca: 'Royal Canin', distribuidora: 'Distribuidora Pet Center', data_cadastro: '2025-07-02', unidades: 25, preco: 189.90 },
  ],
  top_marcas: [
    { id: 'R', nome: 'Royal Canin', produtos: 1, cor: 'bg-purple-100 text-purple-600' },
    { id: 'B', nome: 'Bayer', produtos: 1, cor: 'bg-blue-100 text-blue-600' },
    { id: 'W', nome: 'Whiskas', produtos: 1, cor: 'bg-indigo-100 text-indigo-600' },
  ]
};

// Componente para os cards de estatísticas
const StatCard = ({ title, value, subtext, icon: Icon, colorClass, trend }) => (
  <Card className="shadow-md border-none rounded-xl">
    <CardContent className="p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        <div className="flex items-center text-xs text-gray-500 mt-2">
          {trend && <ArrowUp className="h-3 w-3 mr-1 text-green-500" />}
          <span>{subtext}</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState(sampleStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Se você tiver uma API, pode descomentar este useEffect para buscar dados reais
  /*
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        const statsData = await dashboardAPI.getStats(); // Chame sua API aqui
        setStats(statsData);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Não foi possível carregar os dados do dashboard.');
        setStats(sampleStats); // Usa dados de exemplo em caso de erro
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);
  */

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do seu estoque</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Produtos" value={stats.total_produtos} subtext={`${stats.total_unidades} unidades`} icon={Package} colorClass="bg-green-200" trend />
        <StatCard title="Valor Total" value={formatCurrency(stats.total_valor_estoque)} subtext="Em estoque" icon={DollarSign} colorClass="bg-blue-200" />
        <StatCard title="Próximos ao Vencimento" value={stats.produtos_proximos_vencimento} subtext="Próximos 30 dias" icon={AlertTriangle} colorClass="bg-yellow-200" trend />
        <StatCard title="Marcas Cadastradas" value={stats.marcas_cadastradas} subtext="Diferentes marcas" icon={Tag} colorClass="bg-purple-200" />
      </div>

      {/* Seção Principal (Gráficos e Alertas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Gráfico e Produtos Recentes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico de Produtos por Tipo */}
          <Card className="shadow-md border-none rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">Produtos por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.produtos_por_tipo} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip wrapperClassName="!rounded-lg !border-gray-200" cursor={{ fill: 'rgba(230, 230, 230, 0.4)' }} />
                  <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Produtos Recentes */}
          <Card className="shadow-md border-none rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-500" /> Produtos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.produtos_recentes.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 -m-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-800">{p.nome}</p>
                      <p className="text-sm text-gray-500">{p.marca} • {p.distribuidora}</p>
                      <p className="text-xs text-gray-400 mt-1">Cadastrado em {formatDate(p.data_cadastro)}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">{p.unidades} un.</span>
                      <p className="font-bold text-gray-800 mt-2">{formatCurrency(p.preco)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Alertas e Top Marcas */}
        <div className="lg:col-span-1 space-y-6">
          {/* Alertas de Vencimento */}
          <Card className="shadow-md border-none rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" /> Alertas de Vencimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.alertas_vencimento.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 -m-3 bg-red-50/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{a.nome}</p>
                    <p className="text-sm text-gray-500">{a.marca}</p>
                    <p className="text-xs text-gray-400 mt-1">Validade: {formatDate(a.validade)}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">{a.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Marcas */}
          <Card className="shadow-md border-none rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-gray-500" /> Top Marcas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.top_marcas.map((m, index) => (
                <div key={m.id} className="flex items-center justify-between p-3 -m-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${m.cor}`}>
                      {m.id}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{m.nome}</p>
                      <p className="text-sm text-gray-500">{m.produtos} produto</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
