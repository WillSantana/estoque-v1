import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Loader2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import '../App.css';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  // Estados dos filtros
  const [filters, setFilters] = useState({
    search: '',
    tipo_produto: '',
    marca: '',
    fornecedor: '',
    status_validade: '',
    data_compra_inicio: '',
    data_compra_fim: '',
    data_validade_inicio: '',
    data_validade_fim: '',
    preco_min: '',
    preco_max: '',
    quantidade_min: '',
    quantidade_max: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [currentPage, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      };

      const data = await productsAPI.getAll(params);
      setProducts(data.results || []);
      setPagination({
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
      });
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1); // Reset para primeira página ao filtrar
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      tipo_produto: '',
      marca: '',
      fornecedor: '',
      status_validade: '',
      data_compra_inicio: '',
      data_compra_fim: '',
      data_validade_inicio: '',
      data_validade_fim: '',
      preco_min: '',
      preco_max: '',
      quantidade_min: '',
      quantidade_max: '',
    });
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productsAPI.delete(id);
        loadProducts(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        setError('Erro ao excluir produto');
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Vencido': 'destructive',
      'Próximo ao vencimento': 'secondary',
      'Atenção': 'outline',
      'OK': 'default',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    );
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

  const totalPages = Math.ceil(pagination.count / 20); // 20 items per page

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-muted-foreground">
            {pagination.count} produto{pagination.count !== 1 ? 's' : ''} encontrado{pagination.count !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button asChild>
            <Link to="/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Busca Geral</Label>
                <Input
                  id="search"
                  placeholder="Buscar por tipo, marca, fornecedor..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_produto">Tipo do Produto</Label>
                <Input
                  id="tipo_produto"
                  placeholder="Ex: Ração"
                  value={filters.tipo_produto}
                  onChange={(e) => handleFilterChange('tipo_produto', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  placeholder="Ex: Royal Canin"
                  value={filters.marca}
                  onChange={(e) => handleFilterChange('marca', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  placeholder="Ex: Distribuidora ABC"
                  value={filters.fornecedor}
                  onChange={(e) => handleFilterChange('fornecedor', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Status de Validade</Label>
                <Select
                  value={filters.status_validade}
                  onValueChange={(value) => handleFilterChange('status_validade', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="proximo_vencimento">Próximo ao vencimento</SelectItem>
                    <SelectItem value="atencao">Atenção</SelectItem>
                    <SelectItem value="ok">OK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_compra_inicio">Data Compra (De)</Label>
                <Input
                  id="data_compra_inicio"
                  type="date"
                  value={filters.data_compra_inicio}
                  onChange={(e) => handleFilterChange('data_compra_inicio', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_compra_fim">Data Compra (Até)</Label>
                <Input
                  id="data_compra_fim"
                  type="date"
                  value={filters.data_compra_fim}
                  onChange={(e) => handleFilterChange('data_compra_fim', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco_min">Preço Mínimo</Label>
                <Input
                  id="preco_min"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.preco_min}
                  onChange={(e) => handleFilterChange('preco_min', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco_max">Preço Máximo</Label>
                <Input
                  id="preco_max"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.preco_max}
                  onChange={(e) => handleFilterChange('preco_max', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagens de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabela de produtos */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum produto encontrado</p>
              <Button asChild>
                <Link to="/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Produto
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Peso (kg)</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data Compra</TableHead>
                    <TableHead>Data Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.tipo_produto}
                      </TableCell>
                      <TableCell>{product.marca}</TableCell>
                      <TableCell>{product.quantidade}</TableCell>
                      <TableCell>{product.peso}</TableCell>
                      <TableCell>{formatCurrency(product.preco)}</TableCell>
                      <TableCell>{product.fornecedor}</TableCell>
                      <TableCell>{formatDate(product.data_compra)}</TableCell>
                      <TableCell>{formatDate(product.data_validade)}</TableCell>
                      <TableCell>
                        {getStatusBadge(product.status_validade)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.previous}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.next}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

