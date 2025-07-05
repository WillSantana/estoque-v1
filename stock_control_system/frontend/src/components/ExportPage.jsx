import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { api } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Download, 
  FileText, 
  FileArchive, 
  Loader2, 
  Filter, 
  Calendar, 
  Settings, 
  Info, 
  Clock,
  FileUp,
  CheckCircle,
  AlertTriangle,
  FileJson
} from 'lucide-react';

// --- Subcomponentes ---

const ExportOptions = ({ onExport, loading }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Opções de Exportação</CardTitle>
      <CardDescription>Escolha o formato desejado para exportar seus dados</CardDescription>
    </CardHeader>
    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Button 
        className="h-24 flex-col gap-2 bg-green-600 hover:bg-green-700 text-white"
        onClick={() => onExport('csv')}
        disabled={loading}
      >
        <FileText size={24} />
        <div className="text-left">
          <p className="font-bold">Exportar CSV</p>
          <p className="text-xs font-light">Planilha simples</p>
        </div>
      </Button>
      <Button 
        className="h-24 flex-col gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => onExport('xlsx')}
        disabled={loading}
      >
        <FileUp size={24} />
        <div className="text-left">
          <p className="font-bold">Exportar Excel</p>
          <p className="text-xs font-light">Formato .xlsx</p>
        </div>
      </Button>
      <Button 
        className="h-24 flex-col gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        onClick={() => onExport('json')}
        disabled={loading}
      >
        <FileJson size={24} />
        <div className="text-left">
          <p className="font-bold">Backup Completo</p>
          <p className="text-xs font-light">Arquivo JSON</p>
        </div>
      </Button>
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
                    {formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: ptBR })}
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

const Sidebar = ({ stats, config, setConfig }) => (
  <div className="space-y-6">
    {/* Configurações */}
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><Settings size={20} /> Configurações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-backup" className="cursor-pointer">
            <p>Backup Automático</p>
            <p className="text-xs text-gray-500">Backup semanal dos dados</p>
          </Label>
          <Switch id="auto-backup" checked={config.autoBackup} onCheckedChange={(c) => setConfig('autoBackup', c)} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="compression" className="cursor-pointer">
            <p>Compressão</p>
            <p className="text-xs text-gray-500">Reduzir tamanho dos arquivos</p>
          </Label>
          <Switch id="compression" checked={config.compression} onCheckedChange={(c) => setConfig('compression', c)} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="include-images" className="cursor-pointer">
            <p>Incluir Imagens</p>
            <p className="text-xs text-gray-500">Exportar arquivos anexados</p>
          </Label>
          <Switch id="include-images" checked={config.includeImages} onCheckedChange={(c) => setConfig('includeImages', c)} />
        </div>
      </CardContent>
    </Card>

    {/* Status */}
    <Card>
      <CardHeader><CardTitle className="text-lg">Status do Sistema</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-medium text-green-800 flex items-center gap-2"><CheckCircle size={16} /> Dados Seguros</p>
          <span className="text-xs font-bold text-green-800 bg-green-200 px-2 py-0.5 rounded-full">OK</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-800 flex items-center gap-2"><FileArchive size={16} /> Backup Habilitado</p>
          <span className="text-xs font-bold text-blue-800 bg-blue-200 px-2 py-0.5 rounded-full">Ativo</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm font-medium text-yellow-800 flex items-center gap-2"><Clock size={16} /> Último Backup</p>
          <span className="text-xs font-bold text-yellow-800">7 dias atrás</span>
        </div>
        <div className="p-3 mt-2 bg-blue-50 text-blue-700 rounded-md text-sm flex items-start gap-2">
          <Info size={20} className="flex-shrink-0 mt-0.5" />
          <p>Recomendamos fazer backup dos dados semanalmente e manter cópias em locais seguros.</p>
        </div>
      </CardContent>
    </Card>

    {/* Informações */}
    <Card>
      <CardHeader><CardTitle className="text-lg">Informações dos Dados</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between"><span>Produtos totais:</span> <span className="font-bold">{stats.total}</span></div>
        <div className="flex justify-between"><span>Produtos filtrados:</span> <span className="font-bold">{stats.filtered}</span></div>
        <div className="flex justify-between"><span>Marcas únicas:</span> <span className="font-bold">{stats.brands}</span></div>
        <div className="flex justify-between"><span>Fornecedores:</span> <span className="font-bold">{stats.suppliers}</span></div>
      </CardContent>
    </Card>
  </div>
);


// --- Componente Principal ---

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
  
  const [config, setConfigState] = useState({
    autoBackup: false,
    compression: true,
    includeImages: false,
  });

  // Dados carregados da API para filtros, histórico e stats
  const [data, setData] = useState({
    brands: [],
    suppliers: [],
    types: [],
    history: [],
    stats: { total: 0, filtered: 0, brands: 0, suppliers: 0 }
  });

  // Carrega dados ao montar o componente
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const response = await api.get('/api/export/filters/');
        setData(prev => ({
          ...prev,
          brands: response.data.brands,
          suppliers: response.data.suppliers,
          types: response.data.types,
          history: response.data.history || [], // se existir
          stats: response.data.stats,
        }));
      } catch (error) {
        console.error("Erro ao buscar dados para filtros:", error);
        alert("Não foi possível carregar os dados da página.");
      }
    };
    fetchFilterData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleConfigChange = (key, value) => {
    setConfigState(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async (format) => {
    setLoading(true);
    try {
      const response = await api.post('/api/export/', {
        format: format,
        filters: filters,
      }, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let fileName = `export.${format}`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(`Erro ao exportar para ${format}:`, error);
      alert(`Falha ao gerar o arquivo ${format.toUpperCase()}. Verifique o console para mais detalhes.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        {/* Card de Filtros */}
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
              {data.stats.filtered} produtos
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
              <div className="space-y-2">
                <Label>Marca</Label>
                <Select value={filters.brand} onValueChange={(v) => handleFilterChange('brand', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as marcas</SelectItem>
                    {data.brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select value={filters.supplier} onValueChange={(v) => handleFilterChange('supplier', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os fornecedores</SelectItem>
                    {data.suppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Produto</Label>
                <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {data.types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
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

      <div className="lg:col-span-1">
        <Sidebar stats={data.stats} config={config} setConfig={handleConfigChange} />
      </div>
    </div>
  );
}
