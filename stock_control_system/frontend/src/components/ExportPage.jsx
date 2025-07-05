import { useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from './ui/card';
import { Button } from './ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { api } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Download, FileText, FileArchive, FileUp, FileJson,
  Filter, Calendar, Clock
} from 'lucide-react';

const ExportOptions = ({ onExport, loading }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Opções de Exportação</CardTitle>
      <CardDescription>Escolha o formato desejado para exportar seus dados</CardDescription>
    </CardHeader>
    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {['csv', 'xlsx', 'json'].map((format) => {
        const config = {
          csv: { icon: <FileText size={24} />, bg: 'bg-green-600', hover: 'hover:bg-green-700', title: 'CSV', subtitle: 'Planilha simples' },
          xlsx: { icon: <FileUp size={24} />, bg: 'bg-blue-600', hover: 'hover:bg-blue-700', title: 'Excel', subtitle: 'Formato .xlsx' },
          json: { icon: <FileJson size={24} />, bg: 'bg-orange-500', hover: 'hover:bg-orange-600', title: 'Backup', subtitle: 'Arquivo JSON' },
        }[format];

        return (
          <Button
            key={format}
            className={`h-24 flex-col gap-2 text-white ${config.bg} ${config.hover}`}
            onClick={() => onExport(format)}
            disabled={loading}
          >
            {config.icon}
            <div className="text-left">
              <p className="font-bold">Exportar {config.title}</p>
              <p className="text-xs font-light">{config.subtitle}</p>
            </div>
          </Button>
        );
      })}
    </CardContent>
  </Card>
);

const ExportHistory = ({ history }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Clock size={20} /> Histórico de Exportações
      </CardTitle>
      <CardDescription>Últimas exportações realizadas</CardDescription>
    </CardHeader>
    <CardContent>
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileArchive size={40} className="mx-auto mb-2" />
          <p className="font-semibold">Nenhuma exportação realizada ainda</p>
          <p className="text-sm">Seus exports aparecerão aqui</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {history.map(item => (
            <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="text-gray-400" />
                <div>
                  <p className="font-medium">{item.filename}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(item.date), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download size={16} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    period: 'all',
    brand: 'all',
    supplier: 'all',
    type: 'all',
    includeExpired: true,
    includeObservations: true,
  });

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const urlToFetch = 'export/filters/';
        console.debug("DEBUG: URL sendo solicitada:", api.defaults.baseURL + urlToFetch);
        const response = await api.get(urlToFetch);
        setData({
          brands: response.data.brands || [],
          suppliers: response.data.suppliers || [],
          types: response.data.types || [],
          history: response.data.history || [],
          stats: response.data.stats || { total: 0, filtered: 0 },
        });
      } catch (error) {
        console.error("Erro ao buscar dados para filtros:", error);
        alert("Não foi possível carregar os dados da página.");
        setData({
          brands: [],
          suppliers: [],
          types: [],
          history: [],
          stats: { total: 0, filtered: 0 },
        });
      }
    };
    fetchFilterData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async (format) => {
    setLoading(true);
    try {
      const response = await api.post('export/filters/', {
        format,
        filters,
      }, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let fileName = `export.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) fileName = match[1];
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Erro ao exportar para ${format}:`, error);
      alert(`Falha ao gerar o arquivo ${format.toUpperCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>Carregando filtros e histórico...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={20} />
              <div>
                <CardTitle className="text-lg">Filtros de Exportação</CardTitle>
                <CardDescription>Configure os filtros para personalizar sua exportação</CardDescription>
              </div>
            </div>
            <span className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
              {data.stats.filtered ?? 0} produtos
            </span>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label><Calendar size={14} className="inline mr-1" /> Período de Cadastro</Label>
              <Select value={filters.period} onValueChange={(v) => handleFilterChange('period', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o período" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="last7">Últimos 7 dias</SelectItem>
                  <SelectItem value="last30">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Marca', key: 'brand', options: data.brands },
                { label: 'Fornecedor', key: 'supplier', options: data.suppliers },
                { label: 'Tipo de Produto', key: 'type', options: data.types },
              ].map(({ label, key, options }) => (
                <div className="space-y-2" key={key}>
                  <Label>{label}</Label>
                  <Select value={filters[key]} onValueChange={(v) => handleFilterChange(key, v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {options
                        .filter(opt => typeof opt === 'string' && opt.trim() !== '')
                        .map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4">
              <Label>Opções de Exportação</Label>
              <div className="flex items-center space-x-2">
                <Checkbox id="includeExpired" checked={filters.includeExpired} onCheckedChange={(c) => handleFilterChange('includeExpired', c)} />
                <Label htmlFor="includeExpired" className="font-normal">Incluir produtos vencidos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="includeObservations" checked={filters.includeObservations} onCheckedChange={(c) => handleFilterChange('includeObservations', c)} />
                <Label htmlFor="includeObservations" className="font-normal">Incluir campo de observações</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <ExportOptions onExport={handleExport} loading={loading} />
        <ExportHistory history={data.history} />
      </div>
    </div>
  );
}
